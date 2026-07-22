import crypto from "node:crypto";

import { googleOAuthClient } from "./config/google-oauth-client";
import { gmailRepository } from "./gmail.repository";
import { google } from "googleapis";

import { prisma } from "../../infrastructure/database/prisma";


type HandleCallbackInput = {
  code: string;
  state: string;
};
const GMAIL_READONLY_SCOPE =
  "https://www.googleapis.com/auth/gmail.readonly";

const OPENID_SCOPE = "openid";
const EMAIL_SCOPE =
  "https://www.googleapis.com/auth/userinfo.email";

export const gmailService = {
  async connect(userId: number): Promise<string> {
    const state = crypto
      .randomBytes(32)
      .toString("hex");

    await gmailRepository.createOAuthState({
      state,
      userId,
      expiresAt: new Date(
        Date.now() + 10 * 60 * 1000,
      ),
    });

    return googleOAuthClient.generateAuthUrl({
      access_type: "offline",
      include_granted_scopes: true,
      prompt: "consent",

      scope: [
        GMAIL_READONLY_SCOPE,
        OPENID_SCOPE,
        EMAIL_SCOPE,
      ],

      state,
    });
  },

  async handleCallback({
    code,
    state,
  }: HandleCallbackInput): Promise<void> {
    // 1. State prüfen
    const oauthState =
      await gmailRepository.findValidOAuthState(
        state,
      );

    if (!oauthState) {
      throw new Error(
        "Ungültiger oder abgelaufener OAuth-State.",
      );
    }

    // 2. Authorization Code gegen Tokens tauschen
    const { tokens } =
      await googleOAuthClient.getToken(code);

    if (!tokens.access_token) {
      throw new Error(
        "Google hat keinen Access Token zurückgegeben.",
      );
    }

    // 3. Tokens vorübergehend am OAuth-Client setzen
    googleOAuthClient.setCredentials(tokens);

    // 4. Google-Konto abrufen
    const oauth2Client = google.oauth2({
      version: "v2",
      auth: googleOAuthClient,
    });

    const { data: googleUser } =
      await oauth2Client.userinfo.get();

    if (!googleUser.id) {
      throw new Error(
        "Google-Konto-ID konnte nicht ermittelt werden.",
      );
    }
    const providerAccountId = googleUser.id;

    if (!providerAccountId) {
      throw new Error(
        "Google-Konto-ID konnte nicht ermittelt werden.",
      );
    }
    // 5. Verbindung speichern und State löschen
    await prisma.$transaction(async (tx) => {
      await gmailRepository.upsertConnection(
        {
          userId: oauthState.user_id,
          providerAccountId: providerAccountId,
          accessToken:
            tokens.access_token ?? null,
          refreshToken:
            tokens.refresh_token ?? null,
          tokenExpiresAt: tokens.expiry_date
            ? new Date(tokens.expiry_date)
            : null,
        },
        tx,
      );

      await gmailRepository.deleteOAuthState(
        state,
        tx,
      );
    });
  },

  async getConnectionStatus(userId: number) {
    const connection =
      await gmailRepository.findGmailConnectionByUserId(
        userId,
      );

    const connected =
      Boolean(connection?.refresh_token);

    return {
      connected,
      accessTokenAvailable:
        Boolean(connection?.access_token),
      tokenExpiresAt:
        connection?.token_expires_at ?? null,
    };
  }
};