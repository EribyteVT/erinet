// app/api/force-signout/route.ts
import { signOutAndCleanupAction } from "@/app/actions/authActions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Perform the sign out
    await signOutAndCleanupAction();

    // Redirect to home page
    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Error in force sign out route:", error);

    // Even if there's an error, redirect to home
    return NextResponse.redirect(new URL("/", request.url));
  }
}
