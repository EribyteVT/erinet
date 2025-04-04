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

export function generateCSS(config: WebsiteConfig): string {
  // Generate the background style based on configuration
  const backgroundStyle = config.useGradient
    ? `background: linear-gradient(${config.gradientDirection}, ${config.gradientStartColor}, ${config.gradientEndColor});`
    : `background-color: ${config.backgroundColor};`;

  return `body {
      ${backgroundStyle}
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      margin: 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      overflow-x: hidden;
    }
    
    h1 {
      color: #fff;
      font-size: 6em;
      margin-top: auto;
      margin-bottom: auto;
      text-align: center;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    }

    footer { 
      margin-right: 1em
    }
    
    .image-cropper {
      width: 15em;
      height: 15em;
      position: relative;
      overflow: hidden;
      border-radius: 30%;
      align-items: center;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }
    
    img {
      display: inline;
      margin: 0 auto;
      height: 100%;
      width: 100%;
      width: auto;
      object-fit: cover;
    }
    
    .content {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .socials {
      margin-top: 20px;
      display: flex;
      width: 100%;
      justify-content: center;
      flex-wrap: wrap;
    }
    
    .social-button {
      text-decoration: none;
      color: #fff;
      margin: 0 10px;
      position: relative;
      display: inline-block;
      cursor: pointer;
      font-size: calc(3.5vw + 1em);
      transition: font-size 0.01s ease;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    .social-button i {
      transition: color 0.3s, transform 0.2s;
      margin-right: 0.25em;
      margin-left: 0.25em;
    }
    
    .social-button:hover i {
      color: #ddd;
      transform: scale(1.1);
    }
    
    .gridSchedule {
      width: 100%;
      max-width: 100%;
      margin: 0;
      padding: 0.5em;
      box-sizing: border-box;
    }
    
    .gridRow {
      display: grid;
      margin-top: 0.5em;
      margin-bottom: 0.5em;
      grid-template-columns: 20% 13% 67%;
      width: 100%;
    }
    
    .TableHeader {
      font-weight: bold;
      font-size: 3em;
    }
    
    .scheduleStream {
      font-size: 2.5em;
      text-align: center;
      background-color: #dddddd;
      border-radius: 25px;
      border: 4px solid black;
      padding-top: 0.33em;
      padding-bottom: 0.33em;
      width: 100%;
      box-sizing: border-box;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .scheduleDate {
      font-size: 2.5em;
      text-align: center;
      background-color: #dddddd;
      border-radius: 25px;
      border: 4px solid black;
      padding-top: 0.33em;
      padding-bottom: 0.33em;
      width: 100%;
      box-sizing: border-box;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .scheduleDay {
      font-size: 2.5em;
      text-align: center;
      background-color: #dddddd;
      border-radius: 25px;
      border: 4px solid black;
      padding-top: 0.33em;
      padding-bottom: 0.33em;
      width: 100%;
      box-sizing: border-box;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    @media (max-width: 900px) {
      h1 {
        font-size: 10em;
      }
    
      .content {
        flex-direction: column;
      }
      
      .gridRow {
        grid-template-columns: 1fr;
        gap: 0.5em;
      }
    }
    
    @media (max-width: 480px) {
      h1 {
        font-size: 3em;
      }
      
      .social-button {
        font-size: calc(2vw + 1em);
      }
      
      .image-cropper {
        width: 10em;
        height: 10em;
      }
      
      .scheduleStream, .scheduleDate, .scheduleDay, .TableHeader {
        font-size: 1.5em;
      }
    }
    
    #NextStreamCountdown {
      margin-top: 0.25em;
      background-color: #dddddd;
      border-radius: 25px;
      border: 4px solid black;
      font-size: 3em;
      color: black;
      width: 100%;
      box-sizing: border-box;
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
    }
    
    #NextStreamCountdown > div {
      color: black;
    }
    
    .center-div,
    .socials,
    .gridSchedule,
    #NextStreamCountdown {
      flex-grow: 0;
      width: 100%;
    }
    
    footer {
      margin-top: auto;
      text-align: right;
      padding: 10px 0;
      color: white;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    }
    
    footer a:visited {
      color: white;
    }
    
    .tooltip {
      visibility: hidden;
      background-color: white;
      color: black;
      text-align: center;
      border-radius: 10px;
      border-color: black;
      border-width: 3px;
      border-style: solid;
      padding: 5px;
      position: absolute;
      z-index: 1;
      bottom: 125%;
      left: 50%;
      transform: translateX(-50%);
      opacity: 0;
      transition: opacity 0.3s;
      white-space: nowrap;
      font-size: 0.6em;
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
    }
    
    .social-button:hover .tooltip {
      visibility: visible;
      opacity: 1;
    }
    
    .center {
      width: 100%;
      text-align: center;
    }
    
    .hidden {
      display: none;
    }
    
    /* Added styles for links in stream schedule */
    .scheduleStream a {
      color: #0066cc;
      text-decoration: none;
      transition: color 0.2s;
    }
    
    .scheduleStream a:hover {
      color: #0044aa;
      text-decoration: underline;
    }
    
    /* Stream now button styling */
    #streamNow a {
      display: inline-block;
      background-color: #9146FF;
      color: white;
      padding: 0.1em 0.5em;
      margin-left: 0.5em;
      border-radius: 5px;
      text-decoration: none;
      transition: background-color 0.2s;
    }
    
    #streamNow a:hover {
      background-color: #772ce8;
    }`;
}
