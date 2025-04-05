import Link from "next/link";

import { cn } from "@/lib/utils";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <div className="flex h-[60px] items-center px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold"
          prefetch={false}
        >
          <span className="">Eribot</span>
        </Link>
      </div>
      <Link
        href="/guilds"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Manage
      </Link>
      <Link
        href="/howto"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Tutorial
      </Link>
      {/* <Link
        href="/makeawebsite"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Make a Website!
      </Link> */}
      <Link
        href="/credits"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Credits
      </Link>

      <Link
        href="/donate"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Donate
      </Link>
    </nav>
  );
}
