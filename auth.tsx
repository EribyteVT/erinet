import NextAuth from "next-auth";

import DiscordProvider from "next-auth/providers/discord";

import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";
import { storeDiscordToken } from "./app/lib/discordTokenService";

const getCallbackUrl = () => {
  // Use environment variable if available (production)
  if (process.env.AUTH_DISCORD_REDIRECT_URI) {
    return new URL(
      "/api/auth/callback/discord",
      process.env.AUTH_DISCORD_REDIRECT_URI
    ).toString();
  }

  // Fallback for development
  return "http://localhost:3000/api/auth/callback/discord";
};

const getAuthorizationUrl = () => {
  const params = new URLSearchParams({
    client_id: process.env.AUTH_DISCORD_ID!,
    response_type: "code",
    redirect_uri: getCallbackUrl(),
    integration_type: "0",
    scope: "email identify guilds",
  });

  // console.log(getCallbackUrl());

  // console.log(`https://discord.com/oauth2/authorize?${params.toString()}`);

  return `https://discord.com/oauth2/authorize?${params.toString()}`;
};

// Extend the JWT type to include our custom properties
interface ExtendedJWT extends JWT {
  discordAccount?: {
    id: string;
    username: string;
    email: string;
    avatar?: string;
    access_token?: string;
  };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    DiscordProvider({
      id: "discord",
      name: "Discord",
      authorization: getAuthorizationUrl(),
      token: "https://discord.com/api/oauth2/token",
      userinfo: "https://discord.com/api/users/@me",
      profile(profile) {
        if (profile.avatar === null) {
          const defaultAvatarNumber =
            profile.discriminator === "0"
              ? Number(BigInt(profile.id) >> BigInt(22)) % 6
              : parseInt(profile.discriminator) % 5;
          profile.image_url = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`;
        } else {
          const format = profile.avatar.startsWith("a_") ? "gif" : "png";
          profile.image_url = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`;
        }
        return {
          id: profile.id,
          name: profile.global_name ?? profile.username,
          email: profile.email,
          image: profile.image_url,
        };
      },
      style: { bg: "#5865F2", text: "#fff" },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        if (account.provider === "discord") {
          if (account.access_token) {
            await storeDiscordToken(
              user.id!,
              account.access_token,
              account.expires_in || 604800, // 1 week default,
              "access"
            );
          }

          if (account.refresh_token) {
            await storeDiscordToken(
              user.id!,
              account.refresh_token,
              account.expires_in,
              "refresh"
            );
          }

          // Store user info
          token.discordAccount = {
            id: user.id,
            username: user.name || "",
            email: user.email || "",
            avatar: user.image,
          };
        }
      }
      return token;
    },

    async session({ session, token }) {
      const extendedToken = token as ExtendedJWT;

      const typedSession = session as Session & {
        user: {
          id: string;
          discordAccount?: {
            id: string;
            username: string;
            email: string;
            avatar?: string;
          };
        };
      };

      if (extendedToken.discordAccount) {
        typedSession.user.discordAccount = {
          id: extendedToken.discordAccount.id,
          username: extendedToken.discordAccount.username,
          email: extendedToken.discordAccount.email,
          avatar: extendedToken.discordAccount.avatar,
        };
      }

      typedSession.user.id = extendedToken.sub || "";

      return typedSession;
    },
  },
});
