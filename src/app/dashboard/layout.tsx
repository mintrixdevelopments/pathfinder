import { auth } from "../../auth";
import { redirect } from "next/navigation";
import { BuildsProvider } from "./builds-context";
import { DashboardShell } from "./dashboard-shell";
import { ReleaseNotes } from "../../components/ReleaseNotes";
import { ReferralRedeemer } from "./referral-redeemer";
import { SecuritySessionRegistrar } from "./security-session-registrar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <BuildsProvider userKey={session.user.email || session.user.name || "pathfinder-user"}>
      <ReleaseNotes />
      <ReferralRedeemer />
      <SecuritySessionRegistrar />
      <DashboardShell user={{ name: session.user.name, email: session.user.email, image: session.user.image }}>
        {children}
      </DashboardShell>
    </BuildsProvider>
  );
}
