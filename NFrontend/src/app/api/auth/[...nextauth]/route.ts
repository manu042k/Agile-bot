import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow sign in - no Django sync needed for now
      return true;
    },
    async session({ session, token }) {
      // Add user ID and other info to session
      if (session.user && token) {
        (session.user as any).id = token.sub as string;
        session.user.email = token.email ?? null;
        session.user.name = token.name ?? null;
        session.user.image = token.picture ?? null;
      }
      return session;
    },
    async jwt({ token, account, user }) {
      // Initial sign in
      if (account && user) {
        token.sub = account.providerAccountId || user.id;
        token.email = user.email ?? undefined;
        token.name = user.name ?? undefined;
        token.picture = user.image ?? undefined;
      }
      // Token expiration is automatically handled by NextAuth based on maxAge
      return token;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt", // Use JWT for NextAuth session
    maxAge: parseInt(process.env.NEXTAUTH_SESSION_MAX_AGE || "43200"), // 12 hours in seconds (default: 43200)
    updateAge: parseInt(process.env.NEXTAUTH_SESSION_UPDATE_AGE || "3600"), // Update session every 1 hour (default: 3600)
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
