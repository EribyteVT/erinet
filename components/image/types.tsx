export interface TypedPoint {
  x: number;
  y: number;
  type: string;
  id?: string;
}

export const POINT_TYPES = [
  "stream name",
  "stream date",
  "art",
  "artist name",
  "week start",
  "week end",
] as const;

export const TYPE_COLORS = {
  "stream name": "#ff0000",
  "stream date": "#00ff00",
  art: "#0000ff",
  "artist name": "#ff00ff",
  "week start": "#ffff00",
  "week end": "#00ffff",
};

export const FILL_COLORS = {
  "stream name": "#ff000055",
  "stream date": "#00ff0055",
  art: "#0000ff55",
  "artist name": "#ff00ff55",
  "week start": "#ffff0055",
  "week end": "#00ffff55",
};
