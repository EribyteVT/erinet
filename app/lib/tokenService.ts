import { prisma } from "@/app/lib/db";
import { encryptValue, decryptValue } from "@/app/lib/encryption";

interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export async function storeEncryptedTokens(
  guildId: string,
  tokenData: TokenData
): Promise<void> {
  const { accessToken, refreshToken, expiresIn } = tokenData;
  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  // Encrypt access token
  const encryptedAccess = encryptValue(accessToken);

  // Encrypt refresh token
  const encryptedRefresh = encryptValue(refreshToken);

  // Store encrypted access token
  await prisma.encryptedToken.upsert({
    where: {
      guildId_service_tokenType: {
        guildId,
        service: "twitch",
        tokenType: "access",
      },
    },
    create: {
      guildId,
      service: "twitch",
      tokenType: "access",
      encryptedToken: encryptedAccess.encrypted,
      iv: encryptedAccess.iv,
      expiresAt,
    },
    update: {
      encryptedToken: encryptedAccess.encrypted,
      iv: encryptedAccess.iv,
      expiresAt,
    },
  });

  // Store encrypted refresh token
  await prisma.encryptedToken.upsert({
    where: {
      guildId_service_tokenType: {
        guildId,
        service: "twitch",
        tokenType: "refresh",
      },
    },
    create: {
      guildId,
      service: "twitch",
      tokenType: "refresh",
      encryptedToken: encryptedRefresh.encrypted,
      iv: encryptedRefresh.iv,
      expiresAt: null, // Refresh tokens don't expire
    },
    update: {
      encryptedToken: encryptedRefresh.encrypted,
      iv: encryptedRefresh.iv,
    },
  });
}

/**
 * Retrieves and decrypts Twitch tokens for a guild
 */
export async function getDecryptedTokens(guildId: string): Promise<{
  accessToken: string;
  refreshToken: string;
  isAccessTokenExpired: boolean;
}> {
  // Get encrypted tokens from database
  const [accessTokenRecord, refreshTokenRecord] = await Promise.all([
    prisma.encryptedToken.findUnique({
      where: {
        guildId_service_tokenType: {
          guildId,
          service: "twitch",
          tokenType: "access",
        },
      },
    }),
    prisma.encryptedToken.findUnique({
      where: {
        guildId_service_tokenType: {
          guildId,
          service: "twitch",
          tokenType: "refresh",
        },
      },
    }),
  ]);

  if (!accessTokenRecord || !refreshTokenRecord) {
    throw new Error("Tokens not found for this guild");
  }

  // Decrypt both tokens
  const accessToken = decryptValue(
    accessTokenRecord.encryptedToken,
    accessTokenRecord.iv
  );
  const refreshToken = decryptValue(
    refreshTokenRecord.encryptedToken,
    refreshTokenRecord.iv
  );

  // Check if access token is expired
  const isAccessTokenExpired = accessTokenRecord.expiresAt
    ? new Date() > accessTokenRecord.expiresAt
    : true;

  return {
    accessToken,
    refreshToken,
    isAccessTokenExpired,
  };
}

/**
 * Refreshes an expired access token using the refresh token
 */
export async function refreshAccessToken(guildId: string): Promise<string> {
  // Get the refresh token
  const { refreshToken } = await getDecryptedTokens(guildId);

  // Exchange refresh token for new access token
  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.TWITCH_CLIENT_ID!,
      client_secret: process.env.TWITCH_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  const tokenData = await response.json();

  if (!response.ok) {
    throw new Error("Failed to refresh token");
  }

  // Store the new tokens
  await storeEncryptedTokens(guildId, {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresIn: tokenData.expires_in,
  });

  return tokenData.access_token;
}

/**
 * Gets a valid access token, refreshing if needed
 */
export async function getValidAccessToken(guildId: string): Promise<string> {
  try {
    const { accessToken, isAccessTokenExpired } = await getDecryptedTokens(
      guildId
    );

    if (isAccessTokenExpired) {
      return refreshAccessToken(guildId);
    }

    return accessToken;
  } catch (error) {
    console.error("Error getting valid access token:", error);
    throw new Error("Failed to get valid access token");
  }
}
