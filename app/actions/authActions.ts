"use server";

import { signOut } from "@/auth";
import { auth } from "@/auth";
import { prisma } from "@/app/lib/db";

/**
  Deletes twitch auth tokens and signs user out
 */
export async function signOutAndCleanupAction() {
  try {
    // Get the current user session
    const session = await auth();

    if (session?.user?.id) {
      const userId = session.user.id;

      // Try to delete all encrypted tokens for this user
      try {
        await prisma.encryptedToken.deleteMany({
          where: {
            guildId: userId,
            service: "discord",
          },
        });
      } catch (error) {
        console.error("Error deleting user tokens:", error);
        // Continue with sign out even if token deletion fails
      }
    }

    // Sign out the user (this redirects to home page)
    await signOut();
  } catch (error) {
    console.error("Error during sign out process:", error);
    // Fall back to standard sign out
    await signOut();
  }
}
