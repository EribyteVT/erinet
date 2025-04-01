import NextAuth from "next-auth";

import DiscordProvider from "next-auth/providers/discord";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    DiscordProvider({
      id: "discord",
      name: "Discord",
      authorization:
        "https://discord.com/oauth2/authorize?client_id=1300567946917187627&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fcallback%2Fdiscord&integration_type=0&scope=email+identify+guilds",
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
        // Add the account information to the token
        if (account.provider === "discord") {
          token.discordAccount = {
            id: user.id,
            username: user.name,
            email: user.email,
            avatar: user.image,
            access_token: account.access_token,
          };
        }
        if (account.provider === "twitch") {
          token.twitchAccount = {
            id: user.id,
            username: user.name,
            email: user.email,
            avatar: user.image,
            access_token: account.access_token,
          };
        }
      }
      return token;
    },

    async session({ session, token }) {
      // Add the account information from the token to the session
      if (token.discordAccount) {
        session.user.discordAccount = token.discordAccount;
      }
      session.user.id = token.sub;
      return session;
    },

    async signIn({ user, account, profile }) {
      if (account?.provider === "twitch") {
        return false;
      }
      return true;
    },
  },
});
