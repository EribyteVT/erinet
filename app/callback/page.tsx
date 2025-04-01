import { auth } from "@/auth";
import ErinetAdapter from "@/components/Adapter/erinetAdapter";
import { redirect } from "next/navigation";

export default async function handler(req: any) {
  console.log("HFDJSAKLLFJHKSADFJ");
  console.log(req.searchParams.code);

  const { code } = req.searchParams;

  const adapter = ErinetAdapter("http://localhost:46470/");

  if (!code) {
    return status(400).json({ error: "Authorization code missing" });
  }

  console.log("Got gold");

  // try {
  // Exchange authorization code for access token
  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.TWITCH_CLIENT_ID,
      client_secret: process.env.TWITCH_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: process.env.TWITCH_REDIRECT_URI,
    }),
  });

  console.log(response.status);
  console.log(response.statusText);

  console.log("oauth token 2");

  if (response.status != 200) {
    throw new Error(
      `Failed to exchange code for token: ${response.statusText}`
    );
  }

  const tokenData = await response.json();
  const { access_token, refresh_token } = tokenData;

  // Fetch user data from Twitch
  const userDataResponse = await fetch("https://api.twitch.tv/helix/users", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + access_token,
      "Content-Type": "application/json",
      "Client-Id": process.env.TWITCH_CLIENT_ID,
    },
  });

  console.log(userDataResponse.status);
  console.log(userDataResponse.statusText);

  console.log("user response");

  if (userDataResponse.status != 200) {
    throw new Error(
      `Failed to fetch Twitch user data: ${userDataResponse.statusText}`
    );
  }

  const userData = await userDataResponse.json();
  const twitchUserData = userData.data[0];

  // Get the current session
  const session = await auth();
  if (!session?.user) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  const userId = session.user.id;

  // Link Twitch account to the user
  await adapter.linkAccount!({
    userId: userId,
    type: "oidc",
    provider: "twitch",
    providerAccountId: twitchUserData.id,
    access_token,
    refresh_token,
    scope: "",
  });
  // Redirect to profile page or dashboard
  redirect("/");
  // } catch (error) {
  //   console.error("Error linking Twitch account:", error);
  //   // res.status(500).json({ error: "Failed to link Twitch account" });
  // }
}
