import { NextResponse } from "next/server";
import { cache } from "@/app/lib/cache";
import { getUserGuilds } from "@/app/lib/discord-api";

export async function GET(request: Request) {
  console.log("AAAAAA");
  return getUserGuilds();
}
