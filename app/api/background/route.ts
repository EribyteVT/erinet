import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { uploadToS3, deleteFromS3 } from "@/app/lib/s3";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  console.log("SAVING ANOTHA BUCKY")
  try {
    const formData = await request.formData();
    const file = formData.get("background") as File;
    const guildId = formData.get("guildId") as string;

    console.log("SAVING BUCKY")

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!guildId) {
      return NextResponse.json(
        { error: "Guild ID is required" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Get existing template to delete old image if exists
    const existingTemplate = await prisma.guild_schedule_template.findUnique({
      where: { guild_id: guildId },
    });

    // Delete old S3 file if it exists
    if (existingTemplate?.background_url) {
      try {
        await deleteFromS3(existingTemplate.background_url);
      } catch (error) {
        console.warn("Could not delete old S3 file:", error);
      }
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const uniqueFilename = `${guildId}_${Date.now()}.${fileExtension}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to S3
    const s3Url = await uploadToS3(buffer, uniqueFilename, file.type);

    // Update database
    const template = await prisma.guild_schedule_template.upsert({
      where: { guild_id: guildId },
      update: {
        background_file_name: file.name,
        background_url: s3Url,
        background_file_size: file.size,
        background_file_type: file.type,
        background_file_path: null, // Clear old local path
        updated_at: new Date(),
      },
      create: {
        guild_id: guildId,
        background_file_name: file.name,
        background_url: s3Url,
        background_file_size: file.size,
        background_file_type: file.type,
        template_data: {},
      },
    });

    return NextResponse.json({
      success: true,
      message: "Background image uploaded successfully",
      file: {
        name: file.name,
        url: s3Url,
        size: file.size,
        type: file.type,
      },
    });
  } catch (error) {
    console.error("Error uploading background image:", error);
    return NextResponse.json(
      { error: "Failed to upload background image" },
      { status: 500 }
    );
  }
}

// Delete uploaded background
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const guildId = searchParams.get("guildId");

    if (!guildId) {
      return NextResponse.json(
        { error: "Guild ID is required" },
        { status: 400 }
      );
    }

    // Get current template
    const template = await prisma.guild_schedule_template.findUnique({
      where: { guild_id: guildId },
    });

    if (!template || !template.background_url) {
      return NextResponse.json(
        { error: "No background image found" },
        { status: 404 }
      );
    }

    // Delete from S3
    try {
      await deleteFromS3(template.background_url);
    } catch (error) {
      console.warn("Could not delete S3 file:", error);
    }

    // Update database
    await prisma.guild_schedule_template.update({
      where: { guild_id: guildId },
      data: {
        background_file_name: null,
        background_url: null,
        background_file_size: null,
        background_file_type: null,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Background image deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting background image:", error);
    return NextResponse.json(
      { error: "Failed to delete background image" },
      { status: 500 }
    );
  }
}