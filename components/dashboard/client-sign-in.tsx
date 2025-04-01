"use client";

import { Button } from "@/components/ui/button";
import { DiscordLogoIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";

export function ClientSignIn() {
  const router = useRouter();

  const handleSignIn = async () => {
    router.push("/api/auth/signin/discord");
  };

  return (
    <Button onClick={handleSignIn}>
      <DiscordLogoIcon className="mr-2 h-4 w-4" /> Login with Discord
    </Button>
  );
}
