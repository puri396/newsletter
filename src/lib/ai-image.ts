import type OpenAI from "openai";
import { InferenceClient } from "@huggingface/inference";

/** DALL-E 3 prompt length limit (conservative). */
const MAX_PROMPT_LENGTH = 4000;

const LEONARDO_API_BASE = "https://cloud.leonardo.ai/api/rest/v1";
const DEFAULT_LEONARDO_MODEL_ID = "b24e16ff-06e3-43eb-8d33-4416c2d75876";

export type GenerateBannerResult =
  | { url: string }
  | { error: string };

interface ImageOptions {
  model?: string;
  lightxOnly?: boolean;
}

const DEFAULT_HF_IMAGE_MODEL = "black-forest-labs/FLUX.1-schnell";

async function generateWithHuggingFace(prompt: string): Promise<GenerateBannerResult> {
  const token = process.env.HUGGINGFACE_API_KEY?.trim();
  if (!token) return { error: "Hugging Face API key is not configured. Set HUGGINGFACE_API_KEY in your .env file." };

  const model = process.env.HF_IMAGE_MODEL?.trim() || DEFAULT_HF_IMAGE_MODEL;

  try {
    const client = new InferenceClient(token);
    const blob = await client.textToImage(
      {
        model,
        inputs: prompt,
      },
      { outputType: "blob" },
    );

    const contentType = blob.type || "image/png";
    const buf = Buffer.from(await blob.arrayBuffer());
    const base64 = buf.toString("base64");
    const mime = contentType.includes("image/") ? contentType.split(";")[0] : "image/png";

    return { url: `data:${mime};base64,${base64}` };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      error:
        message.length > 200
          ? "Hugging Face image generation failed. Please try again."
          : message,
    };
  }
}

const LIGHTX_EXTERNAL_URL =
  "https://api.lightxeditor.com/external/api/v1/text2image";
const LIGHTX_V1_URL = "https://api.lightxeditor.com/v1/text-to-image";

/** Extract image URL or data URL from a parsed LightX-style JSON object. */
function extractImageUrlFromLightXData(data: Record<string, unknown>): string | undefined {
  const getStr = (o: unknown, ...keyPaths: string[]): string | undefined => {
    let current: unknown = o;
    for (const key of keyPaths) {
      if (current == null || typeof current !== "object") return undefined;
      current = (current as Record<string, unknown>)[key];
    }
    return typeof current === "string" && current.length > 0 ? current : undefined;
  };

  let url: string | undefined;

  const topLevel =
    getStr(data, "image_url") ??
    getStr(data, "url") ??
    getStr(data, "imageUrl") ??
    getStr(data, "output_url") ??
    getStr(data, "outputUrl") ??
    getStr(data, "result_url") ??
    getStr(data, "resultUrl") ??
    getStr(data, "generated_image") ??
    getStr(data, "generatedImage") ??
    getStr(data, "output_image") ??
    getStr(data, "outputImage");
  if (topLevel) {
    url =
      topLevel.startsWith("http") || topLevel.startsWith("data:")
        ? topLevel
        : `data:image/png;base64,${topLevel}`;
  }
  const imageStr = getStr(data, "image");
  if (!url && imageStr) {
    url =
      imageStr.startsWith("http") || imageStr.startsWith("data:")
        ? imageStr
        : `data:image/png;base64,${imageStr}`;
  }

  if (!url) {
    const outputStr = data?.output ?? data?.result;
    if (typeof outputStr === "string" && outputStr.length > 0) {
      url = outputStr.startsWith("http")
        ? outputStr
        : outputStr.startsWith("data:")
          ? outputStr
          : /^[A-Za-z0-9+/=]+$/.test(outputStr.replace(/^data:image\/\w+;base64,/, ""))
            ? `data:image/png;base64,${outputStr.replace(/^data:image\/\w+;base64,/, "")}`
            : outputStr;
    }
  }

  if (!url) {
    const nested = data?.data ?? data?.result ?? data?.output;
    if (nested && typeof nested === "object") {
      const obj = nested as Record<string, unknown>;
      url =
        getStr(obj, "url") ??
        getStr(obj, "image_url") ??
        getStr(obj, "imageUrl") ??
        getStr(obj, "output_url") ??
        getStr(obj, "outputUrl");
      if (!url && typeof obj.image === "string" && obj.image) {
        const img = obj.image as string;
        url = img.startsWith("data:") ? img : `data:image/png;base64,${img}`;
      }
    }
  }

  const arr = data?.images ?? data?.output;
  if (!url && Array.isArray(arr) && arr.length > 0) {
    const first = arr[0];
    if (typeof first === "string" && (first.startsWith("http") || first.startsWith("data:"))) {
      url = first;
    } else if (first && typeof first === "object") {
      const obj = first as Record<string, unknown>;
      url =
        getStr(obj, "url") ??
        getStr(obj, "image_url") ??
        getStr(obj, "imageUrl") ??
        getStr(obj, "output_url") ??
        getStr(obj, "outputUrl");
      if (!url && typeof obj.image === "string" && obj.image) {
        const img = obj.image as string;
        url = img.startsWith("data:") ? img : `data:image/png;base64,${img}`;
      }
    }
  }

  if (!url) {
    const raw = data?.image ?? data?.data ?? data?.result;
    if (typeof raw === "string" && raw.length > 0 && !raw.startsWith("http")) {
      const base64 = raw.replace(/^data:image\/\w+;base64,/, "");
      if (/^[A-Za-z0-9+/=]+$/.test(base64)) {
        url = `data:image/png;base64,${base64}`;
      }
    }
  }

  return url;
}

/** Sanitize for dev log: truncate long strings so we don't log base64. */
function sanitizeForLog(obj: unknown): unknown {
  if (typeof obj === "string") {
    if (obj.startsWith("data:image") || obj.length > 80) return `[string len=${obj.length}]`;
    return obj;
  }
  if (Array.isArray(obj)) return obj.map(sanitizeForLog);
  if (obj && typeof obj === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) out[k] = sanitizeForLog(v);
    return out;
  }
  return obj;
}

async function callLightXEndpoint(
  url: string,
  headers: Record<string, string>,
  body: string,
): Promise<{ ok: boolean; status: number; data: Record<string, unknown>; text: string }> {
  const response = await fetch(url, { method: "POST", headers, body });
  const text = await response.text().catch(() => "");
  let data: Record<string, unknown> = {};
  try {
    data = (JSON.parse(text) as Record<string, unknown>) ?? {};
  } catch {
    // leave data empty
  }
  return { ok: response.ok, status: response.status, data, text };
}

async function generateWithLightX(
  prompt: string,
): Promise<GenerateBannerResult> {
  const apiKey = process.env.LIGHTX_API_KEY?.trim();
  if (!apiKey) {
    return { error: "LightX API key is not configured." };
  }

  try {
    let res = await callLightXEndpoint(
      LIGHTX_EXTERNAL_URL,
      {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      JSON.stringify({ textPrompt: prompt }),
    );

    if ((!res.ok && (res.status === 401 || res.status === 404)) || !extractImageUrlFromLightXData(res.data)) {
      const res2 = await callLightXEndpoint(
        LIGHTX_V1_URL,
        {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        JSON.stringify({ prompt, width: 1024, height: 1024 }),
      );
      if (res2.ok && extractImageUrlFromLightXData(res2.data)) {
        res = res2;
      }
    }

    if (!res.ok) {
      const snippet = res.text.slice(0, 200);
      if (res.status === 401 || res.status === 403) {
        return {
          error:
            "LightX authentication failed. Please verify LIGHTX_API_KEY in your environment.",
        };
      }
      if (res.status === 429) {
        return {
          error: "LightX rate limit exceeded. Please wait a moment and try again.",
        };
      }
      return {
        error: `LightX request failed (${res.status}). ${snippet}`.trim(),
      };
    }

    const data = res.data;

    if (data?.success === false || (typeof data?.error === "string" && data.error.length > 0)) {
      const errMsg = typeof data?.error === "string" ? data.error : "LightX returned an error.";
      return { error: errMsg.slice(0, 300) };
    }

    const url = extractImageUrlFromLightXData(data);

    const responseKeys = Object.keys(data).join(", ");
    if (!url && process.env.NODE_ENV === "development" && typeof console !== "undefined") {
      console.info("[LightX] response keys:", responseKeys);
      console.info("[LightX] response (sanitized):", JSON.stringify(sanitizeForLog(data), null, 2));
    }

    if (!url || typeof url !== "string") {
      const hint = responseKeys ? ` Response keys: ${responseKeys}.` : "";
      return {
        error:
          `LightX did not return an image. Please try again with a different prompt.${hint}`,
      };
    }

    return { url };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      error:
        message.length > 200
          ? "LightX image generation failed. Please try again."
          : message,
    };
  }
}

async function generateWithLeonardo(prompt: string): Promise<GenerateBannerResult> {
  const apiKey = process.env.LEONARDO_API_KEY?.trim();
  if (!apiKey) return { error: "Leonardo API key is not configured." };

  const modelId = process.env.LEONARDO_MODEL_ID?.trim() || DEFAULT_LEONARDO_MODEL_ID;
  const headers = {
    accept: "application/json",
    "content-type": "application/json",
    authorization: `Bearer ${apiKey}`,
  } as const;

  const createRes = await fetch(`${LEONARDO_API_BASE}/generations`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      prompt,
      modelId,
      width: 1024,
      height: 768,
      num_images: 1,
      public: false,
    }),
  });

  if (!createRes.ok) {
    const text = await createRes.text().catch(() => "");
    return { error: `Leonardo request failed (${createRes.status}). ${text.slice(0, 140)}`.trim() };
  }

  const createJson = (await createRes.json().catch(() => ({}))) as {
    sdGenerationJob?: { generationId?: string };
  };

  const generationId = createJson.sdGenerationJob?.generationId;
  if (!generationId) {
    return { error: "Leonardo did not return a generationId. Please try again." };
  }

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const getRes = await fetch(`${LEONARDO_API_BASE}/generations/${generationId}`, {
      method: "GET",
      headers: { accept: "application/json", authorization: `Bearer ${apiKey}` },
    });

    if (!getRes.ok) {
      const text = await getRes.text().catch(() => "");
      return { error: `Leonardo fetch failed (${getRes.status}). ${text.slice(0, 140)}`.trim() };
    }

    const getJson = (await getRes.json().catch(() => ({}))) as {
      generations_by_pk?: {
        status?: "PENDING" | "COMPLETE" | "FAILED";
        generated_images?: Array<{ url?: string }>;
      };
    };

    const status = getJson.generations_by_pk?.status;
    const url = getJson.generations_by_pk?.generated_images?.[0]?.url;

    if (status === "COMPLETE" && typeof url === "string" && url) {
      return { url };
    }

    if (status === "FAILED") {
      return { error: "Leonardo generation failed. Please try again." };
    }
  }

  return { error: "Leonardo generation is still processing. Please try again in a moment." };
}

// Keep legacy providers referenced to avoid lint noise while preserving code for quick rollback.
const _legacyImageProviders = { generateWithLightX, generateWithLeonardo };
void _legacyImageProviders;

/**
 * Generate a single banner image using Hugging Face only.
 * Returns a URL (usually a data URL) or an error object.
 * @param _clientOverride - Kept for backward-compatible call sites; ignored.
 */
export async function generateBannerImage(
  prompt: string,
  _clientOverride?: OpenAI,
  _options?: ImageOptions,
): Promise<GenerateBannerResult> {
  const trimmed = prompt.trim();
  if (!trimmed) {
    return { error: "Prompt is required and cannot be empty." };
  }
  if (trimmed.length > MAX_PROMPT_LENGTH) {
    return {
      error: `Prompt must be ${MAX_PROMPT_LENGTH} characters or fewer.`,
    };
  }

  try {
    return await generateWithHuggingFace(trimmed);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("HUGGINGFACE_API_KEY") || message.includes("api_key")) {
      return { error: "Hugging Face image service is not configured. Set HUGGINGFACE_API_KEY in your .env file." };
    }
    if (message.includes("rate") || message.includes("RateLimitError")) {
      return { error: "Too many requests. Please try again in a moment." };
    }
    if (message.includes("content_policy") || message.includes("safety")) {
      return { error: "Image request was rejected. Please try a different prompt." };
    }
    return {
      error: message.length > 200 ? "Image generation failed. Please try again." : message,
    };
  }
}
