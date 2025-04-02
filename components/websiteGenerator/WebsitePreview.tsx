// components/Streams/WebsiteGenerator/WebsitePreview.tsx
"use client";

import React from "react";
import { Stream } from "@/components/Streams/types";
import { Icon } from '@iconify/react';

// This should match the form schema type from WebsiteGeneratorModal
interface WebsitePreviewProps {
  formValues: {
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
  };
  streams: Stream[];
}

export function WebsitePreview({ formValues, streams }: WebsitePreviewProps) {
  // Get the background style
  const backgroundStyle = formValues.backgroundType === "gradient"
    ? `linear-gradient(${formValues.gradientDirection}, ${formValues.gradientStart}, ${formValues.gradientEnd})`
    : formValues.backgroundColor;

  // Sort streams by date
  const sortedStreams = [...streams].sort((a, b) => {
    const dateA = new Date(a.stream_date).getTime();
    const dateB = new Date(b.stream_date).getTime();
    return dateA - dateB;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  // Default profile image if none provided
  const profileImageUrl = formValues.profileImage || "https://via.placeholder.com/150";

  return (
    <div className="rounded-lg overflow-hidden border border-border">
      <div 
        className="w-full p-4 flex flex-col items-center"
        style={{ 
          background: backgroundStyle,
          color: formValues.textColor,
          minHeight: "500px",
          fontFamily: "sans-serif"
        }}
      >
        {/* Header */}
        <div className="flex flex-col items-center py-6 w-full">
          <div className="rounded-full overflow-hidden w-24 h-24 mb-4 border-4" style={{ borderColor: formValues.textColor }}>
            <img 
              src={profileImageUrl} 
              alt={`${formValues.streamerName} profile`}
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-4xl font-bold mb-4" style={{ color: formValues.textColor }}>
            {formValues.streamerName}
          </h1>

          {/* Social Links */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {formValues.socialLinks.map((social, index) => (
              <a 
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-2 rounded-full transition-transform hover:scale-110"
                style={{ 
                  backgroundColor: `${formValues.textColor}20`, 
                  color: formValues.textColor,
                  width: "50px",
                  height: "50px"
                }}
                title={social.label || "Social link"}
              >
                <Icon icon={social.icon} style={{ fontSize: '28px' }} />
              </a>
            ))}
          </div>
        </div>

        {/* Stream Schedule */}
        <div 
          className="w-full max-w-3xl mx-auto p-4 rounded-lg"
          style={{ backgroundColor: `${formValues.textColor}10` }}
        >
          <h2 className="text-2xl font-bold mb-4 text-center" style={{ color: formValues.textColor }}>
            Upcoming Streams
          </h2>
          
          {sortedStreams.length > 0 ? (
            <div className="space-y-3">
              {sortedStreams.slice(0, 5).map((stream, index) => (
                <div 
                  key={index}
                  className="p-3 rounded-lg transition-transform hover:scale-102"
                  style={{ backgroundColor: `${formValues.textColor}20` }}
                >
                  <h3 className="text-lg font-semibold" style={{ color: formValues.textColor }}>
                    {stream.stream_name}
                  </h3>
                  <p style={{ color: `${formValues.textColor}95` }}>
                    {formatDate(stream.stream_date)}
                  </p>
                  {stream.duration && (
                    <p style={{ color: `${formValues.textColor}80` }}>
                      Duration: {stream.duration} minutes
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-4" style={{ color: `${formValues.textColor}80` }}>
              No upcoming streams scheduled
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="w-full text-center mt-8 pt-4" style={{ color: `${formValues.textColor}60` }}>
          <p>Generated with Eribot Website Generator</p>
        </div>
      </div>
    </div>
  );
}