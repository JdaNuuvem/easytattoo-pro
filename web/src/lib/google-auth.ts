const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

/**
 * Checks if Google OAuth is configured.
 */
export function isGoogleAuthConfigured(): boolean {
  return !!GOOGLE_CLIENT_ID;
}

/**
 * Redirects user to Google OAuth consent screen.
 * @param state - Identifies the flow: "login", "register", "booking-calendar", or "artist-calendar"
 * @param extraScopes - Additional scopes beyond openid/email/profile
 * @returns true if redirect initiated, false if not configured
 */
export function redirectToGoogleAuth(
  state: string,
  extraScopes: string[] = []
): boolean {
  if (!GOOGLE_CLIENT_ID) {
    return false;
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

  return true;
}
