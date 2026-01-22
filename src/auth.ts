import NextAuth from "next-auth";
import { getEnterpriseId } from "@/lib/user-service";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    {
      id: "hsid",
      name: "HealthSafe ID",
      type: "oidc",
      issuer: "https://nonprod.identity.healthsafe-id.com",
      clientId: process.env.HSID_CLIENT_ID!,
      authorization: {
        params: {
          scope: "openid profile email",
          code_challenge_method: "S256",
        },
      },
      checks: ["pkce", "state"],
      client: {
        token_endpoint_auth_method: "none",
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: `${profile.given_name ?? ""} ${profile.family_name ?? ""}`.trim() || profile.name,
          email: profile.email,
          firstName: profile.given_name,
          lastName: profile.family_name,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, profile, account }) {
      if (profile) {
        token.sub = profile.sub ?? undefined;
        token.firstName = profile.given_name;
        token.lastName = profile.family_name;

        // Fetch enterpriseId immediately after HSID authentication
        if (profile.sub) {
          try {
            token.enterpriseId = await getEnterpriseId(profile.sub);
          } catch (error) {
            console.error("Failed to fetch enterprise ID:", error);
          }
        }
      }
      // Store id_token for federated logout
      if (account?.id_token) {
        token.idToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.sub = token.sub as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.enterpriseId = token.enterpriseId as string;
        session.user.idToken = token.idToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
