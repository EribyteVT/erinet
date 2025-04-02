// components/Streams/WebsiteGenerator/templates/htmlTemplate.ts

export function htmlTemplate(
    streamerName: string,
    socialLinks: Record<string, string>,
    pfp_url: string | undefined
  ): string {
    // Function to generate social media links HTML
    const generateSocialLinks = () => {
      const iconMap: Record<string, string> = {
        twitch: 'fa-twitch',
        youtube: 'fa-youtube',
        discord: 'fa-discord',
        twitter: 'fa-twitter',
        instagram: 'fa-instagram',
        tiktok: 'fa-tiktok',
        throne: 'fa-crown',
        bluesky: 'fa-brands fa-bluesky',
        merch: 'fa-solid fa-bag-shopping',
        reddit: 'fa-reddit',
        tumblr: 'fa-tumblr'
      };
  
      const tooltipMap: Record<string, string> = {
        twitch: 'Twitch',
        youtube: 'Youtube',
        discord: 'Discord',
        twitter: 'Twitter',
        instagram: 'Instagram',
        tiktok: 'Tiktok',
        throne: 'Throne',
        bluesky: 'Bluesky',
        merch: 'Merch!!!!',
        reddit: 'Reddit',
        tumblr: 'Tumblr'
      };
  
      let socialsHtml = '';
      
      Object.entries(socialLinks).forEach(([platform, url]) => {
        if (url) {
          socialsHtml += `
        <a
          href="${url}"
          target="_blank"
          class="social-button"
        >
          <i class="fab ${iconMap[platform]}"></i>
          <span class="tooltip">${tooltipMap[platform]}</span>
        </a>`;
        }
      });
      
      return socialsHtml;
    };
  
    return `<!DOCTYPE html>
  <html>
    <head>
      <title>${streamerName}!</title>
      <link rel="stylesheet" href="index.css" />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
      />
      <script src="index.js"></script>
      <link rel="icon" type="image/x-icon" href="favicon.ico" />
    </head>
    <body>
      <div class="center-div">
        <div class="content">
          <div class="image-cropper">
            <img src="${pfp_url}" class="rounded" />
          </div>
          <h1>${streamerName}</h1>
        </div>
      </div>
      <div class="socials">
        ${generateSocialLinks()}
      </div>
      <div id="gridSchedule" class="gridSchedule">
        <div class="gridRow">
          <div class="TableHeader scheduleDay">Day</div>
          <div class="TableHeader scheduleDate">Date</div>
          <div class="TableHeader scheduleStream">stream/time</div>
        </div>
      </div>
      <div id="NextStreamCountdown" class="center">
        <div id="streamNow" hidden>
          <b
            >Stream is NOW!
            <a href="${socialLinks.twitch || 'https://www.twitch.tv'}">${streamerName}</a></b
          >
        </div>
        <div id="streamCountdown">
          <b> Next Stream Countdown: <span id="Countdown"></span> </b>
        </div>
      </div>
      <footer>
        <p>made with ❤️ using <a href="https://eri.bot">Erinet</a></p>
      </footer>
    </body>
  </html>`;
  }