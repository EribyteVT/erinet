const ADMINISTRATOR = BigInt(0x8);

/**
 * Whether a Discord permissions bitfield (sent by Discord as a string)
 * includes Administrator.
 *
 * Uses BigInt because Discord's permission values are now larger than
 * Number.MAX_SAFE_INTEGER, so `parseInt(permissions) & 8` loses precision
 * and reports admin guilds as non-admin.
 */
export function hasAdminPermission(permissions: string | undefined | null): boolean {
  if (!permissions) return false;
  try {
    return (BigInt(permissions) & ADMINISTRATOR) !== BigInt(0);
  } catch {
    return false;
  }
}
