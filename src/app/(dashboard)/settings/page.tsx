import { CopyableUrl } from "./CopyableUrl";

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-50">Settings</h2>
        <p className="text-sm text-zinc-400">
          Read-only view of workspace and integration status.
        </p>
      </div>

      <section className="space-y-3">
        <h3 className="text-base font-medium text-zinc-200">Integrations</h3>
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
