import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — GenContent AI",
  description: "How GenContent AI collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  const updated = "March 16, 2026";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800 bg-slate-950/90 sticky top-0 z-10 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-bold bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
            GenContent AI
          </Link>
          <nav className="flex gap-4 text-sm text-slate-400">
            <Link href="/terms" className="hover:text-slate-200">Terms</Link>
            <Link href="/blog" className="hover:text-slate-200">Blog</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-2 text-3xl font-bold text-slate-50">Privacy Policy</h1>
        <p className="mb-8 text-sm text-slate-500">Last updated: {updated}</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-slate-300">
          <section>
            <h2 className="text-lg font-semibold text-slate-100">1. Information we collect</h2>
            <p>We collect information you provide directly, including:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Account data:</strong> name, email address, and password when you sign up.</li>
              <li><strong>Newsletter subscribers:</strong> email address, name, and optionally phone number when you subscribe.</li>
              <li><strong>Usage data:</strong> newsletter opens, clicks, and delivery events (via webhook) to provide analytics.</li>
              <li><strong>Uploaded media:</strong> images uploaded to the media library are stored in our database.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-100">2. How we use your information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To send newsletters and blog updates you have opted in to receive.</li>
              <li>To generate AI content using your prompts (via OpenAI, Google Gemini).</li>
              <li>To send you WhatsApp messages if you opted in.</li>
              <li>To provide analytics on how your audience engages with content.</li>
              <li>To authenticate your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-100">3. Data sharing</h2>
            <p>We do not sell your personal data. We share data only with service providers necessary to operate the platform:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Resend</strong> — email delivery.</li>
              <li><strong>OpenAI / Google</strong> — AI content generation (only the prompt content you enter).</li>
              <li><strong>Neon</strong> — database hosting.</li>
              <li><strong>Vercel</strong> — application hosting.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-100">4. Your rights (GDPR / CCPA)</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Access</strong> a copy of the personal data we hold about you.</li>
              <li><strong>Rectify</strong> inaccurate data.</li>
              <li><strong>Erase</strong> your data (right to be forgotten).</li>
              <li><strong>Object</strong> to processing or withdraw consent.</li>
              <li><strong>Export</strong> your subscriber data — see your account settings.</li>
            </ul>
            <p className="mt-2">To exercise these rights, email us at the contact address below.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-100">5. Data retention</h2>
            <p>Subscriber data is retained until you unsubscribe or request deletion. Account data is retained until the account is deleted. Email logs are retained for 12 months.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-100">6. Cookies</h2>
            <p>We use a session cookie to keep you logged in to the dashboard. No third-party advertising cookies are used.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-100">7. Contact</h2>
            <p>If you have questions or requests regarding your data, contact us at: <a href="mailto:privacy@gencontent.ai" className="text-cyan-400 hover:underline">privacy@gencontent.ai</a></p>
          </section>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-sm text-slate-500">
          <Link href="/terms" className="hover:text-slate-300">Terms of Service →</Link>
        </div>
      </main>

      <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} GenContent AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
