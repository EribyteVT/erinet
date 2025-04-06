import { prisma } from "@/app/lib/db";
import { encryptValue, decryptValue } from "@/app/lib/encryption";

export async function storeDiscordToken(
  userId: string,
  accessToken: string,
  expiresIn: number = 604800 // Default 1 week in seconds
): Promise<void> {
  const expiresAt = new Date(Date.now() + expiresIn * 1000);

  // Encrypt the token
  const encryptedData = encryptValue(accessToken);

  // Store or update the encrypted token
  await prisma.encryptedToken.upsert({
    where: {
      guildId_service_tokenType: {
        guildId: userId, // Using userId in the guildId field, this is cuz it's a retrofit
        service: "discord",
        tokenType: "access",
      },
    },
    create: {
      guildId: userId,
      service: "discord",
      tokenType: "access",
      encryptedToken: encryptedData.encrypted,
      iv: encryptedData.iv,
      expiresAt,
    },
    update: {
      encryptedToken: encryptedData.encrypted,
      iv: encryptedData.iv,
      expiresAt,
    },
  });
}

/**
 * Retrieves a Discord token for a user if it exists and is valid
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
      console.log(`Token expired for user ${userId}`);
      // TODO: REFRESH
      return null;
    }

    // Decrypt the token
    return decryptValue(tokenRecord.encryptedToken, tokenRecord.iv);
  } catch (error) {
    console.error("Error retrieving Discord token:", error);
    return null;
  }
}
