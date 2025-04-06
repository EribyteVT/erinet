import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, Copy, Archive } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { Stream, Streamer } from "@/components/Streams/types";
import WebsitePreview from "./WebsitePreview";
import { downloadWebsiteZip } from "@/utils/zipUtils";
import { generateHTML } from "./HtmlGenerator";
import { generateCSS } from "./CssGenerator";
import { generateJS } from "./JsGenerator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// load font awesome dynamically cuz we have no head
function FontAwesomeLoader() {
  useEffect(() => {
    const existingLink = document.querySelector('link[href*="fontawesome"]');

    if (!existingLink) {
      // If not loaded, add it to the document
      const link = document.createElement("link");

      link.rel = "stylesheet";
      link.href =
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css";
      link.integrity =
        "sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg==";
      link.crossOrigin = "anonymous";

      document.head.appendChild(link);

      console.log("Font Awesome stylesheet added to document");
    } else {
      console.log("Font Awesome is already loaded");
    }
  }, []);

  return null;
}

// Gradient direction options
const gradientDirections = [
  { value: "to bottom", label: "Top to Bottom" },
  { value: "to right", label: "Left to Right" },
  { value: "to bottom right", label: "Top Left to Bottom Right" },
  { value: "to bottom left", label: "Top Right to Bottom Left" },
];

// add any new icons here
const socialMediaIcons = [
  { value: "fab fa-brands fa-twitch", label: "Twitch" },
  { value: "fab fa-brands fa-youtube", label: "YouTube" },
  { value: "fab fa-brands fa-discord", label: "Discord" },
  { value: "fab fa-brands fa-twitter", label: "Twitter" },
  { value: "fab fa-brands fa-instagram", label: "Instagram" },
  { value: "fab fa-brands fa-tiktok", label: "TikTok" },
  { value: "fab fa-brands fa-reddit", label: "Reddit" },
  { value: "fab fa-brands fa-github", label: "GitHub" },
  { value: "fab fa-brands fa-patreon", label: "Patreon" },
  { value: "fab fa-brands fa-paypal", label: "PayPal" },
  { value: "fab fa-brands fa-steam", label: "Steam" },
  { value: "fab fa-brands fa-pinterest", label: "Pinterest" },
  { value: "fab fa-brands fa-tumblr", label: "Tumblr" },
  { value: "fab fa-brands fa-soundcloud", label: "SoundCloud" },
  { value: "fab fa-brands fa-bandcamp", label: "Bandcamp" },
  { value: "fab fa-brands fa-x-twitter", label: "X" },
  { value: "fab fa-brands fa-bluesky", label: "Bluesky" },
  { value: "fa-solid fa-bag-shopping", label: "Store" },
  { value: "fa-solid fa-crown", label: "Throne" },
];

//rendering is very difficult
const renderIcon = (iconClass: string) => {
  return <i className={`${iconClass} text-lg`}></i>;
};

const IconSelector = ({
  currentIcon,
  onIconChange,
  socialMediaIcons,
}: {
  currentIcon: string;
  onIconChange: (icon: string, label: string) => void;
  socialMediaIcons: Array<{ value: string; label: string }>;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        className="w-16 h-10 flex items-center justify-center"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        {renderIcon(currentIcon)}
      </Button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-1 bg-white dark:bg-slate-800 rounded-md border shadow-lg p-3 w-[280px]">
          <div className="grid grid-cols-4 gap-2">
            {socialMediaIcons.map((icon) => (
              <div key={icon.value} className="flex flex-col items-center">
                <Button
                  type="button"
                  variant="ghost"
                  className={`h-10 w-10 p-0 flex items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 ${
                    currentIcon === icon.value
                      ? "bg-slate-100 dark:bg-slate-700"
                      : ""
                  }`}
                  onClick={() => {
                    onIconChange(icon.value, icon.label);
                    setIsOpen(false);
                  }}
                  title={icon.label}
                >
                  {renderIcon(icon.value)}
                </Button>
                <span className="text-xs mt-1 text-center">{icon.label}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

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

interface WebsiteGeneratorProps {
  streamer: Streamer;
  streams: Stream[];
  apiBaseUrl: string;
  discordAvatar: string | undefined;
  crudUrl: string;
}

export function WebsiteGenerator({
  streamer,
  streams,
  apiBaseUrl,
  discordAvatar,
  crudUrl,
}: WebsiteGeneratorProps) {
  let defaultConfig = {
    backgroundColor: "#414141",
    useGradient: false,
    gradientStartColor: "#414141",
    gradientEndColor: "#232323",
    gradientDirection: "to bottom",
    name: streamer.streamer_name,
    socialLinks: [
      {
        icon: "fab fa-brands fa-twitch",
        url: `https://www.twitch.tv/${streamer.streamer_name}`,
        tooltip: "Twitch",
      },
    ],
  };

  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<WebsiteConfig>(defaultConfig);
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [generatedHTML, setGeneratedHTML] = useState("");
  const [generatedCSS, setGeneratedCSS] = useState("");
  const [generatedJS, setGeneratedJS] = useState("");

  const handleAddSocialLink = () => {
    setConfig({
      ...config,
      socialLinks: [
        ...config.socialLinks,
        {
          icon: "fab fa-brands fa-twitch",
          url: "",
          tooltip: "Twitch",
        },
      ],
    });
  };

  const handleRemoveSocialLink = (index: number) => {
    const newLinks = [...config.socialLinks];
    newLinks.splice(index, 1);
    setConfig({
      ...config,
      socialLinks: newLinks,
    });
  };

  const generateWebsite = async () => {
    // Generate HTML, CSS, and JS code
    const html = generateHTML(
      config,
      streams,
      streamer,
      discordAvatar!,
      crudUrl
    );
    const css = generateCSS(config);
    const js = generateJS(config, streamer, crudUrl);

    setGeneratedHTML(html);
    setGeneratedCSS(css);
    setGeneratedJS(js);

    setShowPreview(true);
  };

  const downloadZip = async () => {
    await downloadWebsiteZip(
      generatedHTML,
      generatedCSS,
      generatedJS,
      config.name || "streamer-website"
    );
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  // Get the current background style for preview
  const getBackgroundStyle = () => {
    if (config.useGradient) {
      return {
        background: `linear-gradient(${config.gradientDirection}, ${config.gradientStartColor}, ${config.gradientEndColor})`,
      };
    }
    return {
      backgroundColor: config.backgroundColor,
    };
  };

  return (
    <>
      <FontAwesomeLoader />
      <Button onClick={() => setIsOpen(true)} variant="default">
        Generate Website
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[95vw] w-[95vw] md:max-w-[90vw] lg:max-w-[85vw]">
          <DialogHeader>
            <DialogTitle>Website Generator</DialogTitle>
            <DialogDescription>
              Customize your website settings below. You can configure the
              appearance and social links.
            </DialogDescription>
          </DialogHeader>

          {!showPreview ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Display Name</Label>
                      <Input
                        id="name"
                        value={config.name}
                        onChange={(e) =>
                          setConfig({ ...config, name: e.target.value })
                        }
                        placeholder="Your Name"
                      />
                    </div>

                    <div className="flex items-center space-x-2 mt-4">
                      <Checkbox
                        id="useGradient"
                        checked={config.useGradient}
                        onCheckedChange={(checked) =>
                          setConfig({
                            ...config,
                            useGradient: checked === true,
                          })
                        }
                      />
                      <Label
                        htmlFor="useGradient"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Use Gradient Background
                      </Label>
                    </div>

                    {!config.useGradient ? (
                      <div className="space-y-2">
                        <Label htmlFor="backgroundColor">
                          Background Color
                        </Label>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-10 h-10 rounded-md border cursor-pointer"
                            style={{ backgroundColor: config.backgroundColor }}
                            onClick={() => setShowColorPicker("background")}
                          ></div>
                          <Input
                            id="backgroundColor"
                            value={config.backgroundColor}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                backgroundColor: e.target.value,
                              })
                            }
                          />
                        </div>
                        {showColorPicker === "background" && (
                          <div className="mt-2">
                            <HexColorPicker
                              color={config.backgroundColor}
                              onChange={(color) =>
                                setConfig({ ...config, backgroundColor: color })
                              }
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowColorPicker(null)}
                              className="mt-2"
                              type="button"
                            >
                              Close Picker
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="gradientDirection">
                            Gradient Direction
                          </Label>
                          <Select
                            value={config.gradientDirection}
                            onValueChange={(value) =>
                              setConfig({
                                ...config,
                                gradientDirection: value,
                              })
                            }
                          >
                            <SelectTrigger className="w-full mt-1">
                              <SelectValue placeholder="Select direction" />
                            </SelectTrigger>
                            <SelectContent>
                              {gradientDirections.map((direction) => (
                                <SelectItem
                                  key={direction.value}
                                  value={direction.value}
                                >
                                  {direction.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="gradientStartColor">
                              Start Color
                            </Label>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-10 h-10 rounded-md border cursor-pointer"
                                style={{
                                  backgroundColor: config.gradientStartColor,
                                }}
                                onClick={() => setShowColorPicker("start")}
                              ></div>
                              <Input
                                id="gradientStartColor"
                                value={config.gradientStartColor}
                                onChange={(e) =>
                                  setConfig({
                                    ...config,
                                    gradientStartColor: e.target.value,
                                  })
                                }
                              />
                            </div>
                            {showColorPicker === "start" && (
                              <div className="mt-2">
                                <HexColorPicker
                                  color={config.gradientStartColor}
                                  onChange={(color) =>
                                    setConfig({
                                      ...config,
                                      gradientStartColor: color,
                                    })
                                  }
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setShowColorPicker(null)}
                                  className="mt-2"
                                  type="button"
                                >
                                  Close Picker
                                </Button>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="gradientEndColor">End Color</Label>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-10 h-10 rounded-md border cursor-pointer"
                                style={{
                                  backgroundColor: config.gradientEndColor,
                                }}
                                onClick={() => setShowColorPicker("end")}
                              ></div>
                              <Input
                                id="gradientEndColor"
                                value={config.gradientEndColor}
                                onChange={(e) =>
                                  setConfig({
                                    ...config,
                                    gradientEndColor: e.target.value,
                                  })
                                }
                              />
                            </div>
                            {showColorPicker === "end" && (
                              <div className="mt-2">
                                <HexColorPicker
                                  color={config.gradientEndColor}
                                  onChange={(color) =>
                                    setConfig({
                                      ...config,
                                      gradientEndColor: color,
                                    })
                                  }
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setShowColorPicker(null)}
                                  className="mt-2"
                                  type="button"
                                >
                                  Close Picker
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="relative h-12 border rounded-md mt-4 overflow-hidden">
                          <div
                            className="absolute inset-0 w-full h-full"
                            style={getBackgroundStyle()}
                          ></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white text-sm font-medium drop-shadow-md">
                              Gradient Preview
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>
                      <span>Social Media Links </span>
                      <span className="text-gray-300">(10 max)</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {config.socialLinks.map((link, index) => (
                        <div
                          key={`social-link-${index}`}
                          className="flex items-center gap-2 p-2 border rounded-md"
                        >
                          <IconSelector
                            currentIcon={link.icon}
                            onIconChange={(newIconValue, iconLabel) => {
                              const newLinks = [...config.socialLinks];

                              newLinks[index] = {
                                ...newLinks[index],
                                icon: newIconValue,
                                //update if default (for smoothness)
                                tooltip:
                                  link.tooltip ===
                                  socialMediaIcons.find(
                                    (i) => i.value === link.icon
                                  )?.label
                                    ? iconLabel
                                    : link.tooltip,
                              };

                              setConfig({
                                ...config,
                                socialLinks: newLinks,
                              });
                            }}
                            socialMediaIcons={socialMediaIcons}
                          />

                          <Input
                            value={link.url}
                            onChange={(e) => {
                              const newLinks = [...config.socialLinks];
                              newLinks[index] = {
                                ...newLinks[index],
                                url: e.target.value,
                              };
                              setConfig({ ...config, socialLinks: newLinks });
                            }}
                            placeholder="URL"
                            className="flex-1"
                          />

                          <Input
                            value={link.tooltip}
                            onChange={(e) => {
                              const newLinks = [...config.socialLinks];
                              newLinks[index] = {
                                ...newLinks[index],
                                tooltip: e.target.value,
                              };
                              setConfig({ ...config, socialLinks: newLinks });
                            }}
                            placeholder="Tooltip"
                            className="w-32 md:w-44"
                          />

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveSocialLink(index)}
                            type="button"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={handleAddSocialLink}
                        disabled={config.socialLinks.length >= 10}
                        type="button"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Social Link
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                  <Button
                    onClick={() => setShowPreview(false)}
                    variant="outline"
                    type="button"
                  >
                    Back to Editor
                  </Button>

                  <Button onClick={downloadZip} variant="default" type="button">
                    <Archive className="h-4 w-4 mr-2" /> Download ZIP
                  </Button>
                </div>
              </div>

              <div className="border rounded-md overflow-hidden">
                <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 px-4 py-2">
                  <h3 className="font-medium">Mock Preview</h3>
                </div>
                <div className="h-96 overflow-auto border-t">
                  <WebsitePreview
                    html={generatedHTML}
                    css={generatedCSS}
                    js={generatedJS}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Card className="md:col-span-2">
                  <CardHeader className="py-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">
                        HTML (index.html)
                      </CardTitle>
                      <Button
                        onClick={() => copyToClipboard(generatedHTML)}
                        variant="ghost"
                        size="sm"
                        type="button"
                      >
                        <Copy className="h-4 w-4 mr-2" /> Copy
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <pre className="text-xs md:text-sm p-4 overflow-auto max-h-60 bg-slate-50 dark:bg-slate-900 rounded-md">
                      {generatedHTML}
                    </pre>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">CSS (index.css)</CardTitle>
                      <Button
                        onClick={() => copyToClipboard(generatedCSS)}
                        variant="ghost"
                        size="sm"
                        type="button"
                      >
                        <Copy className="h-4 w-4 mr-2" /> Copy
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <pre className="text-xs md:text-sm p-4 overflow-auto max-h-60 bg-slate-50 dark:bg-slate-900 rounded-md">
                      {generatedCSS}
                    </pre>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">
                        JavaScript (index.js)
                      </CardTitle>
                      <Button
                        onClick={() => copyToClipboard(generatedJS)}
                        variant="ghost"
                        size="sm"
                        type="button"
                      >
                        <Copy className="h-4 w-4 mr-2" /> Copy
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <pre className="text-xs md:text-sm p-4 overflow-auto max-h-60 bg-slate-50 dark:bg-slate-900 rounded-md">
                      {generatedJS}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          <DialogFooter>
            {!showPreview ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  type="button"
                >
                  Cancel
                </Button>
                <Button onClick={generateWebsite} type="button">
                  Generate Website
                </Button>
              </>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
