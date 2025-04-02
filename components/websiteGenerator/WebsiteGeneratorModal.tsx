// components/Streams/WebsiteGenerator/WebsiteGeneratorModal.tsx
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
import { Plus, X, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Social media URL to icon mapping
const SOCIAL_MEDIA_ICONS: Record<string, string> = {
  "twitch.tv": "mdi:twitch",
  "youtube.com": "mdi:youtube",
  "discord.gg": "mdi:discord",
  "discord.com": "mdi:discord",
  "twitter.com": "mdi:twitter",
  "x.com": "mdi:twitter",
  "instagram.com": "mdi:instagram",
  "tiktok.com": "ic:baseline-tiktok",
  "throne.com": "fa6-solid:crown",
  "bsky.app": "ri:bluesky-fill",
  "reddit.com": "mdi:reddit",
  "tumblr.com": "mdi:tumblr",
  "ko-fi.com": "simple-icons:kofi",
  "patreon.com": "mdi:patreon",
  "facebook.com": "mdi:facebook",
  "github.com": "mdi:github",
  "linkedin.com": "mdi:linkedin",
  "threads.net": "simple-icons:threads",
  "pinterest.com": "mdi:pinterest",
  "spotify.com": "mdi:spotify",
  "snapchat.com": "mdi:snapchat",
};

// Helper function to guess icon from URL
const guessIconFromUrl = (url: string): string => {
  try {
    const hostname = new URL(url).hostname;
    for (const [domain, icon] of Object.entries(SOCIAL_MEDIA_ICONS)) {
      if (hostname.includes(domain)) {
        return icon;
      }
    }
    return "mdi:link"; // Default icon if no match
  } catch (error) {
    return "mdi:link"; // Return default icon if URL is invalid
  }
};

// Define the social link schema
const SocialLinkSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  icon: z.string().default("mdi:link"),
  label: z.string().optional(),
});

// Define form schema with zod
const websiteFormSchema = z.object({
  streamerName: z.string().min(1, "Streamer name is required"),
  profileImage: z.string().url("Must be a valid URL").or(z.literal('')).optional(),
  // Background can be either a solid color or a gradient
  backgroundType: z.enum(["color", "gradient"]),
  backgroundColor: z.string().default("#3d3d3d"),
  gradientStart: z.string().default("#3d3d3d"),
  gradientEnd: z.string().default("#1a1a1a"),
  gradientDirection: z.enum(["to right", "to bottom", "to bottom right", "to bottom left"]).default("to bottom"),
  textColor: z.string().default("#ffffff"),
  // Social media links as an array
  socialLinks: z.array(SocialLinkSchema).max(10, "Maximum of 10 social links allowed"),
  // Options
  useCustomStreamFetch: z.boolean().default(false),
  apiEndpoint: z.string().optional(),
});

type WebsiteFormValues = z.infer<typeof websiteFormSchema>;

interface WebsiteGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  streamer: Streamer;
  streams: Stream[];
}

export function WebsiteGeneratorModal({
  isOpen,
  onClose,
  streamer,
  streams,
}: WebsiteGeneratorModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("customize");
  const [iconImportScript, setIconImportScript] = useState<string>("");

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
          icon: "mdi:twitch",
          label: "Twitch"
        }
      ],
      useCustomStreamFetch: false,
      apiEndpoint: `https://erinet.eribyte.net/api/streams?streamerId=${streamer.streamer_id}&dateStart=`
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
        const guessedIcon = guessIconFromUrl(link.url);
        if (guessedIcon !== form.getValues(`socialLinks.${index}.icon`)) {
          form.setValue(`socialLinks.${index}.icon`, guessedIcon);
          
          // Auto-suggest a label based on the domain
          if (!link.label) {
            try {
              const hostname = new URL(link.url).hostname;
              const domain = hostname.replace('www.', '').split('.')[0];
              form.setValue(
                `socialLinks.${index}.label`, 
                domain.charAt(0).toUpperCase() + domain.slice(1)
              );
            } catch (error) {
              // Handle invalid URLs gracefully
            }
          }
        }
      }
    });

    // Generate list of unique icons for the Icon component import
    const uniqueIcons = [...new Set(watchSocialLinks.map(link => link.icon))];
    if (uniqueIcons.length > 0) {
      setIconImportScript(`import { Icon } from '@iconify/react';`);
    }
  }, [watchSocialLinks, form]);

  // Generate website files and trigger download
  const handleGenerate = async (data: WebsiteFormValues) => {
    setIsGenerating(true);
    try {
      const zipBlob = await generateWebsiteFiles(data, streams);
      
      // Create download link
      const downloadUrl = URL.createObjectURL(zipBlob);
      const downloadLink = document.createElement('a');
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
    return form.getValues();
  };

  // Background style generator
  const getBackgroundStyle = () => {
    const { backgroundType, backgroundColor, gradientStart, gradientEnd, gradientDirection } = form.getValues();
    
    if (backgroundType === "gradient") {
      return `linear-gradient(${gradientDirection}, ${gradientStart}, ${gradientEnd})`;
    }
    
    return backgroundColor;
  };

  // Add new social link
  const handleAddSocialLink = () => {
    if (fields.length < 10) {
      append({ url: "", icon: "mdi:link" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Website Generator</DialogTitle>
          <DialogDescription>
            Create a customized website to display your stream schedule and social media links.
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
                    
                    <FormField
                      control={form.control}
                      name="profileImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profile Image URL</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://example.com/image.png" />
                          </FormControl>
                          <FormDescription>
                            Leave empty to use the default image
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                              <Input value={field.value} onChange={(e) => field.onChange(e.target.value)} />
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
                              <Input value={field.value} onChange={(e) => field.onChange(e.target.value)} />
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
                                <Input value={field.value} onChange={(e) => field.onChange(e.target.value)} />
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
                                <Input value={field.value} onChange={(e) => field.onChange(e.target.value)} />
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
                                <option value="to right">Horizontal (Left to Right)</option>
                                <option value="to bottom">Vertical (Top to Bottom)</option>
                                <option value="to bottom right">Diagonal (Top-Left to Bottom-Right)</option>
                                <option value="to bottom left">Diagonal (Top-Right to Bottom-Left)</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="p-4 rounded-md h-20" style={{ background: getBackgroundStyle() }}>
                        <p className="text-center" style={{ color: form.watch("textColor") }}>
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
                              <Input value={field.value} onChange={(e) => field.onChange(e.target.value)} />
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
                        No social links added. Click "Add Link" to add your first social media link.
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
                                Social Link {index + 1}
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
                                    <FormLabel className="sr-only">URL</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="https://example.com" />
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
                                    <FormLabel className="sr-only">Label</FormLabel>
                                    <FormControl>
                                      <Input {...field} placeholder="Label (Optional)" />
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

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Advanced Options</h3>
                  
                  <FormField
                    control={form.control}
                    name="useCustomStreamFetch"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Use Erinet API for live schedule</FormLabel>
                          <FormDescription>
                            Fetch stream schedule data directly from Erinet
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  {form.watch("useCustomStreamFetch") && (
                    <FormField
                      control={form.control}
                      name="apiEndpoint"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Endpoint</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            This will be the endpoint used to fetch your schedule data
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="preview">
            <WebsitePreview 
              formValues={getPreviewValues()} 
              streams={streams}
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
              <Button variant="outline" onClick={() => setActiveTab("customize")}>
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