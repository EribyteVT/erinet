import "next-auth";
import { DefaultSession } from "next-auth";
import { Streamer } from "@/components/Streams/types";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      discordAccount?: {
        id: string;
        username: string;
        email: string;
        avatar?: string;
        access_token?: string;
      };
    };
  }
}
