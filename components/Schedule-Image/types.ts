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