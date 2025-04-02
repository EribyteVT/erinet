// components/Streams/WebsiteGenerator/WebsiteGenerator.ts
import JSZip from "jszip";
import { Stream } from "@/components/Streams/types";
import { htmlTemplate } from "./templates/htmlTemplate";
import { cssTemplate } from "./templates/cssTemplate";
import { jsTemplate } from "./templates/jsTemplate";

interface WebsiteFormValues {
  streamerName: string;
  backgroundType: "color" | "gradient";
  backgroundColor: string;
  gradientStart: string;
  gradientEnd: string;
  gradientDirection: string;
  textColor: string;
  socialLinks: {
    url: string;
    icon: string;
    label?: string;
  }[];
  useCustomStreamFetch: boolean;
}

export async function generateWebsiteFiles(
  formValues: WebsiteFormValues,
  streams: Stream[],
  pfp_url: string,
  twitch_name: string,
  apiEndpoint: string
): Promise<Blob> {
  console.log("FIRST GEN");
  console.log(formValues);

  const zip = new JSZip();

  // Convert social links array to the format expected by htmlTemplate
  const socialLinksRecord: Record<string, string> = {};

  formValues.socialLinks.forEach((link) => {
    // Try to determine the platform from the icon or URL
    let platform = getPlatformFromIcon(link.icon);

    if (!platform) {
      // If platform couldn't be determined from icon, try to get it from URL
      platform = getPlatformFromUrl(link.url);
    }

    if (platform) {
      socialLinksRecord[platform] = link.url;
    }
  });

  // Format streams for the website
  const streamsToExport = streams
    .sort(
      (a, b) =>
        new Date(a.stream_date).getTime() - new Date(b.stream_date).getTime()
    )
    .filter((stream) => new Date(stream.stream_date) > new Date())
    .map((stream) => ({
      name: stream.stream_name,
      date: stream.stream_date,
      duration: stream.duration || 120,
    }));

  console.log("GENNY");
  console.log(pfp_url);

  // Generate HTML file
  const html = htmlTemplate(
    formValues.streamerName,
    socialLinksRecord,
    pfp_url
  );
  zip.file("index.html", html);

  // Generate CSS file
  const css = cssTemplate(
    formValues.backgroundColor,
    formValues.textColor,
    formValues.backgroundType,
    formValues.gradientStart,
    formValues.gradientEnd,
    formValues.gradientDirection
  );
  zip.file("index.css", css);

  // Generate JavaScript file
  const js = jsTemplate(
    streamsToExport,
    formValues.useCustomStreamFetch,
    `https://twitch.tv/${twitch_name}`,
    apiEndpoint
  );
  zip.file("index.js", js);

  // Add README.md with instructions
  zip.file("README.md", generateReadme(formValues));

  // Generate the zip file
  return zip.generateAsync({ type: "blob" });
}

function getPlatformFromIcon(icon: string): string | null {
  const iconMappings: Record<string, string> = {
    "mdi:twitch": "twitch",
    "fa-twitch": "twitch",
    "mdi:youtube": "youtube",
    "fa-youtube": "youtube",
    "mdi:discord": "discord",
    "fa-discord": "discord",
    "mdi:twitter": "twitter",
    "fa-twitter": "twitter",
    "mdi:instagram": "instagram",
    "fa-instagram": "instagram",
    "ic:baseline-tiktok": "tiktok",
    "fa-tiktok": "tiktok",
    "fa6-solid:crown": "throne",
    "fa-crown": "throne",
    "ri:bluesky-fill": "bluesky",
    "fa-brands fa-bluesky": "bluesky",
    "fa-solid fa-bag-shopping": "merch",
    "mdi:shopping": "merch",
    "mdi:reddit": "reddit",
    "fa-reddit": "reddit",
    "mdi:tumblr": "tumblr",
    "fa-tumblr": "tumblr",
  };

  return iconMappings[icon] || null;
}

function getPlatformFromUrl(url: string): string | null {
  try {
    const hostname = new URL(url).hostname;

    if (hostname.includes("twitch.tv")) return "twitch";
    if (hostname.includes("youtube.com")) return "youtube";
    if (hostname.includes("discord.gg") || hostname.includes("discord.com"))
      return "discord";
    if (hostname.includes("twitter.com") || hostname.includes("x.com"))
      return "twitter";
    if (hostname.includes("instagram.com")) return "instagram";
    if (hostname.includes("tiktok.com")) return "tiktok";
    if (hostname.includes("throne.com")) return "throne";
    if (hostname.includes("bsky.app")) return "bluesky";
    if (hostname.includes("threadinjection.com") || url.includes("merch"))
      return "merch";
    if (hostname.includes("reddit.com")) return "reddit";
    if (hostname.includes("tumblr.com")) return "tumblr";

    return null;
  } catch (error) {
    return null;
  }
}

function generateReadme(formValues: WebsiteFormValues): string {
  return `# ${formValues.streamerName} Website

This website was generated using the Eribot Website Generator.

## Setup Instructions

1. Upload all these files to your web hosting service.
2. The website should work out of the box, no additional configuration required.

## Files Included

- \`index.html\` - The main HTML file for your website
- \`index.css\` - Contains all the styling for your website
- \`index.js\` - JavaScript for handling stream schedule and countdown

## Customization

If you want to make further customizations:

- Edit \`index.css\` to change colors, fonts, or layout
- Modify \`index.html\` to add additional content or change structure
- Update \`index.js\` if you need to change how the stream schedule works

## Updating Stream Schedule

${
  formValues.useCustomStreamFetch
    ? `Your website is configured to automatically fetch stream schedule data from the Erinet API. No manual updates needed.`
    : `To update your stream schedule, you'll need to edit the \`index.js\` file. Look for the \`streams\` array near the top of the file and update it with your new schedule.`
}

## Questions or Issues?

Visit [https://eri.bot](https://eri.bot) for support.

---

Created with ❤️ using Eribot Website Generator
`;
}
