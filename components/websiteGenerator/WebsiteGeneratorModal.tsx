// components/Streams/WebsiteGenerator/WebsiteGeneratorModal.tsx
"use client";

import React, { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Icon } from '@iconify/react';
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

// Define form schema with zod
const websiteFormSchema = z.object({
  streamerName: z.string().min(1, "Streamer name is required"),
  profileImage: z.string().url("Must be a valid URL").optional(),
  backgroundColor: z.string().default("#3d3d3d"),
  textColor: z.string().default("#ffffff"),
  // Social media links
  twitch: z.string().url("Must be a valid URL").or(z.literal('')).optional(),
  youtube: z.string().url("Must be a valid URL").or(z.literal('')).optional(),
  discord: z.string().url("Must be a valid URL").or(z.literal('')).optional(),
  twitter: z.string().url("Must be a valid URL").or(z.literal('')).optional(),
  instagram: z.string().url("Must be a valid URL").or(z.literal('')).optional(),
  tiktok: z.string().url("Must be a valid URL").or(z.literal('')).optional(),
  throne: z.string().url("Must be a valid URL").or(z.literal('')).optional(),
  bluesky: z.string().url("Must be a valid URL").or(z.literal('')).optional(),
  // Optional socials
  reddit: z.string().url("Must be a valid URL").or(z.literal('')).optional(),
  tumblr: z.string().url("Must be a valid URL").or(z.literal('')).optional(),
  merch: z.string().url("Must be a valid URL").or(z.literal('')).optional(),
  // Options
  showHiddenSocials: z.boolean().default(false),
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

  // Initialize form with default values
  const form = useForm<WebsiteFormValues>({
    resolver: zodResolver(websiteFormSchema),
    defaultValues: {
      streamerName: streamer.streamer_name,
      backgroundColor: "#3d3d3d",
      textColor: "#ffffff",
      showHiddenSocials: false,
      useCustomStreamFetch: false,
      twitch: `https://www.twitch.tv/${streamer.streamer_name.toLowerCase()}`,
      apiEndpoint: `https://erinet.eribyte.net/api/streams?streamerId=${streamer.streamer_id}&dateStart=`
    },
  });

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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="backgroundColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Background Color</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
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
                              <Input {...field} />
                            </FormControl>
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
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Social Media Links</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="twitch"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <Icon icon="mdi:twitch" className="inline mr-2" />
                            Twitch
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://www.twitch.tv/username" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="youtube"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <Icon icon="mdi:youtube" className="inline mr-2" />
                            YouTube
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://www.youtube.com/@username" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="discord"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <Icon icon="mdi:discord" className="inline mr-2" />
                            Discord
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://discord.gg/invite" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="twitter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <Icon icon="mdi:twitter" className="inline mr-2" />
                            Twitter
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://twitter.com/username" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="instagram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <Icon icon="mdi:instagram" className="inline mr-2" />
                            Instagram
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://www.instagram.com/username" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="tiktok"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <Icon icon="ic:baseline-tiktok" className="inline mr-2" />
                            TikTok
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://www.tiktok.com/@username" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="throne"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <Icon icon="fa6-solid:crown" className="inline mr-2" />
                            Throne
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://throne.com/username" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bluesky"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <Icon icon="ri:bluesky-fill" className="inline mr-2" />
                            Bluesky
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://bsky.app/profile/username" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="merch"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <Icon icon="mdi:shopping" className="inline mr-2" />
                            Merch Store
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://example.com/store" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {form.watch("showHiddenSocials") && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Additional Social Links</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="reddit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              <Icon icon="mdi:reddit" className="inline mr-2" />
                              Reddit
                            </FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://www.reddit.com/r/username" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="tumblr"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              <Icon icon="mdi:tumblr" className="inline mr-2" />
                              Tumblr
                            </FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://username.tumblr.com" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Advanced Options</h3>
                  
                  <FormField
                    control={form.control}
                    name="showHiddenSocials"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Show hidden social media options</FormLabel>
                          <FormDescription>
                            Enable additional social media options like Reddit and Tumblr
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
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