import { NextRequest, NextResponse } from "next/server";

// Get the list of trusted hosts from environment variable
const getTrustedHosts = () => {
  const trustedHosts = process.env.NEXT_PUBLIC_TRUSTED_HOSTS;
  return trustedHosts
    ? trustedHosts.split(",")
    : ["localhost:3000", "discord.com", "discordapp.com"];
};

export function middleware(request: NextRequest) {
  let response = NextResponse.next();

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
