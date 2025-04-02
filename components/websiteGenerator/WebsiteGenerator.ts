// components/Streams/WebsiteGenerator/WebsiteGenerator.ts
import JSZip from 'jszip';
import { Stream } from "@/components/Streams/types";

interface WebsiteFormValues {
  streamerName: string;
  profileImage?: string;
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
  apiEndpoint?: string;
}

export async function generateWebsiteFiles(
  formValues: WebsiteFormValues,
  streams: Stream[]
): Promise<Blob> {
  const zip = new JSZip();
  
  // Generate background style
  const getBackgroundStyle = () => {
    if (formValues.backgroundType === "gradient") {
      return `linear-gradient(${formValues.gradientDirection}, ${formValues.gradientStart}, ${formValues.gradientEnd})`;
    }
    return formValues.backgroundColor;
  };

  // Format streams for the website
  const streamsToExport = streams
    .sort((a, b) => new Date(a.stream_date).getTime() - new Date(b.stream_date).getTime())
    .filter(stream => new Date(stream.stream_date) > new Date())
    .map(stream => ({
      name: stream.stream_name,
      date: stream.stream_date,
      duration: stream.duration || 120
    }));

  // Add index.html
  zip.file("index.html", generateHtml(formValues, streamsToExport));
  
  // Add styles.css
  zip.file("styles.css", generateCss(formValues));
  
  // Add script.js
  zip.file("script.js", generateScript(formValues, streamsToExport));
  
  // Add README.md
  zip.file("README.md", generateReadme(formValues));

  // Generate the zip file
  return zip.generateAsync({ type: "blob" });
}

function generateReadme(formValues: WebsiteFormValues): string {
  return `# ${formValues.streamerName} Website

This website was generated using the Eribot Website Generator.

## Setup Instructions

1. Upload all these files to your web hosting service.
2. The website should work out of the box, no additional configuration required.

## Files Included

- \`index.html\` - The main HTML file for your website
- \`styles.css\` - Contains all the styling for your website
- \`script.js\` - JavaScript for handling stream schedule and countdown

## Customization

If you want to make further customizations:

- Edit \`styles.css\` to change colors, fonts, or layout
- Modify \`index.html\` to add additional content or change structure
- Update \`script.js\` if you need to change how the stream schedule works

## Updating Stream Schedule

${formValues.useCustomStreamFetch 
  ? `Your website is configured to automatically fetch stream schedule data from the Erinet API. No manual updates needed.`
  : `To update your stream schedule, you'll need to edit the \`script.js\` file. Look for the \`streams\` array near the top of the file and update it with your new schedule.`}

## Questions or Issues?

Visit [https://erinet.eribyte.net](https://erinet.eribyte.net) for support.

---

Created with ❤️ using Eribot Website Generator
`;
}

function extractDomainFromUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    const domain = hostname.replace('www.', '').split('.')[0];
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  } catch (error) {
    return 'Link';
  }
}