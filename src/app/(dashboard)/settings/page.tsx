import { CopyableUrl } from "./CopyableUrl";
import { BrandSettingsForm } from "./BrandSettingsForm";

function envSet(key: string): boolean {
  const v = process.env[key];
  return typeof v === "string" && v.trim().length > 0;
}

export default function SettingsPage() {
  const appUrl =
    process.env.APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "";
  const subscribeUrl = appUrl ? `${appUrl.replace(/\/$/, "")}/subscribe` : "";

  const resendConfigured = envSet("RESEND_API_KEY");
  const openaiConfigured = envSet("OPENAI_API_KEY");
  const adminProtected = envSet("ADMIN_SECRET");
   const geminiConfigured = envSet("GEMINI_API_KEY");
   const openaiFallbackConfigured = envSet("OPENAI_API_KEY_2");
   const whatsappAccessToken = envSet("WHATSAPP_ACCESS_TOKEN");
   const whatsappPhoneId = envSet("WHATSAPP_PHONE_NUMBER_ID");
   const whatsappConfigured = whatsappAccessToken && whatsappPhoneId;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-zinc-50">Settings</h2>
        <p className="text-sm text-zinc-400">
          Manage your brand, integrations, and workspace.
        </p>
      </div>

      {/* Brand settings */}
      <section className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-5">
        <div>
          <h3 className="text-base font-medium text-zinc-200">Brand</h3>
          <p className="mt-0.5 text-xs text-zinc-500">
            These values appear in your email newsletters and previews.
          </p>
        </div>
        <BrandSettingsForm />
      </section>

      {/* GDPR / Data */}
      <section className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-5">
        <div>
          <h3 className="text-base font-medium text-zinc-200">Data & Privacy</h3>
          <p className="mt-0.5 text-xs text-zinc-500">Export your data or review our policies.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href="/api/gdpr/export"
            download
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export my data (JSON)
          </a>
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition"
          >
            Privacy Policy ↗
          </a>
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition"
          >
            Terms of Service ↗
          </a>
        </div>
      </section>

      {/* Integrations */}
      <section className="space-y-3">
        <h3 className="text-base font-medium text-zinc-200">Integrations</h3>
        <p className="text-xs text-zinc-500">
          These rows show which integrations are ready to use in this workspace.
          Green means you can use the feature; grey means you still need to set
          the environment variable.
        </p>
        <dl className="grid gap-2 text-sm">
          <div className="flex justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-950/40 px-4 py-3">
            <dt className="text-zinc-400">Resend (email)</dt>
            <dd>
              <span
                className={
                  resendConfigured
                    ? "text-emerald-400"
                    : "text-zinc-500"
                }
              >
                {resendConfigured ? "Configured" : "Not set"}
              </span>
            </dd>
          </div>
          <div className="flex justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-950/40 px-4 py-3">
            <dt className="text-zinc-400">OpenAI (AI)</dt>
            <dd>
              <span
                className={
                  openaiConfigured
                    ? "text-emerald-400"
                    : "text-zinc-500"
                }
              >
                {openaiConfigured ? "Configured" : "Not set"}
              </span>
            </dd>
          </div>
          <div className="flex justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-950/40 px-4 py-3">
            <dt className="text-zinc-400">Gemini (AI)</dt>
            <dd>
              <span
                className={
                  geminiConfigured ? "text-emerald-400" : "text-zinc-500"
                }
              >
                {geminiConfigured ? "Configured" : "Not set"}
              </span>
            </dd>
          </div>
          <div className="flex justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-950/40 px-4 py-3">
            <dt className="text-zinc-400">OpenAI fallback key</dt>
            <dd>
              <span
                className={
                  openaiFallbackConfigured
                    ? "text-emerald-400"
                    : "text-zinc-500"
                }
              >
                {openaiFallbackConfigured ? "Configured" : "Not set"}
              </span>
            </dd>
          </div>
          <div className="flex justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-950/40 px-4 py-3">
            <dt className="text-zinc-400">Admin protection</dt>
            <dd>
              <span
                className={
                  adminProtected
                    ? "text-amber-400"
                    : "text-zinc-500"
                }
              >
                {adminProtected ? "Enabled" : "Disabled"}
              </span>
            </dd>
          </div>
          <div className="flex justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-950/40 px-4 py-3">
            <dt className="text-zinc-400">WhatsApp</dt>
            <dd>
              <span
                className={
                  whatsappConfigured ? "text-emerald-400" : "text-zinc-500"
                }
              >
                {whatsappConfigured ? "Configured" : "Not set"}
              </span>
            </dd>
          </div>
        </dl>
      </section>

      <section className="space-y-3">
        <h3 className="text-base font-medium text-zinc-200">
          Subscribe page
        </h3>
        <p className="text-sm text-zinc-400">
          Share this link so people can subscribe to your newsletter. Set{" "}
          <code className="rounded bg-zinc-800/80 px-1 text-zinc-300">
            APP_URL
          </code>{" "}
          or{" "}
          <code className="rounded bg-zinc-800/80 px-1 text-zinc-300">
            NEXT_PUBLIC_APP_URL
          </code>{" "}
          for a full URL.
        </p>
        {subscribeUrl ? (
          <div className="space-y-2">
            <CopyableUrl url={subscribeUrl} />
            <p className="text-sm text-zinc-400">
              <a
                href="/subscribe"
                className="text-zinc-300 hover:text-zinc-100 underline"
              >
                Open subscribe page
              </a>{" "}
              (same site).
            </p>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">
            Set APP_URL or NEXT_PUBLIC_APP_URL in your environment to see the
            subscribe URL here.
          </p>
        )}
      </section>
    </div>
  );
}
