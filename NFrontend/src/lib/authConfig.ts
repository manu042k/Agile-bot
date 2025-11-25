import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Validate environment variables
if (!process.env.GOOGLE_CLIENT_ID) {
  console.error("[NextAuth] GOOGLE_CLIENT_ID is not set");
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
  console.error("[NextAuth] GOOGLE_CLIENT_SECRET is not set");
}
if (!process.env.NEXTAUTH_SECRET) {
  console.error("[NextAuth] NEXTAUTH_SECRET is not set");
}

// Get the base URL for NextAuth callbacks
const getBaseUrl = () => {
  // In production, use NEXTAUTH_URL if set
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  // In development, default to localhost:3000
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }
  // Fallback - NextAuth will try to auto-detect
  return undefined;
};

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account consent", // Force account selection and consent screen
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Validate that we have the required user data
      if (!user.email) {
        console.error("[NextAuth] User email is missing");
        return false;
      }
      
      // Allow sign in - Django sync will happen client-side after session is created
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
    async jwt({ token, account, user, profile }) {
      // Initial sign in
      if (account && user) {
        // Use the Google ID from the account as the user identifier
        token.sub = account.providerAccountId || user.id;
        token.email = user.email ?? (profile as any)?.email ?? undefined;
        token.name = user.name ?? (profile as any)?.name ?? undefined;
        token.picture = user.image ?? (profile as any)?.picture ?? undefined;
        token.accessToken = account.access_token;
      }
      // Token expiration is automatically handled by NextAuth based on maxAge
      return token;
    },
    async redirect({ url, baseUrl }) {
      // Handle redirects properly
      try {
        // If url is relative, make it absolute
        if (url.startsWith("/")) {
          return `${baseUrl}${url}`;
        }
        // If url is on the same origin, allow it
        const urlObj = new URL(url);
        const baseUrlObj = new URL(baseUrl);
        if (urlObj.origin === baseUrlObj.origin) {
          return url;
        }
        // Default to baseUrl
        return baseUrl;
      } catch (error) {
        // If URL parsing fails, return baseUrl
        console.error("[NextAuth] Redirect error:", error);
        return baseUrl;
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt", // Use JWT for NextAuth session
    // Session timeout from environment variable (in seconds)
    // Default: 12 hours (43200 seconds)
    maxAge: parseInt(process.env.NEXTAUTH_SESSION_MAX_AGE || "43200", 10),
    // Session update interval from environment variable (in seconds)
    // Default: 1 hour (3600 seconds) - session is refreshed every hour
    updateAge: parseInt(process.env.NEXTAUTH_SESSION_UPDATE_AGE || "3600", 10),
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development", // Enable debug in development
  // Ensure proper error handling
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log("[NextAuth] Sign in event:", { email: user.email, isNewUser });
    },
    async signOut() {
      console.log("[NextAuth] Sign out event");
    },
    async createUser({ user }) {
      console.log("[NextAuth] User created:", user.email);
    },
    async updateUser({ user }) {
      console.log("[NextAuth] User updated:", user.email);
    },
    async linkAccount({ user, account, profile }) {
      console.log("[NextAuth] Account linked:", user.email);
    },
    async session({ session, token }) {
      console.log("[NextAuth] Session event");
    },
  },
};

