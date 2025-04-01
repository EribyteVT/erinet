import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { isAllowedGuild } from "@/app/lib/auth";

export async function GET(request: Request) {
  try {
    // Get URL to parse query parameters
    const url = new URL(request.url);

    // Extract query parameters
    const streamerId = url.searchParams.get("streamerId");
    const dateStart = url.searchParams.get("dateStart");
    const dateEnd = url.searchParams.get("dateEnd");

    // Validate required parameters
    if (!streamerId || !dateStart) {
      return NextResponse.json(
        {
          response: "ERROR",
          message: "Missing required parameters",
        },
        { status: 400 }
      );
    }

    // Parse timestamps
    const startTimestamp = parseInt(dateStart);

    // Create start date
    const date1 = new Date(startTimestamp);

    // Handle the case where dateEnd is provided vs. calculating a week
    let date2;
    if (dateEnd) {
      // If dateEnd is provided, use it directly
      date2 = new Date(parseInt(dateEnd));
    } else {
      // If not, default to one week from dateStart
      const oneWeek = 604800000; // One week in milliseconds
      date2 = new Date(startTimestamp + oneWeek);
    }

    // Query streams within the date range for the specific streamer
    const streams = await prisma.stream_table_tied.findMany({
      where: {
        streamer_id: streamerId,
        stream_date: {
          gte: date1,
          lt: date2,
        },
      },
    });

    return NextResponse.json({
      response: "OK",
      data: streams,
    });
  } catch (error) {
    console.error("Error fetching streams:", error);
    return NextResponse.json({ response: "ERROR" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if the guild is allowed
    const isAllowed = await isAllowedGuild(body.authToken, body.guildId);

    if (!isAllowed) {
      return NextResponse.json({ response: "FORBIDDEN" }, { status: 403 });
    }

    // Create a new stream entry
    const newStream = await prisma.stream_table_tied.create({
      data: {
        streamer_id: body.streamerId.toString(),
        stream_name: body.streamName,
        stream_date: new Date(parseInt(body.timestamp) * 1000),
        duration: parseInt(body.duration),
      },
    });

    return NextResponse.json(
      { response: "OKAY", data: newStream },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding stream:", error);

    return NextResponse.json({ response: "ERROR" }, { status: 500 });
  }
}
