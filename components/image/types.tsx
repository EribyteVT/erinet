// components/image/types.tsx
export interface Point {
  x: number;
  y: number;
}

export interface TypedPolygon {
  id: string;
  points: Point[];
  type: string;
  // Store fabric.js properties for reconstruction
  left: number;
  top: number;
}

// Offset-based polygon types for weekly schedules
export const OFFSET_STREAM_TYPES = [
  "day0_stream_name", "day0_stream_time", "day0_game", "day0_duration", "day0_notes",
  "day1_stream_name", "day1_stream_time", "day1_game", "day1_duration", "day1_notes",
  "day2_stream_name", "day2_stream_time", "day2_game", "day2_duration", "day2_notes",
  "day3_stream_name", "day3_stream_time", "day3_game", "day3_duration", "day3_notes",
  "day4_stream_name", "day4_stream_time", "day4_game", "day4_duration", "day4_notes",
  "day5_stream_name", "day5_stream_time", "day5_game", "day5_duration", "day5_notes",
  "day6_stream_name", "day6_stream_time", "day6_game", "day6_duration", "day6_notes",
] as const;

// Legacy types for compatibility
export const SINGULAR_POLYGON_TYPES = [
  "art", "logo", "artist name",
  "week start", "week end",
] as const;

// Combined types
export const POLYGON_TYPES = [...OFFSET_STREAM_TYPES, ...SINGULAR_POLYGON_TYPES] as const;

type PolygonType = (typeof POLYGON_TYPES)[number];

// Color mapping for offset-based types
export const OFFSET_TYPE_COLORS: Record<string, string> = {
  // Day 0 colors (red family)
  "day0_stream_name": "#ff0000",
  "day0_stream_time": "#ff3333", 
  "day0_game": "#ff6666",
  "day0_duration": "#ff9999",
  "day0_notes": "#ffcccc",
  
  // Day 1 colors (orange family)
  "day1_stream_name": "#ff8800",
  "day1_stream_time": "#ff9933",
  "day1_game": "#ffaa66",
  "day1_duration": "#ffbb99",
  "day1_notes": "#ffddcc",
  
  // Day 2 colors (yellow family)
  "day2_stream_name": "#ffff00",
  "day2_stream_time": "#ffff33",
  "day2_game": "#ffff66",
  "day2_duration": "#ffff99",
  "day2_notes": "#ffffcc",
  
  // Day 3 colors (green family)
  "day3_stream_name": "#00ff00",
  "day3_stream_time": "#33ff33",
  "day3_game": "#66ff66",
  "day3_duration": "#99ff99",
  "day3_notes": "#ccffcc",
  
  // Day 4 colors (blue family)
  "day4_stream_name": "#0000ff",
  "day4_stream_time": "#3333ff",
  "day4_game": "#6666ff",
  "day4_duration": "#9999ff",
  "day4_notes": "#ccccff",
  
  // Day 5 colors (purple family)
  "day5_stream_name": "#8800ff",
  "day5_stream_time": "#9933ff",
  "day5_game": "#aa66ff",
  "day5_duration": "#bb99ff",
  "day5_notes": "#ddccff",
  
  // Day 6 colors (pink family)
  "day6_stream_name": "#ff00ff",
  "day6_stream_time": "#ff33ff",
  "day6_game": "#ff66ff",
  "day6_duration": "#ff99ff",
  "day6_notes": "#ffccff",
};

// Legacy colors for backward compatibility
export const LEGACY_TYPE_COLORS: Record<string, string> = {
  "streamTitle": "#ff0000",
  "streamDate": "#00ff00",
  "duration": "#0000ff",
  "art": "#ff00ff",
  "logo": "#ffff00",
  "weekday": "#00ffff",
  "artist name": "#ff8800",
  "week start": "#8800ff",
  "week end": "#88ff00",
};

// Combined color mapping
export const TYPE_COLORS = { ...OFFSET_TYPE_COLORS, ...LEGACY_TYPE_COLORS };

// Fill colors with transparency
export const FILL_COLORS: Record<string, string> = {};
Object.keys(TYPE_COLORS).forEach(key => {
  FILL_COLORS[key] = TYPE_COLORS[key] + "55"; // Add 55 for transparency
});

// Helper functions for offset-based types
export const getOffsetFromType = (type: string): number | null => {
  const match = type.match(/day(\d+)_/);
  return match ? parseInt(match[1]) : null;
};

export const getFieldFromType = (type: string): string | null => {
  const match = type.match(/day\d+_(.+)/);
  return match ? match[1] : null;
};

export const getDateFromOffset = (weekStartDate: Date, offset: number): Date => {
  const date = new Date(weekStartDate);
  date.setDate(date.getDate() + offset);
  return date;
};

export const getDayName = (offset: number, weekStartDate: Date): string => {
  const date = getDateFromOffset(weekStartDate, offset);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
};

export const getTypeColor = (type: string, guildId = "default"): string => {
  // Check predefined types first
  if (TYPE_COLORS[type]) {
    return TYPE_COLORS[type];
  }

  if (OFFSET_TYPE_COLORS[type]) {
    return OFFSET_TYPE_COLORS[type];
  }

  // Check custom types from localStorage
  const savedCustomTypes = localStorage.getItem(`custom-types-${guildId}`);
  if (savedCustomTypes) {
    const customTypes = JSON.parse(savedCustomTypes);
    const customType = customTypes.find((ct: any) => ct.name === type);
    if (customType?.color) {
      return customType.color;
    }
  }

  // Generate color if none found
  let hash = 0;
  for (let i = 0; i < type.length; i++) {
    hash = type.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

// Helper to generate offset-based template types
export const generateOffsetTemplate = (
  numDays: number = 7, 
  fieldsPerDay: string[] = ['stream_name', 'stream_time', 'game', 'duration', 'notes']
): string[] => {
  const polygonTypes: string[] = [];
  
  for (let i = 0; i < numDays; i++) {
    fieldsPerDay.forEach(field => {
      polygonTypes.push(`day${i}_${field}`);
    });
  }
  
  return polygonTypes;
};