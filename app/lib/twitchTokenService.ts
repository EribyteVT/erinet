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
 * Internal function to retrieve raw encrypted tokens without auto-refreshing
 */
async function getRawTokens(guildId: string): Promise<{
  accessTokenRecord: any;
  refreshTokenRecord: any;
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

  // Check if access token is expired
  const isAccessTokenExpired = accessTokenRecord.expiresAt
    ? new Date() > accessTokenRecord.expiresAt
    : true;

  return {
    accessTokenRecord,
    refreshTokenRecord,
    isAccessTokenExpired,
  };
}

/**
 * Refreshes an expired access token using the refresh token
 */
async function refreshAccessToken(
  guildId: string,
  refreshToken: string
): Promise<string> {
  try {
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

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Twitch token refresh error:", errorData);
      throw new Error(
        `Failed to refresh token: ${errorData.message || response.statusText}`
      );
    }

    const tokenData = await response.json();

    // Store the new tokens
    await storeEncryptedTokens(guildId, {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
    });

    return tokenData.access_token;
  } catch (error) {
    console.error("Error refreshing Twitch access token:", error);
    throw new Error(
      "Failed to refresh Twitch token. Please reconnect your Twitch account."
    );
  }
}

//get decrypt
export async function getDecryptedTokens(guildId: string): Promise<{
  accessToken: string;
  refreshToken: string;
  isAccessTokenExpired: boolean;
}> {
  try {
    // Get the raw token records
    const { accessTokenRecord, refreshTokenRecord, isAccessTokenExpired } =
      await getRawTokens(guildId);

    // Decrypt the refresh token
    const refreshToken = decryptValue(
      refreshTokenRecord.encryptedToken,
      refreshTokenRecord.iv
    );

    let accessToken;

    // If the access token is expired, refresh it automatically
    if (isAccessTokenExpired) {
      try {
        accessToken = await refreshAccessToken(guildId, refreshToken);
      } catch (refreshError) {
        console.error("Error refreshing token:", refreshError);
        // If refresh fails, return the expired token and let the caller handle it
        accessToken = decryptValue(
          accessTokenRecord.encryptedToken,
          accessTokenRecord.iv
        );
      }
    } else {
      // If not expired, just decrypt and return the existing token
      accessToken = decryptValue(
        accessTokenRecord.encryptedToken,
        accessTokenRecord.iv
      );
    }

    return {
      accessToken,
      refreshToken,
      isAccessTokenExpired:
        isAccessTokenExpired &&
        accessToken ===
          decryptValue(accessTokenRecord.encryptedToken, accessTokenRecord.iv),
    };
  } catch (error) {
    console.error("Error in getDecryptedTokens:", error);
    throw error;
  }
}

//refresh
export async function getValidAccessToken(guildId: string): Promise<string> {
  const { accessToken } = await getDecryptedTokens(guildId);
  return accessToken;
}
