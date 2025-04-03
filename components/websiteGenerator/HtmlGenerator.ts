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
  name: string;
  socialLinks: SocialLink[];
};

export function generateHTML(
  config: WebsiteConfig,
  streams: Stream[],
  streamer: Streamer,
  discordAvatar: string
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
          https://crud-stage.eribyte.net/getStreams/{streamerId}/{dateMS} 
          
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
              config.socialLinks.find((link) => link.icon === "Twitch")?.url ||
              `https://www.twitch.tv/${streamer.streamer_name}`
            }">Join the stream</a></b>
          </div>
          <div id="streamCountdown">
            <b>Next Stream Countdown: <span id="Countdown"></span></b>
          </div>
        </div>`;

  return `<!DOCTYPE html>
    <!--
      This website was generated with Erinet Website Generator
      
      LIVE STREAM DATA:
      This website automatically fetches stream data from:
      https://crud-stage.eribyte.net/getStreams/{streamerId}/{currentTimestamp}
      
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
      </head>
      <body>
        <div class="center-div">
          <div class="content">
            <div class="image-cropper">
              <img src="${discordAvatar}" class="rounded" />
            </div>
            <h1>${config.name}</h1>
          </div>
        </div>
        <div class="socials">
          ${socialLinks}
        </div>
        ${streamsHTML}
        <footer>
          <p>Made with <a href="https://erinet.eribyte.net">Erinet</a></p>
        </footer>
      </body>
    </html>`;
}
