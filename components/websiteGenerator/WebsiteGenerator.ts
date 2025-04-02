// components/Streams/WebsiteGenerator/websiteGenerator.ts
import { Stream } from "@/components/Streams/types";
import JSZip from "jszip";

// Template files
import { htmlTemplate } from "./templates/htmlTemplate";
import { cssTemplate } from "./templates/cssTemplate";
import { jsTemplate } from "./templates/jsTemplate";

interface WebsiteFormData {
  streamerName: string;
  profileImage?: string;
  backgroundColor: string;
  textColor: string;
  // Social media links
  twitch?: string;
  youtube?: string;
  discord?: string;
  twitter?: string;
  instagram?: string;
  tiktok?: string;
  throne?: string;
  bluesky?: string;
  reddit?: string;
  tumblr?: string;
  merch?: string;
  // Options
  showHiddenSocials: boolean;
  useCustomStreamFetch: boolean;
  apiEndpoint?: string;
}

export async function generateWebsiteFiles(
  formData: WebsiteFormData,
  streams: Stream[]
): Promise<Blob> {
  // Create a new JSZip instance
  const zip = new JSZip();

  // Process the social media links into an object for use in the HTML template
  const socialLinks = Object.entries({
    twitch: formData.twitch,
    youtube: formData.youtube,
    discord: formData.discord,
    twitter: formData.twitter,
    instagram: formData.instagram,
    tiktok: formData.tiktok,
    throne: formData.throne,
    bluesky: formData.bluesky,
    merch: formData.merch,
    reddit: formData.reddit,
    tumblr: formData.tumblr,
  }).reduce((acc, [key, value]) => {
    if (value) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, string>);

  // Create HTML file with custom data
  const html = htmlTemplate(formData.streamerName, socialLinks, formData.profileImage);
  zip.file("index.html", html);

  // Create CSS file with custom styles
  const css = cssTemplate(formData.backgroundColor, formData.textColor);
  zip.file("index.css", css);

  // Create JS file with custom data
  const js = jsTemplate(
    formData.streamerName,
    formData.useCustomStreamFetch ? formData.apiEndpoint || "" : "",
    !formData.useCustomStreamFetch ? streams : []
  );
  zip.file("index.js", js);

  // Add a README file
  const readme = `# ${formData.streamerName} Website

This website was generated using Erinet's Website Generator tool.

## How to Use

1. Extract all files to a directory
2. Open index.html in your browser to preview locally
3. Upload all files to your web hosting provider

## Files Included

- index.html: The main HTML structure of your website
- index.css: The styling for your website
- index.js: The JavaScript that powers your website, including stream schedule functionality

## Customizing Further

You can edit any of these files directly to make additional customizations:

- To change the appearance, edit index.css
- To update social media links, edit index.html
- To modify stream schedule functionality, edit index.js

## Need Help?

If you need help setting up your website or making further customizations, 
contact the Erinet team.
`;
  zip.file("README.md", readme);

  // Add placeholder image
  if (!formData.profileImage) {
    // Include a default placeholder profile image
    const placeholderImage = await fetch("/api/placeholder/400/400").then(res => res.blob());
    zip.file("monster_pfp.png", placeholderImage);
  }

  // Add favicon
  const favicon = await fetch("/favicon.ico").then(res => res.blob());
  zip.file("favicon.ico", favicon);

  // Generate the zip file
  return await zip.generateAsync({ type: "blob" });
}