'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Type } from 'lucide-react'
import { Zone, DrawingState, MovingZoneState, ResizingZoneState } from './types'
import { mockSchedule, DEFAULT_ZONE_WIDTH, DEFAULT_ZONE_HEIGHT } from './constants'
import { buildFieldList, clampPosition } from './utils'
import { Header } from './Header'
import { FieldGrid } from './Fieldgrid'
import { PlacedList } from './Placedlist'
import { Canvas } from './Canvas'

export default function ScheduleBuilder() {
  // State
  const [bgImage, setBgImage] = useState<string | null>(null)
  const [zones, setZones] = useState<Zone[]>([])
  const [selectedField, setSelectedField] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState<number | null>(null)
  const [drawing, setDrawing] = useState<DrawingState>({ active: false, start: null, current: null })
  const [draggedField, setDraggedField] = useState<string | null>(null)
  const [movingZone, setMovingZone] = useState<MovingZoneState | null>(null)
  const [resizingZone, setResizingZone] = useState<ResizingZoneState | null>(null)
  const [globalFontSize, setGlobalFontSize] = useState<number>(16)
  const [textPlaceMode, setTextPlaceMode] = useState<boolean>(false)

  // Derived state
  const fieldList = useMemo(() => buildFieldList(mockSchedule), [])
  const usedFieldIds = useMemo(() => new Set(zones.map((z) => z.fieldId)), [zones])

  // Handlers
  const handleFieldClick = useCallback((fieldId: string) => {
    if (usedFieldIds.has(fieldId)) return
    setTextPlaceMode(false)
    setSelectedField(selectedField === fieldId ? null : fieldId)
  }, [usedFieldIds, selectedField])

  const handleDragStart = useCallback((e: React.DragEvent, fieldId: string) => {
    if (usedFieldIds.has(fieldId)) {
      e.preventDefault()
      return
    }
    setDraggedField(fieldId)
    e.dataTransfer.setData('text/plain', fieldId)
    e.dataTransfer.effectAllowed = 'copy'
  }, [usedFieldIds])

  const handleDragEnd = useCallback(() => {
    setDraggedField(null)
  }, [])

  const placeField = useCallback((fieldId: string, x: number, y: number, width: number, height: number) => {
    const field = fieldList.find((f) => f.id === fieldId)
    if (!field) return

    const { x: clampedX, y: clampedY } = clampPosition(x, y, width, height)

    const newZone: Zone = {
      id: Date.now(),
      fieldId: fieldId,
      field,
      x: clampedX,
      y: clampedY,
      width,
      height,
      options: {},
      fontSize: globalFontSize,
      fontSizeOverride: false,
      color: '#ffffff',
      bold: false,
      align: 'center',
    }
    setZones((prev) => [...prev, newZone])
    setSelectedField(null)
    setDraggedField(null)
  }, [fieldList, globalFontSize])

  const placeTextBox = useCallback((x: number, y: number, width: number, height: number) => {
    const id = Date.now()
    const { x: clampedX, y: clampedY } = clampPosition(x, y, width, height)

    const textField = {
      id: `text_${id}`,
      dayIndex: -1,
      type: 'text' as const,
      label: 'Text',
      value: null,
    }

    const newZone: Zone = {
      id,
      fieldId: `text_${id}`,
      field: textField,
      x: clampedX,
      y: clampedY,
      width,
      height,
      options: {},
      fontSize: globalFontSize,
      fontSizeOverride: false,
      color: '#ffffff',
      bold: false,
      align: 'center',
      customText: 'Text',
    }
    setZones((prev) => [...prev, newZone])
    setTextPlaceMode(false)
  }, [globalFontSize])

  const handleTextPlaceModeToggle = useCallback(() => {
    setTextPlaceMode((prev) => !prev)
    setSelectedField(null)
  }, [])

  const updateZone = useCallback((id: number, updates: Partial<Zone>) => {
    setZones((prev) => prev.map((z) => (z.id === id ? { ...z, ...updates } : z)))
  }, [])

  const updateZoneOption = useCallback((id: number, key: string, value: string) => {
    setZones((prev) =>
      prev.map((z) =>
        z.id === id ? { ...z, options: { ...z.options, [key]: value } } : z
      )
    )
  }, [])

  const deleteZone = useCallback((id: number) => {
    setZones((prev) => prev.filter((z) => z.id !== id))
    setMenuOpen(null)
  }, [])

  const handleExport = useCallback(() => {
    // TODO: Implement export functionality
    console.log('Export clicked')
  }, [])

  // When global font size changes, update all zones that are NOT overridden
  const handleGlobalFontSizeChange = useCallback((newSize: number) => {
    setGlobalFontSize(newSize)
    setZones((prev) =>
      prev.map((z) => (z.fontSizeOverride ? z : { ...z, fontSize: newSize }))
    )
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header onExport={handleExport} />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-80 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <p className="text-sm text-muted-foreground">
              Drag items onto the canvas, or click to select then click on the image to place
            </p>
          </div>

          {/* Global Font Size Control */}
          <div className="p-4 border-b border-border">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Global Font Size
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="8"
                max="72"
                value={globalFontSize}
                onChange={(e) => handleGlobalFontSizeChange(parseInt(e.target.value))}
                className="flex-1 accent-primary"
              />
              <input
                type="number"
                value={globalFontSize}
                onChange={(e) => handleGlobalFontSizeChange(parseInt(e.target.value) || 16)}
                className="w-14 bg-secondary border border-border rounded px-2 py-1 text-sm text-center"
                min="8"
                max="72"
              />
              <span className="text-xs text-muted-foreground">px</span>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <FieldGrid
              schedule={mockSchedule}
              selectedField={selectedField}
              usedFieldIds={usedFieldIds}
              onFieldClick={handleFieldClick}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />

            {/* Add Text Box Button */}
            <div className="mt-4">
              <button
                onClick={handleTextPlaceModeToggle}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  textPlaceMode
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                <Type className="w-4 h-4" />
                {textPlaceMode ? 'Click on canvas to place…' : 'Add Text Box'}
              </button>
            </div>

            <PlacedList zones={zones} onDelete={deleteZone} />
          </div>
        </div>

        {/* Right: Canvas */}
        <Canvas
          bgImage={bgImage}
          zones={zones}
          fieldList={fieldList}
          selectedField={selectedField}
          menuOpen={menuOpen}
          drawing={drawing}
          movingZone={movingZone}
          resizingZone={resizingZone}
          draggedField={draggedField}
          usedFieldIds={usedFieldIds}
          globalFontSize={globalFontSize}
          textPlaceMode={textPlaceMode}
          onSetBgImage={setBgImage}
          onSetDrawing={setDrawing}
          onSetMovingZone={setMovingZone}
          onSetResizingZone={setResizingZone}
          onSetMenuOpen={setMenuOpen}
          onPlaceField={placeField}
          onPlaceTextBox={placeTextBox}
          onUpdateZone={updateZone}
          onUpdateZoneOption={updateZoneOption}
          onDeleteZone={deleteZone}
          onSetZones={setZones}
        />
      </div>
    </div>
  )
}