import { auth } from "@/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const HSID_LOGOUT_URL = "https://nonprod.identity.healthsafe-id.com/oidc/logout";

export async function GET() {
  const session = await auth();
  const idToken = session?.user?.idToken;

  // Clear NextAuth session cookie
  const cookieStore = await cookies();
  cookieStore.delete("authjs.session-token");
  cookieStore.delete("__Secure-authjs.session-token");

  // Build HSID logout URL
  const logoutUrl = new URL(HSID_LOGOUT_URL);

  if (idToken) {
    logoutUrl.searchParams.set("id_token_hint", idToken);
  }

  // Redirect back to login after HSID logout
  const postLogoutRedirect = process.env.NEXTAUTH_URL
    ? `${process.env.NEXTAUTH_URL}/login`
    : "/login";
  logoutUrl.searchParams.set("post_logout_redirect_uri", postLogoutRedirect);

  return NextResponse.redirect(logoutUrl.toString());
}
