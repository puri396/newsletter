/** Input for image prompt generation (thumbnail/cover ideas from newsletter). */
export interface ImagePromptsInput {
  newsletterBody: string;
}

/** Output: 2–3 text-only prompts suitable for image generation. */
export interface ImagePromptsOutput {
  imagePrompts: string[];
}
