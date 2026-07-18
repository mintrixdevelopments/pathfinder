import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { authenticateEmailPassword, ensureGoogleUser } from "./lib/accounts";
import { checkRateLimit } from "./lib/rate-limit";
import { normalizeEmail } from "./lib/security";
import { redisGet } from "./lib/redis";

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
        try {
          await ensureGoogleUser({ email: user.email, name: user.name });
        } catch (error) {
          // A temporary Redis problem must not lock users out of Google OAuth.
          console.error("Google account sync failed", error);
        }
      }
      return true;
    },
    async jwt({ token, account }) {
      if (account?.provider) token.pathfinderProvider = account.provider;
      const email = typeof token.email === "string" ? token.email.trim().toLowerCase() : "";
      if (email) {
        try {
          const currentVersion = Number.parseInt((await redisGet(`pf:session-version:${email}`)) || "0", 10) || 0;
          if (account) token.pathfinderSessionVersion = currentVersion;
          const tokenVersion = typeof token.pathfinderSessionVersion === "number" ? token.pathfinderSessionVersion : 0;
          token.pathfinderRevoked = tokenVersion !== currentVersion;
        } catch (error) {
          console.error("Session revocation check failed", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.pathfinderRevoked) {
        session.user = undefined as never;
        return session;
      }
      (session as typeof session & { pathfinderProvider?: string }).pathfinderProvider =
        typeof token.pathfinderProvider === "string" ? token.pathfinderProvider : undefined;
      return session;
    },
  },
});
