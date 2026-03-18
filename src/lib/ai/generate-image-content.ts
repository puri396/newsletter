import type OpenAI from "openai";
import { generateBannerImage } from "../ai-image";

interface GenerateImageContentInput {
  description: string;
  tone: string;
  targetAudience: string;
  referenceLinks?: string[];
}

interface GenerateImageContentOutput {
  title: string;
  description: string;
  caption: string;
  imagePrompts: string[];
  hashtags?: string[];
  bannerImageUrl?: string;
  /** When image generation failed, reason. */
  imageError?: string;
}

export async function generateImageContent(
  input: GenerateImageContentInput,
  _clientOverride?: OpenAI,
): Promise<GenerateImageContentOutput> {
  const baseDescription = input.description.trim();
  const tone = input.tone.trim().toLowerCase();
  const targetAudience = input.targetAudience.trim();

  const title =
    baseDescription.length > 60
      ? `${baseDescription.slice(0, 57).trim()}…`
      : baseDescription || "Image post";

  const description =
    baseDescription ||
    `An engaging image post for ${targetAudience || "your audience"}.`;

  const caption = `${description}${tone ? ` (Tone: ${tone})` : ""}`.trim();

  const imagePrompts: string[] = [
    `${baseDescription || "high-impact marketing visual"} in a clean, modern style, high resolution, visually striking, suitable for social media.`,
  ];

  let bannerImageUrl: string | undefined;
  let imageError: string | undefined;

  const imgResult = await generateBannerImage(imagePrompts[0]);
  if ("url" in imgResult) {
    bannerImageUrl = imgResult.url;
  } else {
    imageError = imgResult.error;
  }

  return {
    title,
    description,
    caption,
    imagePrompts,
    hashtags: [],
    bannerImageUrl,
    imageError,
  };
}
