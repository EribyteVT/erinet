// components/Streams/WebsiteGenerator/WebsitePreview.tsx
"use client";

import React from "react";
import { Stream } from "@/components/Streams/types";

// This should match the form schema type from WebsiteGeneratorModal
interface WebsitePreviewProps {
  formValues: {
    streamerName: string;
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
  };
  streams: Stream[];
  pfp_url: string;
}

export function WebsitePreview({
  formValues,
  streams,
  pfp_url,
}: WebsitePreviewProps) {
  // Get the background style
  const backgroundStyle =
    formValues.backgroundType === "gradient"
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
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  // Default profile image if none provided
  const profileImageUrl = pfp_url;

  return (
    <div className="rounded-lg overflow-hidden border border-border">
      <div
        className="w-full p-4 flex flex-col items-center"
        style={{
          background: backgroundStyle,
          color: formValues.textColor,
          minHeight: "500px",
          fontFamily: "monospace",
        }}
      >
        {/* Header */}
        <div className="flex items-center py-6 w-full justify-center">
          <div className="rounded-3xl overflow-hidden w-24 h-24 mr-6">
            <img
              src={profileImageUrl}
              alt={`${formValues.streamerName} profile`}
              className="w-full h-full object-cover"
            />
          </div>
          <h1
            className="text-4xl font-bold"
            style={{ color: formValues.textColor }}
          >
            {formValues.streamerName}
          </h1>
        </div>

        {/* Social Links */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {formValues.socialLinks.map((social, index) => (
            <div
              key={index}
              className="rounded-lg text-center p-2"
              title={social.label || "Social link"}
            >
              <i
                className={`fab ${social.icon.replace("fa-", "")}`}
                style={{ fontSize: "2em", color: formValues.textColor }}
              ></i>
            </div>
          ))}
        </div>

        {/* Stream Schedule */}
        <div className="w-full">
          <div className="grid grid-cols-1 gap-2">
            {/* Header Row */}
            <div className="grid grid-cols-3 text-center mb-2">
              <div
                className="text-xl font-bold p-2 rounded-lg"
                style={{ color: formValues.textColor }}
              >
                Day
              </div>
              <div
                className="text-xl font-bold p-2 rounded-lg"
                style={{ color: formValues.textColor }}
              >
                Date
              </div>
              <div
                className="text-xl font-bold p-2 rounded-lg"
                style={{ color: formValues.textColor }}
              >
                Stream/Time
              </div>
            </div>

            {/* Stream Rows */}
            {sortedStreams.length > 0 ? (
              sortedStreams.slice(0, 4).map((stream, index) => {
                const date = new Date(stream.stream_date);
                const day = date.toLocaleDateString("en-US", {
                  weekday: "long",
                });
                const dateStr = date.toLocaleDateString("en-US", {
                  month: "numeric",
                  day: "numeric",
                });
                const time = date.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                });

                return (
                  <div key={index} className="grid grid-cols-3 text-center">
                    <div
                      className="p-2 m-1 rounded-lg"
                      style={{
                        backgroundColor: "#ddd",
                        color: "black",
                        border: "4px solid black",
                        borderRadius: "25px",
                      }}
                    >
                      {day}
                    </div>
                    <div
                      className="p-2 m-1 rounded-lg"
                      style={{
                        backgroundColor: "#ddd",
                        color: "black",
                        border: "4px solid black",
                        borderRadius: "25px",
                      }}
                    >
                      {dateStr}
                    </div>
                    <div
                      className="p-2 m-1 rounded-lg"
                      style={{
                        backgroundColor: "#ddd",
                        color: "black",
                        border: "4px solid black",
                        borderRadius: "25px",
                      }}
                    >
                      {stream.stream_name} at {time}
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                className="text-center py-4"
                style={{ color: formValues.textColor }}
              >
                No upcoming streams scheduled
              </div>
            )}
          </div>
        </div>

        {/* Countdown */}
        <div
          className="w-full text-center mt-8 p-4 rounded-lg"
          style={{
            backgroundColor: "#ddd",
            color: "black",
            border: "4px solid black",
            borderRadius: "25px",
            maxWidth: "90%",
            margin: "0 auto",
          }}
        >
          <strong>Next Stream Countdown: 00:00:00</strong>
        </div>

        {/* Footer */}
        <div
          className="w-full text-right mt-8 pt-4"
          style={{ color: formValues.textColor }}
        >
          <p>
            made with ❤️ using{" "}
            <a href="#" style={{ color: formValues.textColor }}>
              Erinet
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
