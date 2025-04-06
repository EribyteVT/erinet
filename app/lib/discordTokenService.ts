import { prisma } from "@/app/lib/db";
import { encryptValue, decryptValue } from "@/app/lib/encryption";

export async function storeDiscordToken(
  userId: string,
  accessToken: string,
  expiresIn: number = 604800, // Default 1 week in seconds
  type: string = "access", // Default access token
  refreshToken?: string
): Promise<void> {
  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  // Encrypt the token
  const encryptedData = encryptValue(accessToken);

  // Store or update the encrypted token
  await prisma.encryptedToken.upsert({
    where: {
      guildId_service_tokenType: {
        guildId: userId, // Using userId in the guildId field, this is a retrofit
        service: "discord",
        tokenType: type,
      },
    },
    create: {
      guildId: userId,
      service: "discord",
      tokenType: type,
      encryptedToken: encryptedData.encrypted,
      iv: encryptedData.iv,
      expiresAt: type === "refresh" ? null : expiresAt, // Refresh tokens don't expire
    },
    update: {
      encryptedToken: encryptedData.encrypted,
      iv: encryptedData.iv,
      expiresAt: type === "refresh" ? null : expiresAt,
    },
  });

  // If a refresh token is provided, store it too
  if (refreshToken && type === "access") {
    await storeDiscordToken(userId, refreshToken, 0, "refresh");
  }
}

/**
 * Refreshes a Discord access token using the refresh token
 */
async function refreshDiscordToken(userId: string): Promise<string | null> {
  try {
    // Get the refresh token
    const refreshTokenRecord = await prisma.encryptedToken.findUnique({
      where: {
        guildId_service_tokenType: {
          guildId: userId,
          service: "discord",
          tokenType: "refresh",
        },
      },
    });

    if (!refreshTokenRecord) {
      console.error(`No refresh token found for user ${userId}`);
      return null;
    }

    // Decrypt the refresh token
    const refreshToken = decryptValue(
      refreshTokenRecord.encryptedToken,
      refreshTokenRecord.iv
    );

    // Exchange refresh token for a new access token
    const response = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.AUTH_DISCORD_ID!,
        client_secret: process.env.AUTH_DISCORD_SECRET!,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      console.error(
        `Failed to refresh token for user ${userId}: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const tokenData = await response.json();

    // Store the new tokens
    await storeDiscordToken(
      userId,
      tokenData.access_token,
      tokenData.expires_in,
      "access",
      tokenData.refresh_token
    );

    return tokenData.access_token;
  } catch (error) {
    console.error(`Error refreshing Discord token for user ${userId}:`, error);
    return null;
  }
}

/**
 * Retrieves a valid Discord token for a user, refreshing if needed
 */
export async function getDiscordToken(userId: string): Promise<string | null> {
  try {
    // Get the token record from the database
    const tokenRecord = await prisma.encryptedToken.findUnique({
      where: {
        guildId_service_tokenType: {
          guildId: userId,
          service: "discord",
          tokenType: "access",
        },
      },
    });

    // If no token found, return null
    if (!tokenRecord) {
      return null;
    }

    // Check if token is expired
    if (tokenRecord.expiresAt && new Date() > tokenRecord.expiresAt) {
      console.log(`Token expired for user ${userId}, attempting to refresh`);
      return await refreshDiscordToken(userId);
    }

    // Decrypt the token
    return decryptValue(tokenRecord.encryptedToken, tokenRecord.iv);
  } catch (error) {
    console.error("Error retrieving Discord token:", error);
    return null;
  }
}

/**
 * Gets both access and refresh tokens (for initialization)
 */
export async function getDiscordTokens(userId: string): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
  isAccessTokenExpired: boolean;
}> {
  try {
    // Get both tokens from database
    const [accessTokenRecord, refreshTokenRecord] = await Promise.all([
      prisma.encryptedToken.findUnique({
        where: {
          guildId_service_tokenType: {
            guildId: userId,
            service: "discord",
            tokenType: "access",
          },
        },
      }),
      prisma.encryptedToken.findUnique({
        where: {
          guildId_service_tokenType: {
            guildId: userId,
            service: "discord",
            tokenType: "refresh",
          },
        },
      }),
    ]);

    if (!accessTokenRecord || !refreshTokenRecord) {
      return {
        accessToken: null,
        refreshToken: null,
        isAccessTokenExpired: true,
      };
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
  } catch (error) {
    console.error("Error retrieving Discord tokens:", error);
    return {
      accessToken: null,
      refreshToken: null,
      isAccessTokenExpired: true,
    };
  }
}
