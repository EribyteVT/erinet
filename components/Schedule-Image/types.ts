export interface ScheduleRow {
  day: string
  time: string | null
  game: string | null
}

export interface Field {
  id: string
  dayIndex: number
  type: 'day' | 'time' | 'game' | 'text'
  label: string
  value: string | null
}

export interface Zone {
  id: number
  fieldId: string
  field: Field
  x: number
  y: number
  width: number
  height: number
  options: Record<string, string>
  fontSize: number
  fontSizeOverride: boolean
  color: string
  bold: boolean
  align: 'left' | 'center' | 'right'
  customText?: string
}

export interface FieldOption {
  label: string
  choices: string[]
  default: string
}

export interface FieldOptions {
  [key: string]: FieldOption
}

export interface DrawingState {
  active: boolean
  start: { x: number; y: number } | null
  current: { x: number; y: number } | null
}

export interface MovingZoneState {
  id: number
  offsetX: number
  offsetY: number
}

export interface ResizingZoneState {
  id: number
  handle: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w'
  startX: number
  startY: number
  startZoneX: number
  startZoneY: number
  startWidth: number
  startHeight: number
}

// ─── Template types (for saving/loading layouts) ────────────────────────────
// These store what the zone *should contain* (via fieldId reference)
// rather than storing the actual resolved text values.

/**
 * A zone stripped of resolved data — only stores the layout, styling,
 * and a fieldId reference like "0_day" or "2_game" that encodes
 * which stream index + field type this zone represents.
 *
 * For text zones, fieldId is "text_<n>" and customText is preserved.
 */
export interface TemplateZone {
  fieldId: string
  x: number
  y: number
  width: number
  height: number
  options: Record<string, string>
  fontSize: number
  fontSizeOverride: boolean
  color: string
  bold: boolean
  align: 'left' | 'center' | 'right'
  customText?: string
}

/**
 * The full template payload stored in the database's template_data JSON column.
 */
export interface TemplateData {
  zones: TemplateZone[]
  globalFontSize: number
}