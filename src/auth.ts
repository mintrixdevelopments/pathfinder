import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { authenticateEmailPassword, ensureGoogleUser } from "./lib/accounts";
import { checkRateLimit } from "./lib/rate-limit";
import { normalizeEmail } from "./lib/security";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google,
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = normalizeEmail(String(credentials.email || ""));
        const password = String(credentials.password || "");
        if (!email || !password) return null;

        const limit = await checkRateLimit(`login:${email}`, 10, 15 * 60);
        if (!limit.allowed) return null;

        const user = await authenticateEmailPassword(email, password);
        if (!user) return null;
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        await ensureGoogleUser({ email: user.email, name: user.name });
      }
      return true;
    },
  },
});
