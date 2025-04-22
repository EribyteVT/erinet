import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { DiscordLogoIcon } from "@radix-ui/react-icons";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full py-4 mt-auto border-t border-border/40">
      <div className="container flex flex-col items-center justify-center gap-2 px-4 text-center md:flex-row md:gap-4 md:px-6">
        <div className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Eribot
        </div>

        <div className="flex items-center gap-4">
          <Separator className="hidden h-4 md:block" orientation="vertical" />

          <Link
            href="https://discord.gg/CmWhF5Jyqf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <DiscordLogoIcon className="h-3 w-3" />
            <span>Discord</span>
          </Link>

          <Separator className="hidden h-4 md:block" orientation="vertical" />

          <Link
            href="/privacy"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Privacy Policy
          </Link>

          <Link
            href="/terms"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Terms of use
          </Link>

          <Separator className="hidden h-4 md:block" orientation="vertical" />

          <Link
            href="/donate"
            className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <Heart className="h-3 w-3" />
            <span>Donate</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
