/**
 * LinkedIn OAuth Authentication Utility
 *
 * Handles LinkedIn OAuth 2.0 authentication flow
 * Uses credentials from .env file
 */

const LINKEDIN_CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID!;
const LINKEDIN_SCOPE = "openid profile email";

// Get redirect URI from environment or construct it
function getRedirectUri(): string {
  // Use environment variable if set, otherwise construct from window.location
  if (process.env.NEXT_PUBLIC_LINKEDIN_REDIRECT_URI) {
    return process.env.NEXT_PUBLIC_LINKEDIN_REDIRECT_URI;
  }

  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/linkedin/callback`;
  }

  return "http://localhost:3000/api/linkedin/callback";
}

/**
 * Generate LinkedIn OAuth authorization URL
 */
export function getLinkedInAuthUrl(): string {
  const state = generateRandomState();
  const redirectUri = getRedirectUri();

  // Store state in sessionStorage for verification
  if (typeof window !== "undefined") {
    sessionStorage.setItem("linkedin_oauth_state", state);
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: LINKEDIN_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: LINKEDIN_SCOPE,
    state: state,
  });

  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
}

/**
 * Generate random state for CSRF protection
 */
function generateRandomState(): string {
  const array = new Uint32Array(28);
  crypto.getRandomValues(array);
  return Array.from(array, (dec) => ("0" + dec.toString(16)).slice(-2)).join(
    ""
  );
}

/**
 * Exchange authorization code for LinkedIn profile via server-side API
 * This avoids CORS issues and keeps the client secret secure
 */
export async function getLinkedInProfile(code: string) {
  console.log("Calling exchange API with code:", code.substring(0, 20) + "...");

  const response = await fetch("/api/linkedin/exchange", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });

  console.log("Exchange API response status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Exchange API error response:", errorText);
    let error;
    try {
      error = JSON.parse(errorText);
    } catch {
      error = { error: errorText };
    }
    throw new Error(
      error.error ||
        `Failed to exchange authorization code (${response.status})`
    );
  }

  const data = await response.json();
  console.log("Exchange API success:", data);
  return data.profile;
}

/**
 * Verify OAuth state to prevent CSRF attacks
 */
export function verifyOAuthState(state: string): boolean {
  if (typeof window === "undefined") return false;

  const savedState = sessionStorage.getItem("linkedin_oauth_state");
  sessionStorage.removeItem("linkedin_oauth_state");

  return savedState === state;
}
