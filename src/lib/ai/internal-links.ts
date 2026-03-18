import { getGeminiClient } from "./gemini-client";
import { getOpenAIClient } from "./client";

export interface ExistingPost {
  title: string;
  slug: string;
}

/**
 * Takes a blog body (HTML or plain text) and a list of existing published posts.
 * Returns the same body with 2–4 relevant internal links naturally injected.
 * Falls back to the original body on any error.
 */
export async function injectInternalLinks(
  body: string,
  existingPosts: ExistingPost[],
): Promise<string> {
  if (!existingPosts.length || !body.trim()) return body;

  const postList = existingPosts
    .slice(0, 20)
    .map((p) => `- "${p.title}" → /blog/${p.slug}`)
    .join("\n");

  const systemPrompt =
    "You are an SEO expert specializing in internal linking. " +
    "You receive a blog article body (HTML or plain text) and a list of existing posts. " +
    "Your job is to inject 2-4 relevant internal links into the body where they fit naturally. " +
    "Rules:\n" +
    "1. Only link where the anchor text already exists in the body or a very natural paraphrase exists.\n" +
    "2. Use <a href=\"/blog/SLUG\">anchor text</a> format — never change the URL format.\n" +
    "3. Return ONLY the modified body — no explanation, no JSON, no code fences.\n" +
    "4. If no natural links can be added, return the body unchanged.\n" +
    "5. Do not add more than 4 links. Do not link the same post twice.";

  const userPrompt =
    `Existing posts:\n${postList}\n\n` +
    `Blog body to enhance with internal links:\n\n${body}`;

  try {
    const gemini = getGeminiClient();
    if (gemini) {
      const response = await gemini.models.generateContent({
        model: process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash",
        contents: userPrompt,
        systemInstruction: systemPrompt,
        config: { temperature: 0.2 },
      });

      const text =
        (response as { text?: string }).text?.trim() ??
        (response as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> })
          .candidates?.[0]?.content?.parts?.map((p) => p?.text).filter(Boolean).join("") ??
        "";

      if (text) return text;
    }

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
    });

    const result = completion.choices?.[0]?.message?.content?.trim();
    return result || body;
  } catch {
    // Never break blog generation — return original body
    return body;
  }
}
