import JSZip from "jszip";
import { saveAs } from "file-saver";

export async function downloadWebsiteZip(
  html: string,
  css: string,
  js: string,
  siteName: string = "my-website"
) {
  try {
    // Create a new zip file
    const zip = new JSZip();

    // Add files to the zip
    zip.file("index.html", html);
    zip.file("index.css", css);
    zip.file("index.js", js);

    // Create a placeholder favicon
    zip.file("favicon.ico", "", { base64: true });

    // Generate the zip file
    const zipContent = await zip.generateAsync({ type: "blob" });

    // Clean up the site name for the filename
    const cleanSiteName = siteName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    // Trigger download
    saveAs(zipContent, `${cleanSiteName || "my-website"}.zip`);

    return true;
  } catch (error) {
    console.error("Error creating zip file:", error);
    return false;
  }
}
