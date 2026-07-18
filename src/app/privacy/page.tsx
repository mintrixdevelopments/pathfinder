import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-neutral-900">
      <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-900">&larr; Back to Pathfinder</Link>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-neutral-500">Last updated {new Date().toLocaleDateString()}</p>

      <div className="mt-8 flex flex-col gap-7 text-sm leading-relaxed text-neutral-700">
        <p>
          Pathfinder is built and operated by Mintrix Developments ("we," "our," "us").
          This policy explains, in plain language, what information Pathfinder collects,
          why, and how you can control it. Pathfinder is currently in early alpha, so
          this policy will keep evolving alongside the product — check back as we grow.
        </p>

        <div>
          <h2 className="text-base font-semibold text-neutral-900">1. Information we collect</h2>
          <p className="mt-2">When you sign in with Google, we receive your name, email address, and profile picture from Google's OAuth service. We never see or store your Google password. If you create an email and password account, we store your name, email address, verification status, and a salted one-way password hash. We never store your readable password.</p>
          <p className="mt-2">When you use the chat, we process the text you type — your build prompts and conversation history — in order to generate responses and build plans.</p>
          <p className="mt-2">For account security, we may process your IP address, approximate location, browser, device type, and sign-in time to identify new browsers and send security notifications.</p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-neutral-900">2. How your prompts are processed</h2>
          <p className="mt-2">
            Your build prompts are sent to Google's Gemini API to generate a plan or
            reply. Under Google's free-tier terms, prompt data may be used by Google to
            improve their models. We do not control this and recommend avoiding
            sensitive personal information in your prompts while Pathfinder is in
            alpha and on the free tier. We plan to move to a paid, more private tier
            as Pathfinder grows.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-neutral-900">3. Browser and server storage</h2>
          <p className="mt-2">
            Pathfinder uses browser storage for initiatives, build history, pending referral codes,
            and a random device identifier. Account records, server-enforced AI usage,
            referral rewards, verification tokens, and security-device records are stored
            in Upstash Redis. Security and recovery tokens expire automatically and are
            stored in hashed or single-use form where appropriate.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-neutral-900">4. What we don't do</h2>
          <p className="mt-2">We don't sell your data. We don't share it with advertisers. We don't use it to train our own models without telling you first.</p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-neutral-900">5. Data retention</h2>
          <p className="mt-2">
            Account and session data persists as long as your account is active.
            Chat history in the current version lives only in your browser session and
            is not yet persisted server-side — this will change as we build out
            project storage in a later phase, and this policy will be updated
            accordingly before that happens.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-neutral-900">6. Children's privacy</h2>
          <p className="mt-2">Pathfinder is not directed at children under 13, and we don't knowingly collect data from them. If you believe a child has used Pathfinder, contact us and we'll remove the account.</p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-neutral-900">7. Security</h2>
          <p className="mt-2">We rely on established providers including Google OAuth, Vercel, Upstash, and Resend for authentication, hosting, data storage, and transactional email delivery. Passwords are protected using salted, deliberately slow one-way hashing. As an early-stage alpha product, no system is perfectly secure — please avoid submitting sensitive personal or financial information through Pathfinder.</p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-neutral-900">8. Your rights</h2>
          <p className="mt-2">
            You can request deletion of your account and associated data at any time
            by contacting <a href="mailto:hello@pathfinder.dev" className="text-neutral-900 underline">hello@pathfinder.dev</a>.
            If you're in a region with specific data rights (e.g. GDPR, CCPA), we'll honor applicable access, correction, and deletion requests.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-neutral-900">9. Changes to this policy</h2>
          <p className="mt-2">We'll update the "last updated" date above whenever this policy changes, and for material changes, we'll aim to notify active users directly.</p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-neutral-900">10. Contact</h2>
          <p className="mt-2">Questions? Reach us at <a href="mailto:hello@pathfinder.dev" className="text-neutral-900 underline">hello@pathfinder.dev</a>.</p>
        </div>
      </div>
    </div>
  );
}
