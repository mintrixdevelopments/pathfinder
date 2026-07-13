import { auth } from "../../auth";
import { redirect } from "next/navigation";
import { BuildsProvider } from "./builds-context";
import { DashboardShell } from "./dashboard-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <BuildsProvider>
      <DashboardShell user={{ name: session.user.name, email: session.user.email, image: session.user.image }}>
        {children}
      </DashboardShell>
    </BuildsProvider>
  );
}
