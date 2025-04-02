"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Stream, Streamer } from "@/components/Streams/types";
import { WebsitePreview } from "./WebsitePreview";
import { generateWebsiteFiles } from "./WebsiteGenerator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { Plus, X, AlertCircle, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Session } from "next-auth";

// Social media URL to icon mapping
const SOCIAL_MEDIA_ICONS: Record<string, string> = {
  "twitch.tv": "fa-twitch",
  "youtube.com": "fa-youtube",
  "discord.gg": "fa-discord",
  "discord.com": "fa-discord",
  "twitter.com": "fa-twitter",
  "x.com": "fa-twitter",
  "instagram.com": "fa-instagram",
  "tiktok.com": "fa-tiktok",
  "throne.com": "fa-crown",
  "bsky.app": "fa-brands fa-bluesky",
  "threadinjection.com": "fa-solid fa-bag-shopping",
  "reddit.com": "fa-reddit",
  "tumblr.com": "fa-tumblr",
};

// Social media platform display names
const SOCIAL_MEDIA_NAMES: Record<string, string> = {
  "twitch.tv": "Twitch",
  "youtube.com": "Youtube",
  "discord.gg": "Discord",
  "discord.com": "Discord",
  "twitter.com": "Twitter",
  "x.com": "Twitter",
  "instagram.com": "Instagram",
  "tiktok.com": "Tiktok",
  "throne.com": "Throne",
  "bsky.app": "Bluesky",
  "threadinjection.com": "Merch!!!!",
  "reddit.com": "Reddit",
  "tumblr.com": "Tumblr",
};

// Helper function to guess icon and platform from URL
const guessSocialFromUrl = (
  url: string
): { icon: string; platform: string; label: string } => {
  try {
    const hostname = new URL(url).hostname;

    for (const [domain, icon] of Object.entries(SOCIAL_MEDIA_ICONS)) {
      if (hostname.includes(domain)) {
        return {
          icon,
          platform: domain,
          label: SOCIAL_MEDIA_NAMES[domain] || extractDomainFromUrl(url),
        };
      }
    }

    // No match found, return default
    return {
      icon: "fa-link",
      platform: "custom",
      label: extractDomainFromUrl(url),
    };
  } catch (error) {
    return { icon: "fa-link", platform: "custom", label: "Link" };
  }
};

// Helper function to extract domain for label
const extractDomainFromUrl = (url: string): string => {
  try {
    const hostname = new URL(url).hostname;
    const domain = hostname.replace("www.", "").split(".")[0];
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  } catch (error) {
    return "Link";
  }
};

// Define a schema for our social link
const SocialLinkSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  platform: z.string().default("custom"),
  icon: z.string().default("fa-link"),
  label: z.string().optional(),
});

// Define form schema with zod
const websiteFormSchema = z.object({
  streamerName: z.string().min(1, "Streamer name is required"),
  // Background can be either a solid color or a gradient
  backgroundType: z.enum(["color", "gradient"]),
  backgroundColor: z.string().default("#3d3d3d"),
  gradientStart: z.string().default("#3d3d3d"),
  gradientEnd: z.string().default("#1a1a1a"),
  gradientDirection: z
    .enum(["to right", "to bottom", "to bottom right", "to bottom left"])
    .default("to bottom"),
  textColor: z.string().default("#ffffff"),
  // Social media links as an array
  socialLinks: z
    .array(SocialLinkSchema)
    .max(10, "Maximum of 10 social links allowed"),
});

type WebsiteFormValues = z.infer<typeof websiteFormSchema>;

interface WebsiteGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  streamer: Streamer;
  streams: Stream[];
  session: Session;
}

export function WebsiteGeneratorModal({
  isOpen,
  onClose,
  streamer,
  streams,
  session,
}: WebsiteGeneratorModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("customize");

  // Get Discord profile image URL from session if available
  const discordProfileImageUrl = session?.user?.discordAccount?.avatar
    ? `${session.user.discordAccount.avatar}`
    : session?.user?.image || "";

  // Initialize form with default values
  const form = useForm<WebsiteFormValues>({
    resolver: zodResolver(websiteFormSchema),
    defaultValues: {
      streamerName: streamer.streamer_name,
      backgroundType: "color",
      backgroundColor: "#3d3d3d",
      gradientStart: "#3d3d3d",
      gradientEnd: "#1a1a1a",
      gradientDirection: "to bottom",
      textColor: "#ffffff",
      socialLinks: [
        {
          url: `https://www.twitch.tv/${streamer.streamer_name.toLowerCase()}`,
          platform: "twitch.tv",
          icon: "fa-twitch",
          label: "Twitch",
        },
      ],
    },
  });

  // Use field array for dynamic social links
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "socialLinks",
  });

  // Auto-update icon when URL changes
  const watchSocialLinks = form.watch("socialLinks");

  useEffect(() => {
    // For each social link, update the icon based on the URL
    watchSocialLinks.forEach((link, index) => {
      if (link.url) {
        const { icon, platform, label } = guessSocialFromUrl(link.url);

        if (icon !== form.getValues(`socialLinks.${index}.icon`)) {
          form.setValue(`socialLinks.${index}.icon`, icon);
          form.setValue(`socialLinks.${index}.platform`, platform);

          // Auto-suggest a label if none exists
          if (!link.label) {
            form.setValue(`socialLinks.${index}.label`, label);
          }
        }
      }
    });
  }, [watchSocialLinks, form]);

  // Convert form values to the format expected by the generator
  const convertFormValuesToApiFormat = (formValues: WebsiteFormValues) => {
    return {
      ...formValues,
      socialLinks: formValues.socialLinks.map((link) => ({
        url: link.url,
        icon: link.icon,
        label: link.label || extractDomainFromUrl(link.url),
      })),
    };
  };

  // Generate website files and trigger download
  const handleGenerate = async (data: WebsiteFormValues) => {
    setIsGenerating(true);
    try {
      const formattedData = convertFormValuesToApiFormat(data);
      const zipBlob = await generateWebsiteFiles(
        formattedData,
        streams,
        discordProfileImageUrl,
        streamer.streamer_name
      );

      // Create download link
      const downloadUrl = URL.createObjectURL(zipBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = downloadUrl;
      downloadLink.download = `${data.streamerName.toLowerCase()}-website.zip`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // Clean up URL
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error generating website:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper to get values for preview
  const getPreviewValues = () => {
    return convertFormValuesToApiFormat(form.getValues());
  };

  // Background style generator
  const getBackgroundStyle = () => {
    const {
      backgroundType,
      backgroundColor,
      gradientStart,
      gradientEnd,
      gradientDirection,
    } = form.getValues();

    if (backgroundType === "gradient") {
      return `linear-gradient(${gradientDirection}, ${gradientStart}, ${gradientEnd})`;
    }

    return backgroundColor;
  };

  // Add new social link
  const handleAddSocialLink = () => {
    if (fields.length < 10) {
      append({ url: "", platform: "custom", icon: "fa-link" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Website Generator
          </DialogTitle>
          <DialogDescription>
            Create a customized website to display your stream schedule and
            social media links.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="customize">Customize</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="customize" className="space-y-6">
            <Form {...form}>
              <form className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Settings</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="streamerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Streamer Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div>
                      {discordProfileImageUrl && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="h-12 w-12 rounded-full overflow-hidden border">
                            <img
                              src={discordProfileImageUrl}
                              alt="Discord Profile"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            Using Discord profile image
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="backgroundType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Background Type</FormLabel>
                        <FormControl>
                          <div className="flex space-x-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="radio"
                                checked={field.value === "color"}
                                onChange={() => field.onChange("color")}
                                className="accent-primary w-4 h-4"
                              />
                              <span>Solid Color</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="radio"
                                checked={field.value === "gradient"}
                                onChange={() => field.onChange("gradient")}
                                className="accent-primary w-4 h-4"
                              />
                              <span>Gradient</span>
                            </label>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("backgroundType") === "color" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="backgroundColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Background Color</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input {...field} type="color" />
                              </FormControl>
                              <Input
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                              <div
                                className="w-10 h-10 rounded border"
                                style={{ backgroundColor: field.value }}
                              />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="textColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Text Color</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input {...field} type="color" />
                              </FormControl>
                              <Input
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                              <div
                                className="w-10 h-10 rounded border"
                                style={{ backgroundColor: field.value }}
                              />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="gradientStart"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gradient Start Color</FormLabel>
                              <div className="flex gap-2">
                                <FormControl>
                                  <Input {...field} type="color" />
                                </FormControl>
                                <Input
                                  value={field.value}
                                  onChange={(e) =>
                                    field.onChange(e.target.value)
                                  }
                                />
                                <div
                                  className="w-10 h-10 rounded border"
                                  style={{ backgroundColor: field.value }}
                                />
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="gradientEnd"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gradient End Color</FormLabel>
                              <div className="flex gap-2">
                                <FormControl>
                                  <Input {...field} type="color" />
                                </FormControl>
                                <Input
                                  value={field.value}
                                  onChange={(e) =>
                                    field.onChange(e.target.value)
                                  }
                                />
                                <div
                                  className="w-10 h-10 rounded border"
                                  style={{ backgroundColor: field.value }}
                                />
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="gradientDirection"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gradient Direction</FormLabel>
                            <FormControl>
                              <select
                                className="w-full p-2 border rounded-md"
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                              >
                                <option value="to right">
                                  Horizontal (Left to Right)
                                </option>
                                <option value="to bottom">
                                  Vertical (Top to Bottom)
                                </option>
                                <option value="to bottom right">
                                  Diagonal (Top-Left to Bottom-Right)
                                </option>
                                <option value="to bottom left">
                                  Diagonal (Top-Right to Bottom-Left)
                                </option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div
                        className="p-4 rounded-md h-20"
                        style={{ background: getBackgroundStyle() }}
                      >
                        <p
                          className="text-center"
                          style={{ color: form.watch("textColor") }}
                        >
                          Preview of gradient background
                        </p>
                      </div>

                      <FormField
                        control={form.control}
                        name="textColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Text Color</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input {...field} type="color" />
                              </FormControl>
                              <Input
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                              <div
                                className="w-10 h-10 rounded border"
                                style={{ backgroundColor: field.value }}
                              />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Social Media Links</h3>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleAddSocialLink}
                      disabled={fields.length >= 10}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Link
                    </Button>
                  </div>

                  {fields.length === 0 && (
                    <Card>
                      <CardContent className="p-4 text-center text-muted-foreground">
                        No social links added. Click "Add Link" to add your
                        first social media link.
                      </CardContent>
                    </Card>
                  )}

                  {fields.length >= 10 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Maximum of 10 social links reached.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <Card key={field.id} className="p-1">
                        <CardContent className="p-3">
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium">
                                {form.getValues(`socialLinks.${index}.label`) ||
                                  "Social Link"}{" "}
                                {index + 1}
                              </h4>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => remove(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <FormField
                                control={form.control}
                                name={`socialLinks.${index}.url`}
                                render={({ field }) => (
                                  <FormItem className="col-span-2">
                                    <FormLabel className="sr-only">
                                      URL
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        placeholder="https://example.com"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`socialLinks.${index}.label`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="sr-only">
                                      Label
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        placeholder="Label (Optional)"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <Separator />
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="preview">
            <WebsitePreview
              formValues={getPreviewValues()}
              streams={streams}
              pfp_url={discordProfileImageUrl}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          {activeTab === "customize" ? (
            <Button onClick={() => setActiveTab("preview")}>
              Preview Website
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setActiveTab("customize")}
              >
                Back to Editor
              </Button>
              <Button
                onClick={() => handleGenerate(form.getValues())}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <LoadingIndicator size="sm" className="mr-2" />
                    Generating...
                  </>
                ) : (
                  "Download Website Files"
                )}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
