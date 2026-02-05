"use server";

import { auth } from "@/auth";
import { getDiscordToken } from "@/app/lib/discordTokenService";
import { isAllowedGuild } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { createRateLimitedStructuredAction } from "../lib/actionRegistry";
import {
  errorResponse,
  NormalizedResponse,
  successResponse,
} from "../lib/api-utils";
import { TemplateData } from "@/components/Schedule-Image/types";

// ─── Save template layout ───────────────────────────────────────────────────

async function saveScheduleTemplateImpl(
  guildId: string,
  templateData: TemplateData,
  templateName?: string
): Promise<NormalizedResponse<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("UNAUTHORIZED");
    }

    const token = await getDiscordToken(session.user.id);
    if (!token) {
      return errorResponse("UNAUTHORIZED");
    }

    const hasPermission = await isAllowedGuild(token, guildId);
    // if (!hasPermission) {
    //   return errorResponse("FORBIDDEN");
    // }

    if (!templateData || !Array.isArray(templateData.zones)) {
      return errorResponse("Invalid template data");
    }

    const template = await prisma.guild_schedule_template.upsert({
      where: { guild_id: guildId },
      update: {
        template_name: templateName ?? null,
        template_data: templateData as any,
        updated_at: new Date(),
      },
      create: {
        guild_id: guildId,
        template_name: templateName ?? null,
        template_data: templateData as any,
      },
    });

    return successResponse(
      {
        id: template.id,
        guildId: template.guild_id,
        templateName: template.template_name,
      },
      "OKAY"
    );
  } catch (error) {
    console.error("Error saving schedule template:", error);
    return errorResponse("ERROR");
  }
}

export const saveScheduleTemplateAction = createRateLimitedStructuredAction(
  "saveScheduleTemplate",
  saveScheduleTemplateImpl,
  "stream"
);

// ─── Load template layout ───────────────────────────────────────────────────

async function loadScheduleTemplateImpl(
  guildId: string
): Promise<NormalizedResponse<any>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse("UNAUTHORIZED");
    }

    const token = await getDiscordToken(session.user.id);
    if (!token) {
      return errorResponse("UNAUTHORIZED");
    }

    // const hasPermission = await isAllowedGuild(token, guildId);
    // if (!hasPermission) {
    //   return errorResponse("FORBIDDEN");
    // }

    const template = await prisma.guild_schedule_template.findUnique({
      where: { guild_id: guildId },
    });

    if (!template) {
      return successResponse(null, "NO_TEMPLATE");
    }

    return successResponse(
      {
        id: template.id,
        guildId: template.guild_id,
        templateName: template.template_name,
        templateData: template.template_data,
        backgroundFilePath: template.background_file_path,
      },
      "OKAY"
    );
  } catch (error) {
    console.error("Error loading schedule template:", error);
    return errorResponse("ERROR");
  }
}

export const loadScheduleTemplateAction = createRateLimitedStructuredAction(
  "loadScheduleTemplate",
  loadScheduleTemplateImpl,
  "stream"
);