import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;

function getKey(): Buffer {
  if (!ENCRYPTION_KEY) {
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }

  if (ENCRYPTION_KEY.match(/^[0-9a-f]{64}$/i)) {
    return Buffer.from(ENCRYPTION_KEY, "hex");
  }

  return crypto.createHash("sha256").update(ENCRYPTION_KEY).digest();
}

export function encryptValue(value: string): { encrypted: string; iv: string } {
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);

  let encrypted = cipher.update(value, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  return {
    encrypted: `${encrypted}:${authTag}`,
    iv: iv.toString("hex"),
  };
}

export function decryptValue(encrypted: string, iv: string): string {
  try {
    const [encryptedData, authTag] = encrypted.split(":");

    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      getKey(),
      Buffer.from(iv, "hex")
    );

    decipher.setAuthTag(Buffer.from(authTag, "hex"));

    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data");
  }
}
