const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

/**
 * Redirects user to Google OAuth consent screen.
 * @param state - Identifies the flow: "login", "register", or "booking-calendar"
 * @param extraScopes - Additional scopes beyond openid/email/profile
 */
export function redirectToGoogleAuth(
  state: string,
  extraScopes: string[] = []
) {
  if (!GOOGLE_CLIENT_ID) {
    console.warn("Google Client ID not configured");
    return;
  }

  const baseScopes = ["openid", "email", "profile"];
  const allScopes = [...baseScopes, ...extraScopes];

  const redirectUri = `${window.location.origin}/auth/google/callback`;
  const scope = encodeURIComponent(allScopes.join(" "));

  window.location.href =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${scope}` +
    `&access_type=offline` +
    `&prompt=consent` +
    `&state=${state}`;
}
