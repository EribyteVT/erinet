import { Metadata } from "next";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/auth";
import GuildSelector from "@/components/guild/GuildSelector";

export const metadata: Metadata = {
  title: "Eribot",
  description: "Example dashboard app built using the components.",
};

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
  return (
    <>
      <GuildSelector session={session} />
    </>
  );
}
