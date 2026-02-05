import { ScheduleRow, FieldOptions } from './types'

// Mock schedule data - replace with actual data source
export const mockSchedule: ScheduleRow[] = [
  { day: '2/9', time: '19:00', game: 'Chibi Robo' },
  { day: '2/10', time: '20:00', game: 'Coding' },
  { day: '2/11', time: null, game: null },
  { day: '2/12', time: '19:30', game: 'Minecraft' },
  { day: '2/13', time: '21:00', game: 'Stuff' },
  { day: '2/14', time: '15:00', game: 'Community Games' },
  { day: '2/15', time: null, game: null },
]

// Field-specific display options
export const fieldOptions: Record<string, FieldOptions> = {
  day: {
    length: { label: 'Length', choices: ['Full', 'Short', 'Letter'], default: 'Full' },
  },
  time: {
    format: { label: 'Format', choices: ['12-hour', '24-hour'], default: '12-hour' },
    showTz: { label: 'Timezone', choices: ['Hide', 'Show'], default: 'Hide' },
    offText: { label: 'If OFF', choices: ['OFF', 'Day Off', '—'], default: 'OFF' },
  },
  game: {
    maxLen: { label: 'Max Length', choices: ['None', '15', '20', '25'], default: 'None' },
    offText: { label: 'If OFF', choices: ['—', 'TBD', 'Rest Day'], default: '—' },
  },
}

// Default sizes for placed zones
export const DEFAULT_ZONE_WIDTH = 15
export const DEFAULT_ZONE_HEIGHT = 8