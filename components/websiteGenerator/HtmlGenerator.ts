"use client";

import { Stream, Streamer } from "@/components/Streams/types";
import { format } from "date-fns";

type SocialLink = {
  icon: string;
  url: string;
  tooltip: string;
};

type WebsiteConfig = {
  backgroundColor: string;
  useGradient: boolean;
  gradientStartColor: string;
  gradientEndColor: string;
  gradientDirection: string;
  name: string;
  socialLinks: SocialLink[];
};

export function generateHTML(
  config: WebsiteConfig,
  streams: Stream[],
  streamer: Streamer,
  discordAvatar: string,
  crudUrl: string
): string {
  const socialLinks = config.socialLinks
    .map((link) => {
      return `
          <a href="${link.url}" target="_blank" class="social-button">
            <i class="${link.icon}"></i>
            <span class="tooltip">${link.tooltip}</span>
          </a>`;
    })
    .join("\n");

  // Build the complete stream schedule HTML
  const streamsHTML = `
        <!-- 
          This schedule automatically updates from the API:
          https://${crudUrl}/getWeek/{streamerId}
          
          Always displays all 7 days of the week, starting with today
        -->
        <div id="gridSchedule" class="gridSchedule">
          <div class="gridRow">
            <div class="TableHeader scheduleDay">Day</div>
            <div class="TableHeader scheduleDate">Date</div>
            <div class="TableHeader scheduleStream">stream/time</div>
          </div>
          
        </div>
        <div id="NextStreamCountdown" class="center">
          <div id="streamNow" hidden>
            <b>Stream is NOW! <a href="${
              config.socialLinks.find((link) => link.icon.includes("twitch"))
                ?.url || `https://www.twitch.tv/${streamer.streamer_name}`
            }">Join the stream</a></b>
          </div>
          <div id="streamCountdown">
            <b>Next Stream Countdown: <span id="Countdown"></span></b>
          </div>
        </div>`;

  // Generate meta tag for theme color - useful for mobile browser theming
  let themeColor = config.useGradient
    ? config.gradientStartColor
    : config.backgroundColor;

  return `<!DOCTYPE html>
    <!--
      This website was generated with Erinet Website Generator
      
      LIVE STREAM DATA:
      This website automatically fetches stream data from:
      https://${crudUrl}/getWeek/{streamerId}
      
      The streams will refresh every 30 minutes while the page is open.
      Always displays all 7 days of the week, starting with today.
    -->
    <html>
      <head>
        <title>${config.name}</title>
        <link rel="stylesheet" href="index.css" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
        />
        <script src="index.js"></script>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="theme-color" content="${themeColor}">
        <meta name="description" content="${config.name}'s official website - Check out stream schedule and social media links">
      </head>
      <body>
        <div class="center-div">
          <div class="content">
            <div class="image-cropper">
              <img src="${discordAvatar}" class="rounded" alt="${config.name}'s profile picture" />
            </div>
            <h1>${config.name}</h1>
          </div>
        </div>
        <div class="socials">
          ${socialLinks}
        </div>
        ${streamsHTML}
        <footer>
          <p>Made with <a href="https://eri.bot">Eribot</a></p>
        </footer>
      </body>
    </html>`;
}
