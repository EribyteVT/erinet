import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { prisma } from "@/app/lib/db";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const UPLOAD_DIR = "public/uploads/backgrounds";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("background") as File;
    const guildId = formData.get("guildId") as string;

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

    // Create upload directory if it doesn't exist
    const uploadPath = path.join(process.cwd(), UPLOAD_DIR);
    if (!existsSync(uploadPath)) {
      await mkdir(uploadPath, { recursive: true });
    }

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const uniqueFilename = `${guildId}_${Date.now()}${fileExtension}`;
    const filePath = path.join(uploadPath, uniqueFilename);
    const publicPath = `/uploads/backgrounds/${uniqueFilename}`;

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Update database with file information
    const template = await prisma.guild_schedule_template.upsert({
      where: { guild_id: guildId },
      update: {
        background_file_name: file.name,
        background_file_path: publicPath,
        background_file_size: file.size,
        background_file_type: file.type,
        background_url: null, // Clear old URL when file is uploaded
        updated_at: new Date(),
      },
      create: {
        guild_id: guildId,
        background_file_name: file.name,
        background_file_path: publicPath,
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
        path: publicPath,
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

    if (!template || !template.background_file_path) {
      return NextResponse.json(
        { error: "No background image found" },
        { status: 404 }
      );
    }

    // Remove file from filesystem
    const fs = require("fs").promises;
    const fullPath = path.join(
      process.cwd(),
      "public",
      template.background_file_path
    );

    try {
      await fs.unlink(fullPath);
    } catch (fileError) {
      console.warn("Could not delete file:", fileError);
      // Continue anyway - file might already be deleted
    }

    // Update database
    await prisma.guild_schedule_template.update({
      where: { guild_id: guildId },
      data: {
        background_file_name: null,
        background_file_path: null,
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
