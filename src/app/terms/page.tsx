import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-neutral-900">
      <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-900">&larr; Back to Pathfinder</Link>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-neutral-500">Last updated {new Date().toLocaleDateString()}</p>

      <div className="mt-8 flex flex-col gap-7 text-sm leading-relaxed text-neutral-700">
        <p>By creating an account or using Pathfinder, you agree to these terms. Pathfinder is built and operated by Mintrix Developments.</p>

        <div>
          <h2 className="text-base font-semibold text-neutral-900">1. Early access / alpha status</h2>
          <p className="mt-2">
            Pathfinder is in active early-stage development. Features, pricing, and
            usage limits may change, break, or be removed without notice. AI-generated
            build plans are provided "as is," without warranty that they are complete,
            error-free, or production-ready.
          </p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-neutral-900">2. Eligibility</h2>
          <p className="mt-2">You must be at least 13 years old to create a Pathfinder account. By signing up, you confirm you meet this requirement.</p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-neutral-900">3. Your account</h2>
          <p className="mt-2">You're responsible for activity under your account and for keeping your password secure. Don't share your login, or attempt to access another user's account, initiatives, or build data. Contact us promptly if you believe your account has been accessed without permission.</p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-neutral-900">4. Acceptable use</h2>
          <p className="mt-2">You agree not to use Pathfinder to:</p>
          <ul className="mt-2 list-disc pl-5">
            <li>Generate content that violates Roblox's Community Standards</li>
            <li>Request hateful, harassing, sexually explicit, or illegal content</li>
            <li>Attempt to generate malware, cheats, or exploits targeting other players or platforms</li>
            <li>Abuse, spam, or overload our systems, including circumventing usage limits</li>
            <li>Reverse-engineer or resell access to the service</li>
          </ul>
          <p className="mt-2">We may suspend or terminate accounts that violate these terms.</p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-neutral-900">5. Usage limits</h2>
          <p className="mt-2">Pathfinder currently enforces a daily limit on AI generations per user to keep the service sustainable during alpha. Limits may change as we grow.</p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-neutral-900">6. Your content</h2>
          <p className="mt-2">You retain full ownership of the Roblox projects, assets, and games you build using Pathfinder. We claim no ownership over your game or its content.</p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-neutral-900">7. Third-party services</h2>
          <p className="mt-2">Pathfinder relies on third-party services including Google (authentication and Gemini AI), Vercel (hosting), Upstash (server data), and Resend (transactional email). Your use of Pathfinder is also subject to those providers' own terms where applicable.</p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-neutral-900">8. Disclaimer of warranties</h2>
          <p className="mt-2">Pathfinder is provided "as is" and "as available," without warranties of any kind, express or implied, including fitness for a particular purpose or non-infringement.</p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-neutral-900">9. Limitation of liability</h2>
          <p className="mt-2">Pathfinder is built by a small independent team. To the extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from your use of the service, including issues in AI-generated plans or code.</p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-neutral-900">10. Changes to these terms</h2>
          <p className="mt-2">We may update these terms as Pathfinder develops. We'll update the "last updated" date above and, for significant changes, aim to notify active users.</p>
        </div>

        <div>
          <h2 className="text-base font-semibold text-neutral-900">11. Contact</h2>
          <p className="mt-2">Questions about these terms? Reach us at <a href="mailto:hello@pathfinder.dev" className="text-neutral-900 underline">hello@pathfinder.dev</a>.</p>
        </div>
      </div>
    </div>
  );
}
