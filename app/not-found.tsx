import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you are looking for does not exist",
};

export default function NotFound() {
  return (
    <PageContainer
      maxWidth="md"
      className="flex flex-col items-center justify-center text-center"
    >
      <div className="space-y-6">
        <h1 className="text-6xl font-bold text-destructive">404</h1>
        <h2 className="text-3xl font-semibold">Page Not Found</h2>
        <p className="text-muted-foreground">
          Oops! The page you are looking for seems to have wandered off.
        </p>
        <div className="flex justify-center space-x-4">
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/guilds">Go to Streams</Link>
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
