'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Zone, DrawingState, MovingZoneState, ResizingZoneState } from './types'
import { mockSchedule } from './constants'
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

  // Derived state
  const fieldList = useMemo(() => buildFieldList(mockSchedule), [])
  const usedFieldIds = useMemo(() => new Set(zones.map((z) => z.fieldId)), [zones])

  // Handlers
  const handleFieldClick = useCallback((fieldId: string) => {
    if (usedFieldIds.has(fieldId)) return
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
      fontSize: 16,
      color: '#ffffff',
      bold: false,
      align: 'center',
    }
    setZones((prev) => [...prev, newZone])
    setSelectedField(null)
    setDraggedField(null)
  }, [fieldList])

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

          <div className="flex-1 overflow-auto p-4">
            <FieldGrid
              schedule={mockSchedule}
              selectedField={selectedField}
              usedFieldIds={usedFieldIds}
              onFieldClick={handleFieldClick}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />

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
          onSetBgImage={setBgImage}
          onSetDrawing={setDrawing}
          onSetMovingZone={setMovingZone}
          onSetResizingZone={setResizingZone}
          onSetMenuOpen={setMenuOpen}
          onPlaceField={placeField}
          onUpdateZone={updateZone}
          onUpdateZoneOption={updateZoneOption}
          onDeleteZone={deleteZone}
          onSetZones={setZones}
        />
      </div>
    </div>
  )
}