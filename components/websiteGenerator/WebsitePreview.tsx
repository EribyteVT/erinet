// components/Streams/WebsiteGenerator/WebsitePreview.tsx
import React from "react";
import { Stream } from "@/components/Streams/types";

interface WebsitePreviewProps {
  formValues: {
    streamerName: string;
    backgroundColor: string;
    textColor: string;
    // Social media links
    twitch?: string;
    youtube?: string;
    discord?: string;
    twitter?: string;
    instagram?: string;
    tiktok?: string;
    throne?: string;
    bluesky?: string;
    reddit?: string;
    tumblr?: string;
    merch?: string;
    // Other data
    [key: string]: any;
  };
  streams: Stream[];
}

export function WebsitePreview({ formValues, streams }: WebsitePreviewProps) {
  // Generate sample social icons based on the form values
  const renderSocialIcons = () => {
    const socialLinks = [
      { key: 'twitch', icon: 'fab fa-twitch' },
      { key: 'youtube', icon: 'fab fa-youtube' },
      { key: 'discord', icon: 'fab fa-discord' },
      { key: 'twitter', icon: 'fab fa-twitter' },
      { key: 'instagram', icon: 'fab fa-instagram' },
      { key: 'tiktok', icon: 'fab fa-tiktok' },
      { key: 'throne', icon: 'fa-solid fa-crown' },
      { key: 'bluesky', icon: 'fab fa-bluesky' },
      { key: 'merch', icon: 'fa-solid fa-bag-shopping' },
      { key: 'reddit', icon: 'fab fa-reddit' },
      { key: 'tumblr', icon: 'fab fa-tumblr' }
    ];

    return socialLinks.map(social => {
      if (formValues[social.key]) {
        return (
          <div 
            key={social.key} 
            className="text-4xl md:text-5xl px-3 inline-flex items-center"
            style={{ color: formValues.textColor }}
          >
            <i className={social.icon}></i>
          </div>
        );
      }
      return null;
    }).filter(Boolean);
  };

  // Generate sample schedule rows
  const renderScheduleRows = () => {
    // Sample days for the preview
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    
    // Create a row for today plus a few more days
    const today = new Date();
    const todayIndex = today.getDay() - 1 >= 0 ? today.getDay() - 1 : 6; // Convert 0-indexed Sunday to 0-indexed Monday
    
    return days.slice(todayIndex, todayIndex + 3).map((day, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      
      // Check if we have a stream on this day from our real data
      let streamForDay = null;
      for (const stream of streams) {
        const streamDate = new Date(stream.stream_date);
        if (streamDate.getDate() === date.getDate() && 
            streamDate.getMonth() === date.getMonth()) {
          streamForDay = stream;
          break;
        }
      }
      
      return (
        <div key={day} className="preview-grid-row">
          <div className="preview-day">{day}</div>
          <div className="preview-date">
            {(date.getMonth() + 1).toString()}/{date.getDate().toString()}
          </div>
          <div className="preview-stream">
            {streamForDay ? streamForDay.stream_name : "No Stream"}
            {streamForDay ? " at 2:00pm PST" : ""}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="preview-container border rounded-md overflow-hidden">
      <div className="text-center mb-4 p-2 bg-slate-100 dark:bg-slate-800 font-medium">
        Website Preview
      </div>
      
      <div
        className="preview-content p-4 flex flex-col min-h-[600px]"
        style={{
          backgroundColor: formValues.backgroundColor,
          color: formValues.textColor
        }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-center mb-4">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-300 border-4 border-gray-400">
            <img src="/api/placeholder/240/240" alt="Profile placeholder" className="w-full h-full object-cover" />
          </div>
          <h1 
            className="ml-4 text-4xl sm:text-5xl font-bold"
            style={{ color: formValues.textColor }}
          >
            {formValues.streamerName}
          </h1>
        </div>
        
        <div className="flex justify-center my-4 flex-wrap">
          {renderSocialIcons()}
        </div>
        
        <div className="schedule-grid mt-4">
          <div className="preview-grid-row">
            <div className="preview-header-day">Day</div>
            <div className="preview-header-date">Date</div>
            <div className="preview-header-stream">Stream/Time</div>
          </div>
          
          {renderScheduleRows()}
        </div>
        
        <div className="countdown-banner mt-4 p-2 bg-gray-200 rounded-md text-center text-black text-xl">
          <b>Next Stream Countdown: 2:14:35</b>
        </div>
        
        <div className="mt-auto text-right text-sm p-2">
          <p>made with ❤️ using Erinet</p>
        </div>
      </div>
      
      <style jsx>{`
        .preview-content {
          font-family: monospace;
        }
        
        .preview-grid-row {
          display: grid;
          grid-template-columns: 20% 13% 66%;
          gap: 5px;
          margin: 8px 0;
        }
        
        .preview-header-day, .preview-header-date, .preview-header-stream, 
        .preview-day, .preview-date, .preview-stream {
          background-color: #dddddd;
          color: black;
          text-align: center;
          border-radius: 8px;
          border: 2px solid black;
          padding: 8px;
          font-weight: bold;
        }
        
        .preview-header-day, .preview-header-date, .preview-header-stream {
          font-size: 1.2rem;
        }
      `}</style>
    </div>
  );
}