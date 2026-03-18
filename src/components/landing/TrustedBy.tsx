const LOGOS = [
  "Neon",
  "Vercel",
  "Notion",
  "Linear",
  "Figma",
  "Stripe",
] as const;

export function TrustedBy() {
  return (
    <section className="max-w-[1440px] w-full mx-auto  pt-10 space-y-4 text-center text-sm text-slate-400 border-t border-slate-700/60 mx-auto mt-5 mb-5">
     

      <div className="relative  overflow-hidden">
        <div className="trusted-by-fade" />
        <div className="trusted-by-track text-xs sm:text-sm text-slate-400">
          {[...LOGOS, ...LOGOS].map((logo, index) => (
            <div
              key={`${logo}-${index}`}
              className="flex items-center gap-3 opacity-70 grayscale hover:opacity-100 hover:grayscale-0 transition duration-200"
            >
              <span className="h-6 w-16 rounded-md bg-slate-700/80" />
              <span className="font-medium tracking-wide text-slate-300">
                {logo}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

