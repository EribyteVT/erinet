import React, { useEffect, useRef } from "react";
import DOMPurify from "dompurify";

interface WebsitePreviewProps {
  html: string;
  css: string;
  js: string;
}

export default function WebsitePreview({ html, css, js }: WebsitePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    // Get current date for mock schedule
    const today = new Date();
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const currentDayIndex = today.getDay();

    // Create mock schedule HTML with pre-populated streams
    let mockScheduleHTML = `
      <div id="gridSchedule" class="gridSchedule">
        <div class="gridRow">
          <div class="TableHeader scheduleDay">Day</div>
          <div class="TableHeader scheduleDate">Date</div>
          <div class="TableHeader scheduleStream">stream/time</div>
        </div>
    `;

    // Create schedule for the next 7 days with some mock streams
    for (let i = 0; i < 7; i++) {
      const dayIndex = (currentDayIndex + i) % 7;
      const dayName = dayNames[dayIndex];

      // Calculate date for this row
      const rowDate = new Date(today);
      rowDate.setDate(today.getDate() + i);
      const formattedDate = `${rowDate.getMonth() + 1}/${rowDate.getDate()}`;

      // Add a mock stream for certain days
      if (i === 1 || i === 3 || i === 5) {
        // Streams on days 1, 3, and 5
        const streamName =
          i === 1
            ? "Gaming Stream"
            : i === 3
            ? "Just Chatting"
            : "Special Event";
        const streamTime = i === 1 ? "7:00pm" : i === 3 ? "3:00pm" : "8:00pm";

        mockScheduleHTML += `
          <div class="gridRow">
            <div class="scheduleDay">${dayName}</div>
            <div class="scheduleDate">${formattedDate}</div>
            <div class="scheduleStream"><a href="#">${streamName}</a> at ${streamTime} EDT</div>
          </div>
        `;
      } else {
        // No stream for this day
        mockScheduleHTML += `
          <div class="gridRow">
            <div class="scheduleDay">${dayName}</div>
            <div class="scheduleDate">${formattedDate}</div>
            <div class="scheduleStream">No Stream</div>
          </div>
        `;
      }
    }

    mockScheduleHTML += `</div>`;

    // Add the countdown element
    mockScheduleHTML += `
      <div id="NextStreamCountdown" class="center">
        <div id="streamNow" hidden>
          <b>Stream is NOW! <a href="#">Join the stream</a></b>
        </div>
        <div id="streamCountdown">
          <b>Next Stream Countdown: <span id="Countdown">1:04:12:45</span></b>
        </div>
      </div>
    `;

    // Create simplified JS that just updates the countdown timer for demo purposes
    const simplifiedJS = `
      // Just for demo - decreasing countdown timer
      let countdown = document.getElementById("Countdown");
      let countdownValue = "1:04:12:45";
      
      if (countdown) {
        countdown.innerHTML = countdownValue;
        
        // Simulate countdown ticking
        setInterval(() => {
          let parts = countdownValue.split(":");
          let seconds = parseInt(parts[3]);
          seconds = seconds > 0 ? seconds - 1 : 59;
          
          let minutes = parseInt(parts[2]);
          if (seconds === 59) {
            minutes = minutes > 0 ? minutes - 1 : 59;
          }
          
          let hours = parseInt(parts[1]);
          if (seconds === 59 && minutes === 59) {
            hours = hours > 0 ? hours - 1 : 23;
          }
          
          let days = parseInt(parts[0]);
          if (seconds === 59 && minutes === 59 && hours === 23) {
            days = days > 0 ? days - 1 : 0;
          }
          
          countdownValue = \`\${days}:\${String(hours).padStart(2, "0")}:\${String(minutes).padStart(2, "0")}:\${String(seconds).padStart(2, "0")}\`;
          countdown.innerHTML = countdownValue;
        }, 1000);
      }
    `;

    // Replace the schedule placeholder in HTML with our mock schedule
    let modifiedHTML = html.replace(
      /<div id="gridSchedule"[\s\S]*?<\/div>\s*<div id="NextStreamCountdown"[\s\S]*?<\/div>/,
      mockScheduleHTML
    );

    // Create a combined HTML document with inline CSS and JS
    const combinedContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>${DOMPurify.sanitize(css)}</style>
            <link
              rel="stylesheet"
              href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
            />
          </head>
          <body>
            ${DOMPurify.sanitize(modifiedHTML)}
            <script>${DOMPurify.sanitize(simplifiedJS)}</script>
          </body>
        </html>
      `;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(combinedContent);
      iframeDoc.close();
    }
  }, [html, css, js]);

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-full border-0"
      title="Website Preview"
    ></iframe>
  );
}
