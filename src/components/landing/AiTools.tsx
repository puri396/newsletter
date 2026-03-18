const TOOLS = [
  {
    label: "AI newsletter drafts",
    description: "Turn a topic into a send-ready newsletter with one prompt.",
  },
  {
    label: "AI blog posts",
    description: "Generate long-form posts that stay on brand and on topic.",
  },
  {
    label: "AI image banners",
    description: "Create on-brand hero images for each campaign automatically.",
  },
] as const;

export function AiTools() {
  return (
    <section className="pt-20 pb-20" 
    style={{
      backgroundColor: "#e4f1eb",
    }}  >
      <div
        className="bg-pattern max-w-[1440px] w-full mx-auto rounded-3xl bg-slate-100 px-5 py-8 sm:px-8 sm:py-9"
        // style={{
        //   backgroundImage: "url('/left-pattern.png')",
        //   backgroundRepeat: "repeat",
        // }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
          AI tools included
        </p>
        <h3 className="mt-3 text-lg font-semibold text-slate-900 sm:text-xl">
          Built-in AI so every campaign starts from a strong draft
        </h3>
        <div className="mt-5 grid gap-5 text-sm text-slate-600 md:grid-cols-3">
          {TOOLS.map((tool) => (
            <div key={tool.label} className="space-y-1.5">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-indigo-700 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                {tool.label}
              </div>
              <p>{tool.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

