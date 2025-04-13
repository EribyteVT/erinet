"use server";
import { auth } from "@/auth";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeader } from "@/components/ui/selection-header";
import { redirect } from "next/navigation";
import { fetchUserGuilds } from "../actions/discordActions";
import WebsiteGuildSelector from "@/components/website/WebsiteGuildSelector";

export default async function WebsitePage() {
  const session = await auth();
  if (!session) {
    return (
      <PageContainer maxWidth="md">
        <div className="space-y-4 py-10">
          <div className="flex items-center justify-center">
            <h2 className="text-3xl font-bold tracking-tight text-center">
              Website Generator
            </h2>
          </div>
          <div className="flex items-center justify-center">
            <Card>
              <CardHeader className="flex items-center justify-center">
                <CardTitle>⚠️ Protected Content</CardTitle>
                <CardDescription>
                  To use the website generator, please sign in using Discord.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </PageContainer>
    );
  }

  try {
    // Attempt to fetch guilds - if this fails, it will throw an error
    await fetchUserGuilds();

    // If successful, render the Guild Selector for websites
    return (
      <PageContainer maxWidth="lg">
        <div className="space-y-6 py-8">
          <SectionHeader
            title="Website Generator"
            description="Select a server to create a custom website for"
          />

          <WebsiteGuildSelector />
        </div>
      </PageContainer>
    );
  } catch (error) {
    console.error("Error fetching guilds:", error);
    redirect("/api/force-signout");
  }
}
