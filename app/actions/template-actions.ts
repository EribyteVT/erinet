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

// Validation schemas for v2.0 (optimized)
const MinimalPolygonSchema = z.object({
  id: z.string(),
  type: z.string(),
  points: z.array(
    z.object({
      x: z.number().int(), // Enforce integers
      y: z.number().int(),
    })
  ),
  offsetX: z.number().int().optional(),
  offsetY: z.number().int().optional(),
});

const ScheduleDayGroupSchema = z.object({
  dayIndex: z.number().int().min(0).max(6),
  baseX: z.number().int(),
  baseY: z.number().int(),
  polygons: z.object({
    stream_name: MinimalPolygonSchema.optional(),
    stream_time: MinimalPolygonSchema.optional(),
    game: MinimalPolygonSchema.optional(),
    duration: MinimalPolygonSchema.optional(),
    notes: MinimalPolygonSchema.optional(),
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
  singularPolygons: z.array(MinimalPolygonSchema).optional(),
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
  backgroundUrl: z.string().url().optional(),
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
function calculateDataSize(data: any): number {
  return JSON.stringify(data).length;
}

export async function saveTemplate(
  rawData: unknown
): Promise<SaveTemplateResult> {
  try {
    // Validate input data
    const validatedData = SaveTemplateSchema.parse(rawData);
    const { guildId, templateName, templateData, backgroundUrl } =
      validatedData;

    // Log data size for monitoring
    const dataSize = calculateDataSize(templateData);
    console.log(`📊 Template data size: ${dataSize} bytes`);

    // If it's a v2.0 template, log additional metrics
    if (templateData.version === "2.0") {
      const polygonCount =
        (templateData.scheduleDays?.reduce(
          (sum, day) =>
            sum +
            Object.keys(day.polygons).filter(
              (k) => day.polygons[k as keyof typeof day.polygons]
            ).length,
          0
        ) || 0) + (templateData.singularPolygons?.length || 0);

      console.log(`✨ Optimized format v2.0:`);
      console.log(`   - Total polygons: ${polygonCount}`);
      console.log(
        `   - Schedule days: ${templateData.scheduleDays?.length || 0}`
      );
      console.log(
        `   - Singular polygons: ${templateData.singularPolygons?.length || 0}`
      );
      console.log(
        `   - Custom styles: ${
          templateData.styleOverrides
            ? Object.keys(templateData.styleOverrides).length
            : 0
        }`
      );

      // Compare with estimated v1.0 size
      const estimatedV1Size = polygonCount * 250; // Rough estimate: 250 bytes per polygon in v1.0
      const savings = Math.round((1 - dataSize / estimatedV1Size) * 100);
      console.log(
        `   - Estimated savings: ${savings}% compared to v1.0 format`
      );
    }

    // Check if template already exists for this guild
    const existingTemplate = await prisma.guild_schedule_template.findUnique({
      where: { guild_id: guildId },
    });

    let result;

    if (existingTemplate) {
      // Update existing template
      result = await prisma.guild_schedule_template.update({
        where: { guild_id: guildId },
        data: {
          template_name: templateName,
          template_data: templateData,
          background_url: backgroundUrl || null,
          updated_at: new Date(),
        },
        select: {
          id: true,
          guild_id: true,
          template_name: true,
          created_at: true,
          updated_at: true,
        },
      });
    } else {
      // Create new template
      result = await prisma.guild_schedule_template.create({
        data: {
          guild_id: guildId,
          template_name: templateName,
          template_data: templateData,
          background_url: backgroundUrl || null,
        },
        select: {
          id: true,
          guild_id: true,
          template_name: true,
          created_at: true,
          updated_at: true,
        },
      });
    }

    // Revalidate any pages that might display template info
    revalidatePath(`/schedule/${guildId}`);

    return {
      success: true,
      template: result,
      message: existingTemplate
        ? "Template updated successfully"
        : "Template created successfully",
    };
  } catch (error) {
    console.error("Error saving template:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Invalid data: ${error.errors.map((e) => e.message).join(", ")}`,
      };
    }

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to save template",
    };
  }
}

export async function loadTemplate(
  rawData: unknown
): Promise<LoadTemplateResult> {
  try {
    // Validate input data
    const { guildId } = LoadTemplateSchema.parse(rawData);

    const template = await prisma.guild_schedule_template.findUnique({
      where: { guild_id: guildId },
    });

    if (!template) {
      return {
        success: false,
        error: "No saved template found for this server",
      };
    }

    // Log template format and size
    const templateData = template.template_data as any;
    const version = templateData.version || "1.0";
    const dataSize = calculateDataSize(templateData);

    console.log(`📦 Loading template:`);
    console.log(`   - Guild: ${guildId}`);
    console.log(`   - Version: ${version}`);
    console.log(`   - Size: ${dataSize} bytes`);

    return {
      success: true,
      template,
    };
  } catch (error) {
    console.error("Error loading template:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Invalid guild ID: ${error.errors
          .map((e) => e.message)
          .join(", ")}`,
      };
    }

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "Failed to load template",
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

export async function getTemplateInfo(rawData: unknown): Promise<{
  success: boolean;
  exists: boolean;
  templateName?: string;
  lastUpdated?: Date;
  error?: string;
}> {
  try {
    const { guildId } = LoadTemplateSchema.parse(rawData);

    const template = await prisma.guild_schedule_template.findUnique({
      where: { guild_id: guildId },
      select: {
        template_name: true,
        updated_at: true,
        template_data: true,
      },
    });

    if (!template) {
      return {
        success: true,
        exists: false,
      };
    }

    // Get template version for info
    const templateData = template.template_data as any;
    const version = templateData.version || "1.0";
    console.log(`ℹ️ Template info for guild ${guildId}: v${version}`);

    return {
      success: true,
      exists: true,
      templateName: template.template_name || undefined,
      lastUpdated: template.updated_at,
    };
  } catch (error) {
    console.error("Error getting template info:", error);

    return {
      success: false,
      exists: false,
      error: "Failed to check template status",
    };
  }
}
