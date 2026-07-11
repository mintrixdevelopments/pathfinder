import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SignUp
        appearance={{
          variables: {
            colorPrimary: "#6366f1",
            colorBackground: "#0f0f12",
            colorText: "#f4f4f5",
            colorTextSecondary: "#a1a1aa",
            colorInputBackground: "#09090b",
            colorInputText: "#f4f4f5",
            borderRadius: "0.75rem",
          },
          elements: {
            footer: "hidden",
          },
        }}
      />
    </div>
  );
}
