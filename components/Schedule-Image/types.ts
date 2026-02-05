export interface ScheduleRow {
  day: string
  time: string | null
  game: string | null
}

export interface Field {
  id: string
  dayIndex: number
  type: 'day' | 'time' | 'game'
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
  color: string
  bold: boolean
  align: 'left' | 'center' | 'right'
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