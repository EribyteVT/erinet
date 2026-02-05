import { Field, ScheduleRow } from './types'
import { mockSchedule } from './Constants'

// Build field list from schedule data
export const buildFieldList = (schedule: ScheduleRow[] = mockSchedule): Field[] => {
  const fields: Field[] = []
  schedule.forEach((row, i) => {
    fields.push({
      id: `${i}_day`,
      dayIndex: i,
      type: 'day',
      label: row.day,
      value: row.day,
    })
    fields.push({
      id: `${i}_time`,
      dayIndex: i,
      type: 'time',
      label: row.time || 'OFF',
      value: row.time,
    })
    fields.push({
      id: `${i}_game`,
      dayIndex: i,
      type: 'game',
      label: row.game || '—',
      value: row.game,
    })
  })
  return fields
}

// Get display value based on field type and options
export const getDisplayValue = (field: Field, opts: Record<string, string> = {}): string => {
  if (field.type === 'day') {
    const len = opts.length || 'Full'
    if (len === 'Short') return field.value?.slice(0, 3) || ''
    if (len === 'Letter') return field.value?.[0] || ''
    return field.value || ''
  }
  
  if (field.type === 'time') {
    if (!field.value) return opts.offText || 'OFF'
    const [h, m] = field.value.split(':').map(Number)
    const format = opts.format || '12-hour'
    let timeStr: string
    if (format === '12-hour') {
      const period = h >= 12 ? 'PM' : 'AM'
      const hour12 = h % 12 || 12
      timeStr = `${hour12}:${m.toString().padStart(2, '0')} ${period}`
    } else {
      timeStr = field.value
    }
    const tz = opts.showTz || 'Hide'
    return tz !== 'Hide' ? `${timeStr} CST` : timeStr
  }
  
  if (field.type === 'game') {
    if (!field.value) return opts.offText || '—'
    const maxLen = opts.maxLen || 'None'
    if (maxLen !== 'None') {
      const len = parseInt(maxLen)
      return field.value.length > len ? field.value.slice(0, len - 1) + '…' : field.value
    }
    return field.value
  }
  
  return field.value || ''
}

// Get coordinates relative to canvas
export const getCoords = (
  e: React.MouseEvent | React.DragEvent,
  canvasRef: React.RefObject<HTMLDivElement | null>
): { x: number; y: number } => {
  if (!canvasRef.current) return { x: 0, y: 0 }
  const rect = canvasRef.current.getBoundingClientRect()
  return {
    x: ((e.clientX - rect.left) / rect.width) * 100,
    y: ((e.clientY - rect.top) / rect.height) * 100,
  }
}

// Clamp position to keep zone within canvas bounds
export const clampPosition = (
  x: number,
  y: number,
  width: number,
  height: number
): { x: number; y: number } => {
  return {
    x: Math.max(0, Math.min(x, 100 - width)),
    y: Math.max(0, Math.min(y, 100 - height)),
  }
}