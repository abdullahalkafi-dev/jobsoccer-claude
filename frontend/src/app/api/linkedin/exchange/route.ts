import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side API route to exchange LinkedIn authorization code for access token
 * This prevents CORS issues and keeps the client secret secure
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: "Authorization code is required" },
        { status: 400 }
      );
    }

    const redirectUri =
      process.env.NEXT_PUBLIC_LINKEDIN_REDIRECT_URI ||
      `${request.nextUrl.origin}/api/linkedin/callback`;

    // Exchange code for access token
    const tokenResponse = await fetch(
      "https://www.linkedin.com/oauth/v2/accessToken",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code,
          client_id: process.env.NEXT_PUBLIC_CLIENT_ID!,
          client_secret: process.env.NEXT_PUBLIC_PRIMARY_CLIENT_SECRET!,
          redirect_uri: redirectUri,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("LinkedIn token exchange failed with status", tokenResponse.status);
      return NextResponse.json(
        {
          error:
            tokenData.error_description ||
            tokenData.error ||
            "Failed to exchange code for token",
        },
        { status: tokenResponse.status }
      );
    }

    // Fetch user profile
    const profileResponse = await fetch(
      "https://api.linkedin.com/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    if (!profileResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch user profile" },
        { status: profileResponse.status }
      );
    }

    const profile = await profileResponse.json();

    return NextResponse.json({
      success: true,
      profile: {
        email: profile.email,
        firstName: profile.given_name,
        lastName: profile.family_name,
        picture: profile.picture,
      },
    });
  } catch (error) {
    console.error("Token exchange error:", error);
    return NextResponse.json(
      { error: "Internal server error during token exchange" },
      { status: 500 }
    );
  }
}
