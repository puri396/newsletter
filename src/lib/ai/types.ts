/** Input for the newsletter draft generation API. */
export interface GenerateNewsletterInput {
  topic: string;
  tone: string;
  targetAudience: string;
  title?: string;
  referenceLinks?: string[];
  imageReferenceLinks?: string[];
  videoReferenceLinks?: string[];
  aiProvider?: "openai" | "gemini" | "claude";
  aiModel?: string;
}

/** Structured output returned by the AI and by POST /api/ai/generate-newsletter. */
export interface GenerateNewsletterOutput {
  title: string;
  description: string;
  body: string;
  keyPoints: string[];
  imagePrompts?: string[];
  videoPrompts?: string[];
  suggestedImages?: string[];
  suggestedVideos?: string[];
  generatedImages?: string[];
}
