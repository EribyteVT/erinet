// components/Streams/WebsiteGenerator/templates/jsTemplate.ts

export function jsTemplate(
  initialStreams: Array<{ name: string; date: string; duration: number }>,
  useCustomStreamFetch: boolean = false,
  streamer_url: string,
  apiEndpoint?: string
): string {
  // Convert initial streams to a JSON string for embedding
  const streamsJSON = JSON.stringify(initialStreams);

  return `Date.prototype.addDays = function (days) {
  let date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

let countdown;
let streams = ${streamsJSON};
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
    // Add this for debugging to show the Stream Countdown banner.
    // delta = 0;
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

window.onload = function () {
  streamNowEle = document.getElementById("streamNow");
  streamCountdownEle = document.getElementById("streamCountdown");
  countdown = document.getElementById("Countdown");
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

  //we subtract this from right now to get a number, that way if it's 2:01PM and the stream happens at 2:00pm, it still shows up
  //current value: 5 hours
  let gracePeriod = 18000000;
  
  ${useCustomStreamFetch ? generateFetchCode(apiEndpoint) : ""}

  // Sort streams by date
  streams = streams.sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  //get time zone
  let zone = new Date()
    .toLocaleTimeString("en-us", { timeZoneName: "short" })
    .split(" ")[2];
  //loop through the days, starting with today

  for (let i = 0; i < 7; i++) {
    // console.log(dateWeekdayNames[(weekday + i) % 7])
    //o(n^2), does js have a filter method?
    let streamObject = null;
    for (let z in streams) {
      //if there is a stream today
      if (
        new Date(streams[z].date).getDate() == d.getDate() &&
        new Date(streams[z].date).getMonth() == d.getMonth()
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
      base[5] = <a href=${streamer_url} >streamObject.name;</a>

      let streamDateObj = new Date(streamObject.date);
      let AmOrPm = streamDateObj.getHours() >= 12 ? "pm" : "am";
      let hours = streamDateObj.getHours() % 12 || 12;

      base[7] =
        hours +
        ":" +
        (streamDateObj.getMinutes() < 10 ? "0" : "") +
        streamDateObj.getMinutes() +
        AmOrPm +
        " " +
        zone;

      // console.log(base)
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
  
  updateCountdownCheck();
  updateCountdownTimer = setInterval(updateCountdownCheck, 1000);
};
${
  useCustomStreamFetch
    ? `
// Fetch streams from API
async function fetchStreams(apiUrl) {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    
    // Extract streams from response
    if (data && data.data) {
      return data.data.map(stream => ({
        name: stream.stream_name,
        date: stream.stream_date,
        duration: stream.duration || 120
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching streams:', error);
    return [];
  }
}`
    : ""
}`;
}

function generateFetchCode(apiEndpoint?: string): string {
  if (!apiEndpoint) return "";

  return `
  // Fetch streams from API with current timestamp
  (async function() {
    try {
      const rightNowMs = Date.now();
      const apiUrl = \`${apiEndpoint}\${rightNowMs - gracePeriod}\`;
      
      const fetchedStreams = await fetchStreams(apiUrl);
      if (fetchedStreams && fetchedStreams.length > 0) {
        // Add fetched streams to existing ones
        streams = [...streams, ...fetchedStreams];
      }
    } catch (error) {
      console.error("Error fetching streams:", error);
    }
  })();`;
}
