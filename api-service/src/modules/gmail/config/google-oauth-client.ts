// gmail/config/google-oauth-client.ts

import { google } from "googleapis";

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_GMAIL_REDIRECT_URI,
} = process.env;

if (
  !GOOGLE_CLIENT_ID ||
  !GOOGLE_CLIENT_SECRET ||
  !GOOGLE_GMAIL_REDIRECT_URI
) {
  throw new Error(
    "Google OAuth environment variables are missing.",
  );
}

export const googleOAuthClient =
  new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_GMAIL_REDIRECT_URI,
  );