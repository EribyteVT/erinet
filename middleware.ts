import { NextRequest, NextResponse } from "next/server";

// Get the list of trusted hosts from environment variable
const getTrustedHosts = () => {
  const trustedHosts = process.env.NEXT_PUBLIC_TRUSTED_HOSTS;
  return trustedHosts ? trustedHosts.split(",") : ["localhost:3000"];
};

export function middleware(request: NextRequest) {
  const trustedHosts = getTrustedHosts();
  const requestHost = request.headers.get("host") || "";

  // Check if the request is from a trusted host
  const isTrustedHost = trustedHosts.some(
    (host) => host === requestHost || requestHost.endsWith(`.${host}`)
  );

  // Create a response object that we can modify
  const response = NextResponse.next();

  // Only modify headers for trusted hosts
  if (isTrustedHost) {
    // Add headers to ensure consistent origin handling
    const url = request.nextUrl.clone();
    const hostname = new URL(url.href).hostname;

    // Set headers for server actions to work correctly
    const headers = new Headers(response.headers);

    // For deployed environment, enforce the primary domain for server actions
    if (process.env.NODE_ENV === "production") {
      headers.set("x-forwarded-host", "erinet.eribyte.net");

      // Only set protocol if necessary
      if (!request.headers.get("x-forwarded-proto")) {
        headers.set("x-forwarded-proto", "https");
      }
    }

    return NextResponse.next({
      request: {
        headers: headers,
      },
    });
  }

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
