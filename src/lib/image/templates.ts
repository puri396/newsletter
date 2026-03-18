export interface ImageTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  defaultPrompt: string;
  /** Tailwind-compatible CSS gradient used as the card thumbnail placeholder. */
  exampleStyle: string;
}

export const IMAGE_TEMPLATES: ImageTemplate[] = [
  {
    id: "blank",
    name: "Blank",
    description: "Start with an empty prompt and describe your image freely.",
    category: "General",
    defaultPrompt: "",
    exampleStyle: "linear-gradient(135deg, #27272a 0%, #3f3f46 100%)",
  },
  {
    id: "tech-minimalist",
    name: "Tech Minimalist",
    description: "Clean, minimal illustration perfect for SaaS and tech products.",
    category: "Tech",
    defaultPrompt:
      "Minimal tech illustration, soft blue gradient background, geometric shapes, futuristic but clean, high contrast, no text, 16:9 aspect ratio",
    exampleStyle: "linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%)",
  },
  {
    id: "bold-typography",
    name: "Bold Typography",
    description: "Dark, punchy headline-style design for announcements and launches.",
    category: "Marketing",
    defaultPrompt:
      "Bold headline graphic design, dark charcoal background, large impactful typography layout, accent color neon yellow, modern editorial style, no actual text in image",
    exampleStyle: "linear-gradient(135deg, #18181b 0%, #a16207 100%)",
  },
  {
    id: "gradient-abstract",
    name: "Gradient Abstract",
    description: "Vibrant abstract art with flowing gradients — ideal for social headers.",
    category: "Abstract",
    defaultPrompt:
      "Abstract gradient art, flowing shapes, purple to cyan color palette, smooth organic forms, high resolution, no text, 16:9",
    exampleStyle: "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)",
  },
  {
    id: "editorial-photo",
    name: "Editorial Photo Style",
    description: "Clean editorial magazine aesthetic for professional blog posts.",
    category: "Editorial",
    defaultPrompt:
      "Clean editorial magazine cover style photo, natural lighting, muted warm tones, professional minimal composition, no text overlay, high quality",
    exampleStyle: "linear-gradient(135deg, #78716c 0%, #e7e5e4 100%)",
  },
  {
    id: "data-visualization",
    name: "Data Visualization",
    description: "Infographic-style visuals for newsletters covering stats and insights.",
    category: "Data",
    defaultPrompt:
      "Stylized data visualization infographic, dark background, glowing data points, bar charts and line graphs, teal and orange accent colors, no readable text labels, modern dashboard aesthetic",
    exampleStyle: "linear-gradient(135deg, #0f172a 0%, #0d9488 100%)",
  },
];

export function getImageTemplate(id: string): ImageTemplate | undefined {
  return IMAGE_TEMPLATES.find((t) => t.id === id);
}
