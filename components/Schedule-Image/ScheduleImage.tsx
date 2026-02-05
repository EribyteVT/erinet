'use client'

import React, { useState, useRef } from 'react'
import { Upload, Eye, EyeOff, MoreVertical, Trash2, Download } from 'lucide-react'

// Mock for now
const mockSchedule = [
  { day: '2/9', time: '19:00', game: 'Chibi Robo' },
  { day: '2/10', time: '20:00', game: 'Coding' },
  { day: '2/11', time: null, game: null },
  { day: '2/12', time: '19:30', game: 'Minecraft' },
  { day: '2/13', time: '21:00', game: 'Stuff' },
  { day: '2/14', time: '15:00', game: 'Community Games' },
  { day: '2/15', time: null, game: null },
]

// Build field list from schedule
const buildFieldList = () => {
  const fields = []
  mockSchedule.forEach((row, i) => {
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

const fieldList = buildFieldList()

// Field-specific options
const fieldOptions = {
  day: {
    length: { label: 'Length', choices: ['Full', 'Short', 'Letter'], default: 'Full' },
  },
  time: {
    format: { label: 'Format', choices: ['12-hour', '24-hour'], default: '12-hour' },
    showTz: { label: 'Timezone', choices: ['Hide', 'EST', 'PST', 'CST', 'UTC'], default: 'Hide' },
    offText: { label: 'If OFF', choices: ['OFF', 'Day Off', '—'], default: 'OFF' },
  },
  game: {
    maxLen: { label: 'Max Length', choices: ['None', '15', '20', '25'], default: 'None' },
    offText: { label: 'If OFF', choices: ['—', 'TBD', 'Rest Day'], default: '—' },
  },
}

// Get display value based on options
const getDisplayValue = (field, opts = {}) => {
  if (field.type === 'day') {
    const len = opts.length || 'Full'
    if (len === 'Short') return field.value?.slice(0, 3)
    if (len === 'Letter') return field.value?.[0]
    return field.value
  }
  if (field.type === 'time') {
    if (!field.value) return opts.offText || 'OFF'
    const [h, m] = field.value.split(':').map(Number)
    const format = opts.format || '12-hour'
    let timeStr
    if (format === '12-hour') {
      const period = h >= 12 ? 'PM' : 'AM'
      const hour12 = h % 12 || 12
      timeStr = `${hour12}:${m.toString().padStart(2, '0')} ${period}`
    } else {
      timeStr = field.value
    }
    const tz = opts.showTz || 'Hide'
    return tz !== 'Hide' ? `${timeStr} ${tz}` : timeStr
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

export default function ScheduleBuilder() {
  const [bgImage, setBgImage] = useState(null)
  const [zones, setZones] = useState([])
  const [selectedField, setSelectedField] = useState(null)
  const [menuOpen, setMenuOpen] = useState(null)
  const [preview, setPreview] = useState(false)
  const [drawing, setDrawing] = useState({ active: false, start: null, current: null })
  const canvasRef = useRef(null)

  const getCoords = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    }
  }

  const handleMouseDown = (e) => {
    if (!selectedField || !bgImage) return
    const coords = getCoords(e)
    setDrawing({ active: true, start: coords, current: coords })
  }

  const handleMouseMove = (e) => {
    if (!drawing.active) return
    setDrawing((d) => ({ ...d, current: getCoords(e) }))
  }

  const handleMouseUp = () => {
    if (!drawing.active || !selectedField) return
    const { start, current } = drawing
    const w = Math.abs(current.x - start.x)
    const h = Math.abs(current.y - start.y)

    if (w > 2 && h > 1) {
      const field = fieldList.find((f) => f.id === selectedField)
      const newZone = {
        id: Date.now(),
        fieldId: selectedField,
        field,
        x: Math.min(start.x, current.x),
        y: Math.min(start.y, current.y),
        width: w,
        height: h,
        options: {},
        fontSize: 16,
        color: '#ffffff',
        bold: false,
        align: 'center',
      }
      setZones([...zones, newZone])
      setSelectedField(null) // Deselect after placing
    }
    setDrawing({ active: false, start: null, current: null })
  }

  const updateZone = (id, updates) => {
    setZones(zones.map((z) => (z.id === id ? { ...z, ...updates } : z)))
  }

  const updateZoneOption = (id, key, value) => {
    setZones(
      zones.map((z) =>
        z.id === id ? { ...z, options: { ...z.options, [key]: value } } : z
      )
    )
  }

  const deleteZone = (id) => {
    setZones(zones.filter((z) => z.id !== id))
    setMenuOpen(null)
  }

  const menuZone = zones.find((z) => z.id === menuOpen)
  const menuFieldOpts = menuZone ? fieldOptions[menuZone.field?.type] : null

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Schedule Image Builder</h1>
            <p className="text-sm text-muted-foreground">Create shareable stream schedules</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPreview(!preview)}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                preview
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {preview ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              Preview
            </button>
            <button className="px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
       
        <div className="w-80 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <p className="text-sm text-muted-foreground">
              Select a cell, then draw on the canvas to place it
            </p>
          </div>

          {/* 7x3 Grid */}
          <div className="flex-1 overflow-auto p-4">
            <div className="grid grid-cols-3 gap-px bg-border rounded-lg overflow-hidden">
              {/* Header row */}
              <div className="bg-secondary px-3 py-2 text-xs font-medium text-muted-foreground">
                Day
              </div>
              <div className="bg-secondary px-3 py-2 text-xs font-medium text-muted-foreground">
                Time
              </div>
              <div className="bg-secondary px-3 py-2 text-xs font-medium text-muted-foreground">
                Stream
              </div>

              {/* Data rows */}
              {mockSchedule.map((row, i) => (
                <React.Fragment key={i}>
                  {/* Day */}
                  <label
                    className={`bg-card px-3 py-2 cursor-pointer flex items-center gap-2 transition-colors ${
                      selectedField === `${i}_day` ? 'bg-primary/20 ring-1 ring-primary' : 'hover:bg-secondary'
                    }`}
                  >
                    <input
                      type="radio"
                      name="field"
                      value={`${i}_day`}
                      checked={selectedField === `${i}_day`}
                      onChange={(e) => setSelectedField(e.target.value)}
                      className="sr-only"
                    />
                    <div
                      className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                        selectedField === `${i}_day` ? 'border-primary' : 'border-muted-foreground'
                      }`}
                    >
                      {selectedField === `${i}_day` && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <span className="text-sm truncate">{row.day.slice(0, 3)}</span>
                  </label>

                  {/* Time */}
                  <label
                    className={`bg-card px-3 py-2 cursor-pointer flex items-center gap-2 transition-colors ${
                      selectedField === `${i}_time` ? 'bg-primary/20 ring-1 ring-primary' : 'hover:bg-secondary'
                    } ${!row.time ? 'text-muted-foreground' : ''}`}
                  >
                    <input
                      type="radio"
                      name="field"
                      value={`${i}_time`}
                      checked={selectedField === `${i}_time`}
                      onChange={(e) => setSelectedField(e.target.value)}
                      className="sr-only"
                    />
                    <div
                      className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                        selectedField === `${i}_time` ? 'border-primary' : 'border-muted-foreground'
                      }`}
                    >
                      {selectedField === `${i}_time` && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <span className="text-sm truncate">{row.time || 'OFF'}</span>
                  </label>

                  {/* Game */}
                  <label
                    className={`bg-card px-3 py-2 cursor-pointer flex items-center gap-2 transition-colors ${
                      selectedField === `${i}_game` ? 'bg-primary/20 ring-1 ring-primary' : 'hover:bg-secondary'
                    } ${!row.game ? 'text-muted-foreground' : ''}`}
                  >
                    <input
                      type="radio"
                      name="field"
                      value={`${i}_game`}
                      checked={selectedField === `${i}_game`}
                      onChange={(e) => setSelectedField(e.target.value)}
                      className="sr-only"
                    />
                    <div
                      className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                        selectedField === `${i}_game` ? 'border-primary' : 'border-muted-foreground'
                      }`}
                    >
                      {selectedField === `${i}_game` && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <span className="text-sm truncate">{row.game || '—'}</span>
                  </label>
                </React.Fragment>
              ))}
            </div>

            {/* Placed zones list */}
            {zones.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Placed ({zones.length})
                </h3>
                <div className="space-y-1">
                  {zones.map((zone) => (
                    <div
                      key={zone.id}
                      className="flex items-center justify-between px-3 py-2 bg-secondary rounded-md text-sm"
                    >
                      <span className="truncate">{zone.field?.label}</span>
                      <button
                        onClick={() => deleteZone(zone.id)}
                        className="text-muted-foreground hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Canvas */}
        <div className="flex-1 p-6 overflow-auto bg-secondary/30">
          <div className="mb-4">
            <label className="px-4 py-2 rounded-md text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-pointer inline-flex items-center gap-2">
              <Upload className="w-4 h-4" />
              {bgImage ? 'Change Image' : 'Upload Background'}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = (e) => setBgImage(e.target?.result)
                    reader.readAsDataURL(file)
                  }
                }}
                className="hidden"
              />
            </label>
            {selectedField && bgImage && (
              <span className="ml-4 text-sm text-primary">
                Click and drag on the image to place
              </span>
            )}
          </div>

          {/* Canvas */}
          <div
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => drawing.active && handleMouseUp()}
            onClick={() => setMenuOpen(null)}
            className={`relative bg-card rounded-lg overflow-hidden shadow-lg ${
              selectedField && bgImage ? 'cursor-crosshair' : ''
            }`}
            style={{ width: '100%', maxWidth: '800px', aspectRatio: '16/9' }}
          >
            {bgImage ? (
              <img
                src={bgImage}
                alt=""
                className="w-full h-full object-cover pointer-events-none"
                draggable={false}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                <Upload className="w-12 h-12 mb-3 opacity-50" />
                <p>Upload a background image</p>
                <p className="text-sm mt-1 opacity-70">1920×1080 recommended</p>
              </div>
            )}

            {/* Zones */}
            {zones.map((zone) => {
              const displayValue = getDisplayValue(zone.field, zone.options)

              return (
                <div
                  key={zone.id}
                  onClick={(e) => e.stopPropagation()}
                  className={`absolute group ${
                    preview ? '' : 'border-2 border-primary/50 bg-primary/10'
                  }`}
                  style={{
                    left: `${zone.x}%`,
                    top: `${zone.y}%`,
                    width: `${zone.width}%`,
                    height: `${zone.height}%`,
                  }}
                >
                  <div
                    className="w-full h-full flex items-center px-1 overflow-hidden"
                    style={{
                      justifyContent:
                        zone.align === 'left'
                          ? 'flex-start'
                          : zone.align === 'right'
                          ? 'flex-end'
                          : 'center',
                      fontSize: `${zone.fontSize}px`,
                      color: zone.color,
                      fontWeight: zone.bold ? 'bold' : 'normal',
                      textShadow: preview ? '1px 1px 3px rgba(0,0,0,0.9)' : 'none',
                    }}
                  >
                    {preview ? (
                      displayValue
                    ) : (
                      <span className="text-xs bg-black/70 px-1.5 py-0.5 rounded truncate">
                        {zone.field?.label}
                      </span>
                    )}
                  </div>

                  {/* 3-dot menu button */}
                  {!preview && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setMenuOpen(menuOpen === zone.id ? null : zone.id)
                      }}
                      className={`absolute -right-1 -top-1 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center shadow-lg transition-opacity ${
                        menuOpen === zone.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Contextual Menu */}
                  {menuOpen === zone.id && !preview && (
                    <div
                      className="absolute right-0 top-7 bg-card rounded-lg shadow-2xl border border-border w-52 z-50 overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Field-specific options */}
                      {menuFieldOpts && (
                        <div className="p-3 border-b border-border space-y-3">
                          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                            Options
                          </div>
                          {Object.entries(menuFieldOpts).map(([key, opt]) => (
                            <div key={key} className="flex items-center justify-between gap-2">
                              <span className="text-sm">{opt.label}</span>
                              <select
                                value={menuZone.options[key] ?? opt.default}
                                onChange={(e) => updateZoneOption(menuZone.id, key, e.target.value)}
                                className="bg-secondary border border-border rounded px-2 py-1 text-xs"
                              >
                                {opt.choices.map((c) => (
                                  <option key={c} value={c}>
                                    {c}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Style options */}
                      <div className="p-3 border-b border-border">
                        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
                          Style
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={menuZone?.color || '#ffffff'}
                            onChange={(e) => updateZone(menuZone.id, { color: e.target.value })}
                            className="w-8 h-8 rounded cursor-pointer border-0"
                          />
                          <input
                            type="number"
                            value={menuZone?.fontSize || 16}
                            onChange={(e) =>
                              updateZone(menuZone.id, { fontSize: parseInt(e.target.value) || 16 })
                            }
                            className="w-14 bg-secondary border border-border rounded px-2 py-1 text-sm"
                            min="8"
                            max="72"
                          />
                          <button
                            onClick={() => updateZone(menuZone.id, { bold: !menuZone.bold })}
                            className={`w-8 h-8 rounded text-sm font-bold ${
                              menuZone?.bold ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                            }`}
                          >
                            B
                          </button>
                        </div>
                        <div className="flex mt-2 bg-secondary rounded overflow-hidden">
                          {['left', 'center', 'right'].map((a) => (
                            <button
                              key={a}
                              onClick={() => updateZone(menuZone.id, { align: a })}
                              className={`flex-1 py-1.5 text-xs capitalize ${
                                menuZone?.align === a ? 'bg-primary text-primary-foreground' : ''
                              }`}
                            >
                              {a}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => deleteZone(menuZone.id)}
                        className="w-full px-3 py-2 text-red-400 hover:bg-red-400/10 text-sm flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Drawing preview */}
            {drawing.active && drawing.start && drawing.current && (
              <div
                className="absolute border-2 border-dashed border-primary bg-primary/20 pointer-events-none"
                style={{
                  left: `${Math.min(drawing.start.x, drawing.current.x)}%`,
                  top: `${Math.min(drawing.start.y, drawing.current.y)}%`,
                  width: `${Math.abs(drawing.current.x - drawing.start.x)}%`,
                  height: `${Math.abs(drawing.current.y - drawing.start.y)}%`,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
