import { Streamer } from "../Streams/types";

type SocialLink = {
  icon: string;
  url: string;
  tooltip: string;
};

type WebsiteConfig = {
  backgroundColor: string;
  name: string;
  socialLinks: SocialLink[];
};

export function generateJS(
  config: WebsiteConfig,
  streamer: Streamer,
  crudUrl: string
): string {
  return `Date.prototype.addDays = function (days) {
        let date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    };
    
    // Streamer ID set during site generation
    const STREAMER_ID = "${streamer.streamer_id}";
    const API_BASE_URL = "${crudUrl}";
    
    let countdown;
    let streams = [];
    let streamNowEle = document.getElementById("streamNow");
    let streamCountdownEle = document.getElementById("streamCountdown");
    let updateCountdownTimer;
    let gridSchedule = document.getElementById("gridSchedule");
    
    // Day names for convenience
    const DAYS_OF_WEEK = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ];
    
    function updateCountdownCheck() {
      
      let now = Date.now();
      let timerSet = false;

      // Loop through the streams to get the next timer.
      for (let i = 0; i < streams.length; i++) {
        // Get the stream from the array.
        let soonestStream = streams[i];
        // Get and parse the date.
        let streamDate = Date.parse(soonestStream.date);
        // Get the difference between the stream set date and now.
        let delta = streamDate - now;
        // Check if the stream is in the future.
        if (delta > 0) {
          streamNowEle.hidden = true;
          streamCountdownEle.hidden = false;
          // Get to rendering the time countdown.
          renderStreamCountdown(delta);
          timerSet = true;
        } else if (delta + 1000 * 60 * soonestStream.duration > 0) {
          streamCountdownEle.hidden = true;
          streamNowEle.hidden = false;
          timerSet = true;
        }
        // Check if we set something.
        if (timerSet) {
          break;
        }
      }
      // If we did not set anything, hide the banners.
      if (timerSet === false) {
        streamCountdownEle.hidden = true;
        streamNowEle.hidden = true;
        console.log("No upcoming streams found.");
        // Remove the interval check, so we don't waste resources.
        clearInterval(updateCountdownTimer);
      }
    }
    
    function renderStreamCountdown(datetime) {
      const days = Math.floor(datetime / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (datetime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((datetime % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((datetime % (1000 * 60)) / 1000);
      let printString = "";
      if (days > 0) {
        printString += \`\${days}:\`;
      }
      printString += \`\${String(hours).padStart(2, "0")}:\${String(minutes).padStart(
        2,
        "0"
      )}:\${String(seconds).padStart(2, "0")}\`;
      countdown.innerHTML = printString;
    }
    
    async function fetchStreamsFromAPI() {
      try {
        if (!STREAMER_ID) {
          console.error("Streamer ID not set");
          return [];
        }
        
        //streamer id is local to the erinet system
        const now = Date.now();
        const url = \`\${API_BASE_URL}/getWeek/\${STREAMER_ID}\`;
        
        console.log(\`Fetching streams from \${url}\`);
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(\`Failed to fetch streams: \${response.status}\`);
        }
        
        const data = await response.json();
        console.log("API Response:", data);
        
        if (data && data.data) {
          return data.data;
        } else {
          console.error("Unexpected API response format:", data);
          return [];
        }
      } catch (error) {
        console.error("Error fetching streams:", error);
        return [];
      }
    }
    
    //we use this a lot cuz the crud service returns a string (cringe)
    function formatDateTime(streamDate) {
      console.log("FORMATTING DATE")
      console.log(streamDate)
      let t = streamDate.split(/[- :]/);
      let dayHourSplit = t[2].split("T");
      // Apply each element to the Date function
  
      let date = new Date(
        Date.UTC(t[0], t[1] - 1, dayHourSplit[0], dayHourSplit[1], t[3], 0)
      );
      console.log(date)
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'long' }),
        date: \`\${date.getMonth() + 1}/\${date.getDate()}\`,
        time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        datetime: date
      };
    }
    
    function updateStreamGrid(streamData) {
    console.log("UPGRADING GRID")
    console.log(streamData)
  
      // Clear existing rows except header just incase
      const headerRow = gridSchedule.querySelector('.gridRow:first-child');
      gridSchedule.innerHTML = '';
      gridSchedule.appendChild(headerRow);
      
      // Create a map to store streams by day of week
      const streamsByDay = {};
      
      // Process stream data
      if (streamData && streamData.length > 0) {
        // Sort streams by date
        streamData = streamData.sort((a, b) => parseInt(a.stream_date) - parseInt(b.stream_date));
        
        // Group streams by day of week
        streamData.forEach(stream => {
          const { day, date, time, datetime } = formatDateTime(stream.streamDate);
          
          if (!streamsByDay[day]) {
            streamsByDay[day] = [];
          }
          
          streamsByDay[day].push({
            name: stream.streamName,
            time: time,
            date: date,
            datetime: datetime,
            duration: stream.duration || 120
          });
          
          // Add to streams array for countdown
          streams.push({
            stream: stream.streamName,
            date: datetime,
            duration: stream.duration || 120 // Default to 2 hours if not specified
          });
        });
      }
      
      // Get current day of week from user
      const today = new Date();
      const currentDayIndex = today.getDay();
      
      // Create rows for all 7 days of the week, starting with today
      for (let i = 0; i < 7; i++) {
        const dayIndex = (currentDayIndex + i) % 7;
        const dayName = DAYS_OF_WEEK[dayIndex];
        
        // Create a date object for this day
        const thisDate = new Date(today);
        thisDate.setDate(today.getDate() + i);
        const formattedDate = \`\${thisDate.getMonth() + 1}/\${thisDate.getDate()}\`;
        
        // Check if we have streams for this day
        const dayStreams = streamsByDay[dayName] || [];
        
        if (dayStreams.length > 0) {
          // Create a row for each stream on this day
          dayStreams.forEach(stream => {
            const streamRow = document.createElement('div');
            streamRow.className = 'gridRow';
            streamRow.innerHTML = \`
              <div class="scheduleDay">\${dayName}</div>
              <div class="scheduleDate">\${stream.date}</div>
              <div class="scheduleStream"><a href=https://twitch.tv/${streamer.streamer_name}>\${stream.name}</a> at \${stream.time}</div>
            \`;
            gridSchedule.appendChild(streamRow);
          });
        } else {
          // Create an empty row for this day
          const emptyRow = document.createElement('div');
          emptyRow.className = 'gridRow';
          emptyRow.innerHTML = \`
            <div class="scheduleDay">\${dayName}</div>
            <div class="scheduleDate">\${formattedDate}</div>
            <div class="scheduleStream">No Stream</div>
          \`;
          gridSchedule.appendChild(emptyRow);
        }
      }
    }
    
    // make 7 empty rows
    function initializeEmptyGrid() {
      // Get current day of week
      const today = new Date();
      const currentDayIndex = today.getDay();
      
      // Clear existing rows except header
      const headerRow = gridSchedule.querySelector('.gridRow:first-child');
      gridSchedule.innerHTML = '';
      gridSchedule.appendChild(headerRow);
      
      // Create rows for all 7 days of the week, starting with today
      for (let i = 0; i < 7; i++) {
        const dayIndex = (currentDayIndex + i) % 7;
        const dayName = DAYS_OF_WEEK[dayIndex];
        
        // Create a date object for this day
        const thisDate = new Date(today);
        thisDate.setDate(today.getDate() + i);
        const formattedDate = \`\${thisDate.getMonth() + 1}/\${thisDate.getDate()}\`;
        
        // Create an empty row for this day
        const emptyRow = document.createElement('div');
        emptyRow.className = 'gridRow';
        emptyRow.innerHTML = \`
          <div class="scheduleDay">\${dayName}</div>
          <div class="scheduleDate">\${formattedDate}</div>
          <div class="scheduleStream">No Stream</div>
        \`;
        gridSchedule.appendChild(emptyRow);
      }
    }
    
    window.onload = async function () {
      streamNowEle = document.getElementById("streamNow");
      streamCountdownEle = document.getElementById("streamCountdown");
      countdown = document.getElementById("Countdown");
      gridSchedule = document.getElementById("gridSchedule");
      
      // Initialize with empty grid to ensure all days are shown
      initializeEmptyGrid();
      
      // Try to fetch streams from API
      const apiStreams = await fetchStreamsFromAPI();
      
      if (apiStreams && apiStreams.length > 0) {
        // Update the grid with fetched streams
        streams = []; // Clear any existing streams
        updateStreamGrid(apiStreams);
      } 
      
      // Sort streams by date
      streams.sort((a, b) => {
        return a.date.getTime() - b.date.getTime();
      });
      
      // Start countdown timer if we have streams
      if (streams.length > 0) {
        updateCountdownCheck();
        updateCountdownTimer = setInterval(updateCountdownCheck, 1000);
      }
    };`;
}
