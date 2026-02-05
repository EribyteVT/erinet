import { Field, Zone, ScheduleRow, TemplateZone, TemplateData } from "./types";
import { mockSchedule } from "../websiteGenerator/constants";

// Build field list from schedule data
export const buildFieldList = (
  schedule: ScheduleRow[] = mockSchedule,
): Field[] => {
  const fields: Field[] = [];
  schedule.forEach((row, i) => {
    fields.push({
      id: `${i}_day`,
      dayIndex: i,
      type: "day",
      label: row.day,
      value: row.day,
    });
    fields.push({
      id: `${i}_time`,
      dayIndex: i,
      type: "time",
      label: row.time || "OFF",
      value: row.time,
    });
    fields.push({
      id: `${i}_game`,
      dayIndex: i,
      type: "game",
      label: row.game || "—",
      value: row.game,
    });
  });
  return fields;
};

// Get display value based on field type and options
// For text zones, pass the zone's customText via the zone parameter
export const getDisplayValue = (
  field: Field,
  opts: Record<string, string> = {},
  zone?: Zone,
): string => {
  if (field.type === "text") {
    return zone?.customText || "Text";
  }

  if (field.type === "day") {
    const len = opts.length || "Full";
    if (len === "Short") return field.value?.slice(0, 3) || "";
    if (len === "Letter") return field.value?.[0] || "";
    return field.value || "";
  }

  if (field.type === "time") {
    if (!field.value) return opts.offText || "OFF";
    const [h, m] = field.value.split(":").map(Number);
    const format = opts.format || "12-hour";
    let timeStr: string;
    if (format === "12-hour") {
      const period = h >= 12 ? "PM" : "AM";
      const hour12 = h % 12 || 12;
      timeStr = `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
    } else {
      timeStr = field.value;
    }
    const tz = opts.showTz || "Hide";
    return tz !== "Hide" ? `${timeStr} ${tz}` : timeStr;
  }

  if (field.type === "game") {
    if (!field.value) return opts.offText || "—";
    const maxLen = opts.maxLen || "None";
    if (maxLen !== "None") {
      const len = parseInt(maxLen);
      return field.value.length > len
        ? field.value.slice(0, len - 1) + "…"
        : field.value;
    }
    return field.value;
  }

  return field.value || "";
};

// Get coordinates relative to canvas
export const getCoords = (
  e: React.MouseEvent | React.DragEvent,
  canvasRef: React.RefObject<HTMLDivElement | null>,
): { x: number; y: number } => {
  if (!canvasRef.current) return { x: 0, y: 0 };
  const rect = canvasRef.current.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) / rect.width) * 100,
    y: ((e.clientY - rect.top) / rect.height) * 100,
  };
};

// Clamp position to keep zone within canvas bounds
export const clampPosition = (
  x: number,
  y: number,
  width: number,
  height: number,
): { x: number; y: number } => {
  return {
    x: Math.max(0, Math.min(x, 100 - width)),
    y: Math.max(0, Math.min(y, 100 - height)),
  };
};

// ─── Template conversion utilities ──────────────────────────────────────────

/**
 * Convert live zones → saveable template.
 * Strips the resolved `field` object and runtime `id`, keeping only the
 * fieldId reference (e.g. "0_day", "2_game", "text_1234") plus all
 * layout and styling properties.
 */
export const zonesToTemplate = (
  zones: Zone[],
  globalFontSize: number,
): TemplateData => {
  const templateZones: TemplateZone[] = zones.map((zone) => ({
    fieldId: zone.fieldId,
    x: zone.x,
    y: zone.y,
    width: zone.width,
    height: zone.height,
    options: zone.options,
    fontSize: zone.fontSize,
    fontSizeOverride: zone.fontSizeOverride,
    color: zone.color,
    bold: zone.bold,
    align: zone.align,
    // Only persist customText for text zones
    ...(zone.customText !== undefined ? { customText: zone.customText } : {}),
  }));

  return { zones: templateZones, globalFontSize };
};

/**
 * Rebuild live zones from a saved template using the current schedule data.
 *
 * For each TemplateZone:
 * - Data fields ("0_day", "3_time", etc.) are matched to the current
 *   fieldList built from the supplied schedule. If the schedule has
 *   fewer rows than the template references, those zones are skipped
 *   (graceful degradation).
 * - Text zones ("text_*") get a fresh synthetic Field.
 */
export const templateToZones = (
  template: TemplateData,
  schedule: ScheduleRow[],
): { zones: Zone[]; globalFontSize: number } => {
  const fieldList = buildFieldList(schedule);
  const fieldMap = new Map(fieldList.map((f) => [f.id, f]));

  const zones: Zone[] = [];

  template.zones.forEach((tz, index) => {
    const isText = tz.fieldId.startsWith("text_");

    let field: Field;

    if (isText) {
      // Rebuild a synthetic text field
      field = {
        id: tz.fieldId,
        dayIndex: -1,
        type: "text",
        label: "Text",
        value: null,
      };
    } else {
      // Look up the field in current schedule data
      const found = fieldMap.get(tz.fieldId);
      if (!found) {
        // Schedule doesn't have this index any more — skip gracefully
        return;
      }
      field = found;
    }

    zones.push({
      id: Date.now() + index, // unique runtime id
      fieldId: tz.fieldId,
      field,
      x: tz.x,
      y: tz.y,
      width: tz.width,
      height: tz.height,
      options: tz.options,
      fontSize: tz.fontSize,
      fontSizeOverride: tz.fontSizeOverride,
      color: tz.color,
      bold: tz.bold,
      align: tz.align,
      ...(tz.customText !== undefined ? { customText: tz.customText } : {}),
    });
  });

  return { zones, globalFontSize: template.globalFontSize };
};
