"use server";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/auth";
import GuildSelector from "@/components/guild/GuildSelector";
import { signOutAndCleanupAction } from "../actions/authActions";
import { redirect } from "next/navigation";
import { fetchUserGuilds } from "@/app/actions/discordActions";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await auth();
  if (!session)
    return (
      <>
        <div
          className="hidden md:grid place-items-center overflow-hidden"
          style={{ height: "calc(100vh - 66px)" }}
        >
          <div className="space-y-4 ">
            <div className="flex items-center justify-center">
              <h2 className="text-3xl font-bold tracking-tight text-center">
                Dashboard
              </h2>
            </div>
            <div className="flex items-center justify-center">
              <Card>
                <CardHeader className="flex items-center justify-center">
                  <CardTitle>⚠️ Protected Content</CardTitle>
                  <CardDescription>
                    To view your dashboard, please sign in using discord.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </>
    );

  try {
    // Attempt to fetch guilds - if this fails, it will throw an error
    await fetchUserGuilds();

    // If successful, render the GuildSelector
    return (
      <>
        <GuildSelector />
      </>
    );
  } catch (error) {
    console.error("Error fetching guilds:", error);

    // If there's an error fetching guilds, attempt to sign out the user (patch updated auth, need this now ICE)
    try {
      redirect("/api/force-signout");
    } catch (signOutError) {
      console.error("Error during forced sign out:", signOutError);

      // Fallback UI if redirect fails
      return (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Session Error</h2>
          <p className="mb-4">
            There was a problem with your session. Please try signing out and
            back in.
          </p>
          <form action={signOutAndCleanupAction}>
            <Button type="submit">Sign Out</Button>
          </form>
        </div>
      );
    }
  }
}
