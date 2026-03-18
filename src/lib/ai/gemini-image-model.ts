export type GeminiImageVariant = "nano" | "nano2" | "nanoPro";

export function getGeminiImageModel(variant: GeminiImageVariant): string {
  switch (variant) {
    case "nano2":
      // Nano Banana 2 – Gemini 3.1 Flash Image Preview
      return (
        process.env.GEMINI_IMAGE_MODEL_NANO_2?.trim() ||
        "gemini-3.1-flash-image-preview"
      );
    case "nanoPro":
      // Nano Banana Pro – Gemini 3 Pro Image Preview
      return (
        process.env.GEMINI_IMAGE_MODEL_NANO_PRO?.trim() ||
        "gemini-3-pro-image-preview"
      );
    case "nano":
    default:
      // Nano Banana – Gemini 2.5 Flash Image
      return (
        process.env.GEMINI_IMAGE_MODEL_NANO?.trim() ||
        process.env.GEMINI_IMAGE_MODEL?.trim() ||
        "gemini-2.5-flash-image"
      );
  }
}

