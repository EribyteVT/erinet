"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GuildData } from "@/components/Streams/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeader } from "@/components/ui/selection-header";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { AlertCircle, Bot, UserCircle, ChevronRight } from "lucide-react";
import { createStreamerAction } from "@/app/actions/streameractions";

interface OnboardingProcessProps {
  guild: GuildData;
  botInviteBase: string;
}

export default function OnboardingProcess({
  guild,
  botInviteBase,
}: OnboardingProcessProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamerName, setStreamerName] = useState("");
  const [streamerLink, setStreamerLink] = useState("");
  const [levelSystem, setLevelSystem] = useState("N");
  const [botInvited, setBotInvited] = useState(false);

  // Generate bot invite URL with required permissions
  const botInviteUrl = botInviteBase + guild.id;

  const handleInviteBot = () => {
    window.open(botInviteUrl, "_blank");
    setBotInvited(true);
  };

  const handleCreateStreamer = async () => {
    if (!streamerName.trim()) {
      setError("Please enter a streamer name");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const response = await createStreamerAction(
        streamerName,
        levelSystem,
        timezone,
        guild.id,
        streamerLink
      );

      const result = await response;

      if (result.success) {
        // Success - redirect to the new streamer management page
        router.push(`/${guild.id}/manage`);
      } else {
        setError(
          result.message || "Failed to create streamer. Please try again."
        );
      }
    } catch (error) {
      console.error("Error creating streamer:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  return (
    <PageContainer maxWidth="md">
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 shadow-xl flex items-center gap-3">
            <LoadingIndicator text="Setting up your server..." />
          </div>
        </div>
      )}

      <div className="mb-6">
        <SectionHeader
          title="Onboarding Process"
          description={`Setting up ${guild.name} with Eribot`}
        />
      </div>

      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            {currentStep === 1 && <Bot className="h-5 w-5" />}
            {currentStep === 2 && <UserCircle className="h-5 w-5" />}
            Step {currentStep} of 2:{" "}
            {currentStep === 1 ? "Invite Bot" : "Streamer Setup"}
          </CardTitle>
          <CardDescription>
            {currentStep === 1
              ? "First, you need to invite the Eribot to your Discord server"
              : "Now, let's set up the streamer information for your server"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {currentStep === 1 ? (
            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border space-y-3">
                <p className="text-sm">
                  To use Eribot with this server, you need to invite the bot to
                  your Discord server first. Click the button below to invite
                  the bot.
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-4 w-4 inline-block mr-1" />
                  {
                    "Note: You'll need Admin permissions in the server to add bots."
                  }
                </p>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => router.push("/guilds")}
                >
                  Cancel
                </Button>

                {botInvited ? (
                  <Button onClick={handleNext}>
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={handleInviteBot}>
                    Invite Bot to Server
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="streamer-name">Streamer Name</Label>
                  <Input
                    id="streamer-name"
                    placeholder="Enter your name"
                    value={streamerName}
                    onChange={(e) => setStreamerName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="streamer-name">Streamer Link</Label>
                  <Input
                    id="streamer-link"
                    placeholder="Enter your live link"
                    value={streamerLink}
                    onChange={(e) => setStreamerLink(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level-system">Level System</Label>
                  <Select value={levelSystem} onValueChange={setLevelSystem}>
                    <SelectTrigger disabled>
                      <SelectValue placeholder="Select level system option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="N">Disabled (N)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Enable or disable level system integration. (coming soon)
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <AlertCircle className="h-4 w-4 inline-block mr-1" />
                  {
                    "Once you complete this setup, you'll be able to manage streams and connect with Twitch."
                  }
                </p>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button onClick={handleCreateStreamer}>Complete Setup</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
