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

// Create a type from the array
type PolygonType = (typeof POLYGON_TYPES)[number];

export const POLYGON_TYPES = [
  "stream name",
  "stream date",
  "art",
  "artist name",
  "week start",
  "week end",
] as const;

export const FILL_COLORS: Record<PolygonType, string> = {
  "stream name": "#ff000055",
  "stream date": "#00ff0055",
  art: "#0000ff55",
  "artist name": "#ff00ff55",
  "week start": "#ffff0055",
  "week end": "#00ffff55",
};

// Type the colors object properly
export const TYPE_COLORS: Record<PolygonType, string> = {
  "stream name": "#ff0000",
  "stream date": "#00ff00",
  art: "#0000ff",
  "artist name": "#ff00ff",
  "week start": "#ffff00",
  "week end": "#00ffff",
};

// Then use it with a fallback
export const getTypeColor = (type: string): string => {
  return TYPE_COLORS[type as PolygonType] || "#ff0000"; // fallback to red
};
