// components/Streams/WebsiteGenerator/templates/cssTemplate.ts

export function cssTemplate(
    backgroundColor: string,
    textColor: string
  ): string {
    return `body {
    background-color: ${backgroundColor};
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    margin: 0;
    font-family: Monospace;
    overflow-x: hidden;
  }
  
  h1 {
    color: ${textColor};
    font-size: 14em;
    margin-top: auto;
    margin-bottom: auto;
    text-align: center; /* Center text horizontally */
  }
  
  .image-cropper {
    width: 15em;
    height: 15em;
    position: relative;
    overflow: hidden;
    border-radius: 30%;
    align-items: center;
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
    margin-top: 20px; /* Add some space above the social buttons */
    display: flex;
    width: 100%;
    justify-content: center;
  }
  
  .social-button {
    text-decoration: none;
    color: ${textColor};
    margin: 0 10px;
    position: relative;
    display: inline-block;
    cursor: pointer;
    font-size: calc(
      3.5vw + 1em
    ); /* Scale the font size based on viewport width */
    transition: font-size 0.01s ease; /* Smooth transition on resize */
  }
  
  .social-button i {
    transition: color 0.3s;
    margin-right: 0.25em;
    margin-left: 0.25em;
  }
  
  .social-button:hover i {
    color: #ddd;
  }
  
  .gridRow {
    display: grid;
    margin-top: 0.5em;
    margin-bottom: 0.5em;
    grid-template-columns: 20% 13% 66%;
  }
  
  .TableHeader {
    font-weight: bold;
    font-size: 5em;
  }
  
  .scheduleStream {
    font-size: 2.5em;
    text-align: center;
    background-color: #dddddd;
    border-radius: 25px;
    border: 4px solid black;
    padding-top: 0.33em;
    padding-bottom: 0.33em;
  }
  
  .scheduleDate {
    font-size: 2.5em;
    text-align: center;
    background-color: #dddddd;
    border-radius: 25px;
    border: 4px solid black;
    padding-top: 0.33em;
    padding-bottom: 0.33em;
  }
  
  .scheduleDay {
    font-size: 2.5em;
    text-align: center;
    background-color: #dddddd;
    border-radius: 25px;
    border: 4px solid black;
    padding-top: 0.33em;
    padding-bottom: 0.33em;
  }
  
  @media (max-width: 900px) {
    h1 {
      font-size: 10em; /* Adjust font size for smaller screens */
    }
  
    .content {
      flex-direction: column; /* Ensure the image and text stack vertically */
    }
  }
  
  @media (max-width: 480px) {
    h1 {
      font-size: 8em; /* Further adjust font size for very small screens */
    }
  }
  
  #NextStreamCountdown {
    margin-top: 0.25em;
    background-color: #dddddd;
    border-radius: 25px;
    border: 4px solid black;
    font-size: 3em;
    color: black;
    width: 99%;
  }
  
  #NextStreamCountdown > div {
    color: black;
  }
  
  .center-div,
  .socials,
  .gridSchedule,
  #NextStreamCountdown {
    flex-grow: 0;
  }
  
  footer {
    margin-top: auto;
    text-align: right;
    padding: 10px 0;
    color: ${textColor};
  }
  
  footer a:visited {
    color: ${textColor};
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
    bottom: 125%; /* Position above the icon */
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    transition: opacity 0.3s;
    white-space: nowrap; /* Prevent the tooltip from wrapping */
    font-size: 0.6em;
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
  }`;
  }