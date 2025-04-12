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

    // Create a readme file with instructions
    const readmeContent = `# Your Stream Website

    This website was generated using the Eribot Website Generator. It provides a lightweight, customizable website to showcase your stream schedule and social media links.
    
    ## Files Included
    - index.html: The main HTML structure of your website
    - index.css: All styling for your website
    - index.js: JavaScript for handling stream countdown and other functionality
    - readme.txt: This readme file with instructions
    
    ## Hosting on GitHub Pages (Free Hosting)
    
    GitHub Pages provides free hosting for basic websites. Follow these steps to get your site online:
    
    ### 1. Create a GitHub Account
    
    1. Visit [github.com](https://github.com)
    2. Click on "Sign up" in the top right corner
    3. Follow the prompts to create your account
       - You'll need to provide an email, create a password, and choose a username
       - Complete any verification steps required
    
    ### 2. Create a New Repository
    
    1. Once logged in, click the "+" icon in the top right corner
    2. Select "New repository" from the dropdown menu
    3. Name your repository amything you'd like
    4. Make sure "Public" is selected
    5. Click "Create repository"
    
    ### 3. Upload Your Website Files
    
    1. In your new repository, click on "uploading an existing file" link
    2. Drag and drop all the files from the ZIP you downloaded (index.html, index.css, index.js)
    3. Add a commit message like "Initial website upload"
    4. Click "Commit changes"
    
    _[Screenshot: File upload interface with files being uploaded]_
    
    ### 4. Enable GitHub Pages
    
    1. Click on "Settings" in the top menu of your repository
    2. Scroll down to the "GitHub Pages" section
    3. Under "Source", select "main" from the dropdown menu
    4. Click "Save"
    5. Wait a few minutes for GitHub to publish your site ( you can click actions to see when it's)
        
    ### 5. View Your Live Website
    
    1. After a few minutes, return to the GitHub Pages section in Settings
    2. You should see a message saying "Your site is published at https://yourusername.github.io/<Repository name>"
    3. Click this link to view your live website!
    
    ## Setting Up a Custom Domain (Optional)
    
    You can use your own custom domain (like "eribyte.net") instead of the default "yourusername.github.io" address.
    
    ### Purchase a Domain
    
    1. Purchase a domain from a provider like [Namecheap](https://www.namecheap.com) 
    2. After purchase, you'll need to access the DNS settings for your domain
    
    ### Configure Your Domain
    
    1. In your GitHub repository, go to Settings → GitHub Pages
    2. Under "Custom domain", enter your domain name (e.g., "yourname.com")
    3. Click "Save"
    4. Check "Enforce HTTPS" once it becomes available
    
    ### Update DNS Settings at Your Domain Provider
    
    For Namecheap:
    1. Log in to your Namecheap account
    2. Go to "Domain List" and click "Manage" next to your domain
    3. Click on "Advanced DNS" tab
    4. Add these "A Records":
       - Host: @, Value: 185.199.108.153, TTL: Automatic
       - Host: @, Value: 185.199.109.153, TTL: Automatic
       - Host: @, Value: 185.199.110.153, TTL: Automatic
       - Host: @, Value: 185.199.111.153, TTL: Automatic

       4a. sometimes these ip's may change. if your website stops working look at [github's official guild](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) to see the new ones
    5. Add a "CNAME Record":
       - Host: www, Value: yourusername.github.io, TTL: Automatic (EX: Host: www, Value: eribytevt.github.io, TTL: Automatic)
        
    For detailed instructions with other providers, see [GitHub's official guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).
    
    ## Customizing Your Website
    
    You can further customize your website by editing the files directly:
    
    ### Basic Customization
    
    1. Log in to GitHub and navigate to your repository
    2. Click on the file you want to edit (e.g., index.html)
    3. Click the pencil icon to edit the file
    4. Make your changes
    5. Scroll down and click "Commit changes"
    
    ### What You Can Change:
    
    - **Colors**: In index.css, look for color codes (like #414141) and change them
    - **Text**: In index.html, you can edit any text between tags
    - **Layout**: For more advanced changes, you can modify the structure in both HTML and CSS files
    
    ## Troubleshooting
    
    ### Website Not Appearing
    - It can take up to 10 minutes for changes to appear (Longer if you use a custom domain due to DNS propagation)
    - Make sure your repository is public
    - Check that your files are in the main branch, not in any folders
    
    ### Custom Domain Not Working
    - DNS changes can take up to 48 hours to fully propagate
    - Verify your DNS settings match exactly with the recommendations
    - Make sure you saved the custom domain in your GitHub Pages settings
    
    ## Additional Info
    
    There's nothing stopping you from removing the footer, but it will make me sad :_(
    
    ## Generated by Eribot
    
    https://eri.bot/
    
    If you need further assistance, join our Discord community through the link on our website!`;

    zip.file("README.txt", readmeContent);

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
