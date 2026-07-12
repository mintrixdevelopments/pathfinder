import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-4">
      <a href="/" className="text-lg font-semibold tracking-tight text-neutral-900">
        Pathfinder
      </a>
      <SignIn
        appearance={{
          elements: {
            rootBox: "w-full max-w-sm",
            card: "shadow-none border border-neutral-200 rounded-xl bg-white",
            headerTitle: "text-neutral-900 text-xl font-semibold",
            headerSubtitle: "text-neutral-500 text-sm",
            socialButtonsBlockButton:
              "border border-neutral-200 hover:bg-neutral-50 text-neutral-900",
            dividerLine: "bg-neutral-200",
            dividerText: "text-neutral-400",
            formFieldLabel: "text-neutral-700 text-sm font-medium",
            formFieldInput:
              "bg-white border border-neutral-200 text-neutral-900 rounded-lg focus:border-neutral-400",
            formButtonPrimary:
              "bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg",
            footerActionText: "text-neutral-500",
            footerActionLink: "text-neutral-900 font-medium",
            footer: "hidden",
          },
        }}
      />
    </div>
  );
}
