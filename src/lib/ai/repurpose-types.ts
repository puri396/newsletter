/** Input for the content repurposing API (reel script, hooks, CTAs, captions). */
export interface RepurposeInput {
  newsletterBody: string;
}

/** Structured output from repurpose generation. */
export interface RepurposeOutput {
  reelScript: string;
  hooks: string[];
  ctas: string[];
  linkedin: string;
  twitter: string;
  instagram: string;
  hashtags: string[];
}
