import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";

import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";

import { MainNav } from "../components/dashboard/main-nav";
import { SignIn } from "../components/dashboard/signIn";
import { ModeToggle } from "@/components/ui/ModeToggle";
import { Footer } from "@/components/dashboard/footer";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const metadataBase = process.env.DEFAULT_REDIRECT_URL
  ? new URL(process.env.DEFAULT_REDIRECT_URL)
  : new URL("https://eri.bot");

export const metadata: Metadata = {
  title: "Eribot",
  description:
    "The all-in-one platform for streamers to manage their schedule, integrate with Discord and Twitch, and create custom websites.",
  icons: {
    icon: "/favicon.ico",
  },
  robots: "index, follow",
  applicationName: "Eribot",

  metadataBase: metadataBase,

  openGraph: {
    title: "Eribot",
    description:
      "The all-in-one platform for streamers to manage their schedule",
    images: [
      {
        url: "/Eribyte.png", // Path to your image (relative to the public directory)
        width: 630,
        height: 630,
        alt: "Eribot Platform",
      },
    ],
    type: "website",
  },

  // Twitter card metadata
  twitter: {
    card: "summary_large_image",
    title: "Eribot",
    description:
      "The all-in-one platform for streamers to manage their schedule",
    images: ["/Eribyte.png"], // Path to your image
  },
};

export const viewport = {
  themeColor: "#00FFFF",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="border-b">
            <div className="flex h-16 items-center px-4">
              <MainNav className="mx-6" />
              <div className="ml-auto flex items-center space-x-4">
                <ModeToggle />
                <SignIn />
              </div>
            </div>
          </div>
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
