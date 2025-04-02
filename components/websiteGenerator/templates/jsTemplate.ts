// components/Streams/WebsiteGenerator/templates/jsTemplate.ts
import { Stream } from "@/components/Streams/types";

export function jsTemplate(
  streamerName: string,
  apiEndpoint: string = "",
  streams: Stream[] = []
): string {
  // Format the streams data as a JSON string for embedding in the JS
  const streamsJSON = JSON.stringify(streams, null, 2);
  
  const useApiEndpoint = apiEndpoint !== "";

  return `Date.prototype.addDays = function (days) {
  let date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

let countdown;
let streams = [];
let streamNowEle = document.getElementById("streamNow");
let streamCountdownEle = document.getElementById("streamCountdown");
let updateCountdownTimer;

function updateCountdownCheck() {
  // Buffer time is 2 hours.
  // Once the stream starts we keep the "Stream is NOW" for 2 hours before moving to next stream.
  let now = Date.now();
  let timerSet = false;
  // Loop through the streams to get the next timer.
  for (let i = 0; i < streams.length; i++) {
    // Get the stream from the array.
    let soonestStream = streams[i];
    // Get and parse the date.
    let streamDate = Date.parse(soonestStream["date"]);
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
      // If the start time is within 2 hours, show the streaming now banner.
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
    console.log("No upcoming streams found");
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

${useApiEndpoint ? generateFetchFromApiCode(apiEndpoint) : generateStaticStreamsCode(streamsJSON)}

function displaySchedule() {
  let d = new Date();

  const weekdayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dateWeekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  let weekday = d.getDay(); //0 Sunday, 1 Monday
  let scheduleGrid = document.getElementById("gridSchedule");

  //get time zone
  let zone = new Date()
    .toLocaleTimeString("en-us", { timeZoneName: "short" })
    .split(" ")[2];
    
  //loop through the days, starting with today
  for (let i = 0; i < 7; i++) {
    //check if there is a stream today
    let streamObject = null;
    for (let z in streams) {
      //if there is a stream today
      let streamDate = new Date(streams[z].date);
      if (
        streamDate.getDate() == d.getDate() &&
        streamDate.getMonth() == d.getMonth()
      ) {
        streamObject = streams[z];
        break;
      }
    }
    
    let base = [
      "<div class = gridRow><div class = 'scheduleDay'>",
      "DAY_PLACEHOLDER",
      "</div><div class='scheduleDate'>",
      "PLACEHOLDER DATE",
      "</div><div class = 'scheduleStream'>",
      "STREAM_NAME",
      " at ",
      "STREAM TIME",
      "</div></div>",
    ];
    
    if (streamObject != null) {
      base[1] = weekdayNames[(weekday + i) % 7];
      base[3] = (d.getMonth() + 1).toString() + "/" + d.getDate().toString();
      
      let streamLink = "${useApiEndpoint ? "https://www.twitch.tv/" + streamerName.toLowerCase() : "streams[z].twitch_url || 'https://www.twitch.tv'" }";
      base[5] = "<a href='" + streamLink + "'>" + streamObject.stream + "</a>";

      let AmOrPm = new Date(streamObject.date).getHours() >= 12 ? "pm" : "am";
      let hours = new Date(streamObject.date).getHours() % 12 || 12;

      base[7] =
        hours +
        ":" +
        (new Date(streamObject.date).getMinutes() < 10 ? "0" : "") +
        new Date(streamObject.date).getMinutes() +
        AmOrPm +
        " " +
        zone;
        
      scheduleGrid.innerHTML += base.join("");
    } else {
      base[1] = weekdayNames[(weekday + i) % 7];
      base[3] = (d.getMonth() + 1).toString() + "/" + d.getDate().toString();
      base[5] = "No Stream";
      base[6] = "";
      base[7] = "";
      scheduleGrid.innerHTML += base.join("");
    }

    d = d.addDays(1);
  }
  
  // Sort streams by date for the countdown
  streams = streams.sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
  
  updateCountdownCheck();
  updateCountdownTimer = setInterval(updateCountdownCheck, 1000);
}

window.onload = function () {
  streamNowEle = document.getElementById("streamNow");
  streamCountdownEle = document.getElementById("streamCountdown");
  countdown = document.getElementById("Countdown");
  
  // Initialize streams and schedule
  initializeStreams();
};
`;
}

// Helper function to generate code for fetching from API
function generateFetchFromApiCode(apiEndpoint: string): string {
  return `
function initializeStreams() {
  // Fetch streams from API
  const rightNowMs = Date.now();
  const url = "${apiEndpoint}" + rightNowMs.toString();
  
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data && data.data) {
        // Process the streams data
        for (let z in data.data) {
          let stream = data.data[z];
          let streamDate = new Date(stream.stream_date);
          
          streams.push({
            stream: stream.stream_name,
            date: streamDate,
            duration: stream.duration || 120,
          });
        }
        
        // Display the schedule once data is loaded
        displaySchedule();
      }
    })
    .catch(error => {
      console.error("Error fetching streams:", error);
      // Show error message or fallback
      document.getElementById("gridSchedule").innerHTML += 
        "<div class='gridRow'><div class='scheduleDay'></div>" +
        "<div class='scheduleDate'></div>" +
        "<div class='scheduleStream'>Error loading schedule</div></div>";
    });
}`;
}

// Helper function to generate code for static streams
function generateStaticStreamsCode(streamsJSON: string): string {
  return `
function initializeStreams() {
  // Use embedded stream data
  const streamData = ${streamsJSON};
  
  // Process the streams data
  for (let z in streamData) {
    let stream = streamData[z];
    let streamDate = new Date(stream.stream_date);
    
    streams.push({
      stream: stream.stream_name,
      date: streamDate,
      duration: stream.duration || 120,
    });
  }
  
  // Display the schedule
  displaySchedule();
}`;
}