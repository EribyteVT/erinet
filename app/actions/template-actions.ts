"use server";

import { prisma } from "@/app/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// Validation schemas for v1.0 (legacy)
const LegacyPolygonSchema = z.object({
  id: z.string(),
  points: z.array(
    z.object({
      x: z.number(),
      y: z.number(),
    })
  ),
  type: z.string(),
  left: z.number(),
  top: z.number(),
  fill: z.string().optional(),
  stroke: z.string().optional(),
  strokeWidth: z.number().optional(),
  scaleX: z.number().optional(),
  scaleY: z.number().optional(),
  angle: z.number().optional(),
  opacity: z.number().optional(),
});

// FIXED: Enhanced polygon schema that includes position and styling data
const EnhancedPolygonSchema = z.object({
  id: z.string(),
  type: z.string(),
  points: z.array(
    z.object({
      x: z.number().int(), // Enforce integers
      y: z.number().int(),
    })
  ),
  // Position data (required for proper placement)
  left: z.number(),
  top: z.number(),
  // Styling data (optional, with defaults)
  fill: z.string().optional(),
  stroke: z.string().optional(),
  strokeWidth: z.number().optional(),
  scaleX: z.number().optional(),
  scaleY: z.number().optional(),
  angle: z.number().optional(),
  opacity: z.number().optional(),
  // Legacy offset support for backward compatibility
  offsetX: z.number().int().optional(),
  offsetY: z.number().int().optional(),
});

const ScheduleDayGroupSchema = z.object({
  dayIndex: z.number().int().min(0).max(6),
  baseX: z.number().int(),
  baseY: z.number().int(),
  polygons: z.object({
    stream_name: EnhancedPolygonSchema.optional(),
    stream_time: EnhancedPolygonSchema.optional(),
    game: EnhancedPolygonSchema.optional(),
    duration: EnhancedPolygonSchema.optional(),
    notes: EnhancedPolygonSchema.optional(),
  }),
});

const StyleOverridesSchema = z.record(
  z.string(),
  z.object({
    fill: z.string().optional(),
    stroke: z.string().optional(),
    strokeWidth: z.number().optional(),
    scaleX: z.number().optional(),
    scaleY: z.number().optional(),
    angle: z.number().optional(),
    opacity: z.number().optional(),
  })
);

// Template data schemas
const LegacyTemplateDataSchema = z.object({
  polygons: z.array(LegacyPolygonSchema),
  canvasWidth: z.number(),
  canvasHeight: z.number(),
  backgroundImage: z.string().optional(),
  version: z.literal("1.0").optional(),
  createdAt: z.string().optional(),
});

const OptimizedTemplateDataSchema = z.object({
  version: z.literal("2.0"),
  canvas: z.object({
    width: z.number().int(),
    height: z.number().int(),
  }),
  backgroundUrl: z.string().url().optional(),
  scheduleDays: z.array(ScheduleDayGroupSchema).optional(),
  singularPolygons: z.array(EnhancedPolygonSchema).optional(), // FIXED: Use enhanced schema
  styleOverrides: StyleOverridesSchema.optional(),
});

// Union type for both template formats
const TemplateDataSchema = z.union([
  LegacyTemplateDataSchema,
  OptimizedTemplateDataSchema,
]);

const SaveTemplateSchema = z.object({
  guildId: z.string().min(1),
  templateName: z.string().min(1).max(100),
  templateData: TemplateDataSchema,
});

const LoadTemplateSchema = z.object({
  guildId: z.string().min(1),
});

// Return types
export type SaveTemplateResult =
  | {
      success: true;
      template: {
        id: string;
        guild_id: string;
        template_name: string | null;
        backgroundImage: any;
        background_file_path: any;
        background_file_name: any;
        created_at: Date;
        updated_at: Date;
      };
      message: string;
    }
  | {
      success: false;
      error: string;
    };

export type LoadTemplateResult =
  | {
      success: true;
      template: {
        id: string;
        guild_id: string;
        template_name: string | null;
        template_data: any;
        background_url: string | null;
        created_at: Date;
        updated_at: Date;
      };
    }
  | {
      success: false;
      error: string;
    };

// Helper function to calculate data size reduction
function calculateOptimizationStats(
  originalData: any,
  optimizedData: any
): string {
  const originalSize = JSON.stringify(originalData).length;
  const optimizedSize = JSON.stringify(optimizedData).length;
  const reduction = ((originalSize - optimizedSize) / originalSize) * 100;
  return `Reduced data size by ${reduction.toFixed(
    1
  )}% (${originalSize} → ${optimizedSize} bytes)`;
}

export async function saveTemplateAction(
  data: z.infer<typeof SaveTemplateSchema>
): Promise<SaveTemplateResult> {
  try {
    const validatedData = SaveTemplateSchema.parse(data);
    const { guildId, templateName, templateData } = validatedData;

    console.log("💾 Saving template data:", {
      guildId,
      templateName,
      singularPolygonsCount:
        templateData.version === "2.0"
          ? templateData.singularPolygons?.length || 0
          : 0,
      templateData: templateData,
    });

    // Check if template already exists
    const existingTemplate = await prisma.guild_schedule_template.findUnique({
      where: { guild_id: guildId },
    });

    let savedTemplate;

    if (existingTemplate) {
      // Update existing template
      savedTemplate = await prisma.guild_schedule_template.update({
        where: { guild_id: guildId },
        data: {
          template_name: templateName,
          template_data: templateData,
          updated_at: new Date(),
        },
      });
    } else {
      // Create new template
      savedTemplate = await prisma.guild_schedule_template.create({
        data: {
          guild_id: guildId,
          template_name: templateName,
          template_data: templateData,
        },
      });
    }

    console.log("✅ Template saved successfully:", {
      id: savedTemplate.id,
      dataSize: JSON.stringify(templateData).length,
    });

    // Revalidate any pages that might display template info
    revalidatePath(`/schedule/${guildId}`);

    return {
      success: true,
      template: {
        ...savedTemplate,
        backgroundImage: savedTemplate.background_file_path,
      },
      message: existingTemplate
        ? "Template updated successfully!"
        : "Template saved successfully!",
    };
  } catch (error) {
    console.error("Error saving template:", error);

    if (error instanceof z.ZodError) {
      console.error("Validation errors:", error.errors);
      return {
        success: false,
        error: `Validation error: ${error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ")}`,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function loadTemplateAction(
  data: z.infer<typeof LoadTemplateSchema>
): Promise<LoadTemplateResult> {
  try {
    const validatedData = LoadTemplateSchema.parse(data);
    const { guildId } = validatedData;

    const template = await prisma.guild_schedule_template.findUnique({
      where: { guild_id: guildId },
      select: {
        id: true,
        guild_id: true,
        template_name: true,
        template_data: true,
        background_url: true, // Keep for backward compatibility
        background_file_path: true,
        background_file_name: true,
        background_file_size: true,
        background_file_type: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!template) {
      return {
        success: false,
        error: "Template not found for this guild",
      };
    }

    return {
      success: true,
      template: {
        ...template,
        backgroundImage:
          template.background_file_path || template.background_url || undefined,
      },
    };
  } catch (error) {
    console.error("Error loading template:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function deleteTemplate(
  rawData: unknown
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const { guildId } = LoadTemplateSchema.parse(rawData);

    const deletedTemplate = await prisma.guild_schedule_template.delete({
      where: { guild_id: guildId },
    });

    if (!deletedTemplate) {
      return {
        success: false,
        error: "Template not found",
      };
    }

    // Revalidate any pages that might display template info
    revalidatePath(`/schedule/${guildId}`);

    return {
      success: true,
      message: "Template deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting template:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Invalid guild ID: ${error.errors
          .map((e) => e.message)
          .join(", ")}`,
      };
    }

    // Handle case where template doesn't exist
    if (
      error instanceof Error &&
      error.message.includes("Record to delete does not exist")
    ) {
      return {
        success: false,
        error: "No template found to delete",
      };
    }

    return {
      success: false,
      error: "Failed to delete template",
    };
  }
}

export async function getTemplateInfoAction(
  data: z.infer<typeof LoadTemplateSchema>
): Promise<{
  success: boolean;
  exists: boolean;
  templateName?: string;
  lastUpdated?: Date;
  backgroundFile?: {
    name: string;
    path: string;
    size: number;
    type: string;
  };
  error?: string;
}> {
  try {
    const validatedData = LoadTemplateSchema.parse(data);
    const { guildId } = validatedData;

    const template = await prisma.guild_schedule_template.findUnique({
      where: { guild_id: guildId },
      select: {
        template_name: true,
        updated_at: true,
        background_file_name: true,
        background_file_path: true,
        background_file_size: true,
        background_file_type: true,
      },
    });

    if (!template) {
      return {
        success: true,
        exists: false,
      };
    }

    const result: any = {
      success: true,
      exists: true,
      templateName: template.template_name || undefined,
      lastUpdated: template.updated_at,
    };

    // Include background file info if available
    if (template.background_file_path && template.background_file_name) {
      result.backgroundFile = {
        name: template.background_file_name,
        path: template.background_file_path,
        size: template.background_file_size || 0,
        type: template.background_file_type || "unknown",
      };
    }

    return result;
  } catch (error) {
    console.error("Error getting template info:", error);
    return {
      success: false,
      exists: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function getBackgroundImageAction(guildId: string) {
  try {
    const template = await prisma.guild_schedule_template.findUnique({
      where: { guild_id: guildId },
      select: {
        background_file_name: true,
        background_file_path: true,
        background_file_size: true,
        background_file_type: true,
        background_url: true, // Keep for backward compatibility
      },
    });

    if (!template) {
      return { success: false, error: "Template not found" };
    }

    return {
      success: true,
      backgroundImage: {
        filePath: template.background_file_path,
        fileName: template.background_file_name,
        fileSize: template.background_file_size,
        fileType: template.background_file_type,
        url: template.background_url, // Fallback for existing URLs
      },
    };
  } catch (error) {
    console.error("Error getting background image:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
