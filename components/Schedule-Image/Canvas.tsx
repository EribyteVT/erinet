'use client'

import React, { useRef, useCallback } from 'react'
import { Upload } from 'lucide-react'
import { Zone, Field, DrawingState, MovingZoneState } from './types'
import { getCoords, clampPosition } from './utils'
import { DEFAULT_ZONE_WIDTH, DEFAULT_ZONE_HEIGHT } from './Constants'
import { ZoneItem } from './Zoneitem'

interface CanvasProps {
  bgImage: string | null
  zones: Zone[]
  fieldList: Field[]
  selectedField: string | null
  preview: boolean
  menuOpen: number | null
  drawing: DrawingState
  movingZone: MovingZoneState | null
  draggedField: string | null
  usedFieldIds: Set<string>
  onSetBgImage: (image: string) => void
  onSetDrawing: (drawing: DrawingState) => void
  onSetMovingZone: (state: MovingZoneState | null) => void
  onSetMenuOpen: (id: number | null) => void
  onPlaceField: (fieldId: string, x: number, y: number, width: number, height: number) => void
  onUpdateZone: (id: number, updates: Partial<Zone>) => void
  onUpdateZoneOption: (id: number, key: string, value: string) => void
  onDeleteZone: (id: number) => void
  onSetZones: (zones: Zone[]) => void
}

export function Canvas({
  bgImage,
  zones,
  fieldList,
  selectedField,
  preview,
  menuOpen,
  drawing,
  movingZone,
  draggedField,
  usedFieldIds,
  onSetBgImage,
  onSetDrawing,
  onSetMovingZone,
  onSetMenuOpen,
  onPlaceField,
  onUpdateZone,
  onUpdateZoneOption,
  onDeleteZone,
  onSetZones,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (movingZone) return
    if (!selectedField || !bgImage) return
    const coords = getCoords(e, canvasRef)
    onSetDrawing({ active: true, start: coords, current: coords })
  }, [movingZone, selectedField, bgImage, onSetDrawing])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // Handle moving a zone
    if (movingZone) {
      const coords = getCoords(e, canvasRef)
      const zone = zones.find(z => z.id === movingZone.id)
      if (zone) {
        const { x: newX, y: newY } = clampPosition(
          coords.x - movingZone.offsetX,
          coords.y - movingZone.offsetY,
          zone.width,
          zone.height
        )
        onSetZones(zones.map(z => 
          z.id === movingZone.id 
            ? { ...z, x: newX, y: newY }
            : z
        ))
      }
      return
    }

    // Handle drawing
    if (!drawing.active) return
    const coords = getCoords(e, canvasRef)
    onSetDrawing({ ...drawing, current: coords })
  }, [movingZone, zones, drawing, onSetZones, onSetDrawing])

  const handleMouseUp = useCallback(() => {
    // Handle finishing zone move
    if (movingZone) {
      onSetMovingZone(null)
      return
    }

    // Handle finishing drawing
    if (!drawing.active || !selectedField) return
    const { start, current } = drawing
    if (!start || !current) return
    const w = Math.abs(current.x - start.x)
    const h = Math.abs(current.y - start.y)

    if (w > 2 && h > 1) {
      onPlaceField(selectedField, Math.min(start.x, current.x), Math.min(start.y, current.y), w, h)
    }
    onSetDrawing({ active: false, start: null, current: null })
  }, [movingZone, drawing, selectedField, onSetMovingZone, onPlaceField, onSetDrawing])

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    onSetMenuOpen(null)
    
    if (movingZone) return
    
    if (selectedField && bgImage && !drawing.active) {
      const coords = getCoords(e, canvasRef)
      const { x, y } = clampPosition(
        coords.x - DEFAULT_ZONE_WIDTH / 2,
        coords.y - DEFAULT_ZONE_HEIGHT / 2,
        DEFAULT_ZONE_WIDTH,
        DEFAULT_ZONE_HEIGHT
      )
      onPlaceField(selectedField, x, y, DEFAULT_ZONE_WIDTH, DEFAULT_ZONE_HEIGHT)
    }
  }, [movingZone, selectedField, bgImage, drawing.active, onSetMenuOpen, onPlaceField])

  const handleZoneMoveStart = useCallback((e: React.MouseEvent, zone: Zone) => {
    if (preview) return
    e.stopPropagation()
    e.preventDefault()
    
    const coords = getCoords(e, canvasRef)
    onSetMovingZone({
      id: zone.id,
      offsetX: coords.x - zone.x,
      offsetY: coords.y - zone.y,
    })
    onSetMenuOpen(null)
  }, [preview, onSetMovingZone, onSetMenuOpen])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (!bgImage) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [bgImage])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!bgImage) return
    
    const fieldId = e.dataTransfer.getData('text/plain') || draggedField
    if (!fieldId || usedFieldIds.has(fieldId)) return

    const coords = getCoords(e, canvasRef)
    const { x, y } = clampPosition(
      coords.x - DEFAULT_ZONE_WIDTH / 2,
      coords.y - DEFAULT_ZONE_HEIGHT / 2,
      DEFAULT_ZONE_WIDTH,
      DEFAULT_ZONE_HEIGHT
    )
    onPlaceField(fieldId, x, y, DEFAULT_ZONE_WIDTH, DEFAULT_ZONE_HEIGHT)
  }, [bgImage, draggedField, usedFieldIds, onPlaceField])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => onSetBgImage(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="flex-1 p-6 overflow-auto bg-secondary/30">
      <div className="mb-4">
        <label className="px-4 py-2 rounded-md text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-pointer inline-flex items-center gap-2">
          <Upload className="w-4 h-4" />
          {bgImage ? 'Change Image' : 'Upload Background'}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        {selectedField && bgImage && (
          <span className="ml-4 text-sm text-primary">
            Click on the image to place, or drag to draw a custom size
          </span>
        )}
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          if (drawing.active) handleMouseUp()
          if (movingZone) onSetMovingZone(null)
        }}
        onClick={handleCanvasClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative bg-card rounded-lg overflow-hidden shadow-lg ${
          selectedField && bgImage ? 'cursor-crosshair' : ''
        } ${draggedField && bgImage ? 'ring-2 ring-primary ring-dashed' : ''} ${
          movingZone ? 'cursor-grabbing' : ''
        }`}
        style={{ width: '100%', maxWidth: '900px', aspectRatio: '16/9' }}
      >
        {bgImage ? (
          <img
            src={bgImage}
            alt=""
            className="w-full h-full pointer-events-none"
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
        {zones.map((zone) => (
          <ZoneItem
            key={zone.id}
            zone={zone}
            preview={preview}
            isMoving={movingZone?.id === zone.id}
            menuOpen={menuOpen === zone.id}
            onMoveStart={(e) => handleZoneMoveStart(e, zone)}
            onMenuToggle={() => onSetMenuOpen(menuOpen === zone.id ? null : zone.id)}
            onUpdateZone={(updates) => onUpdateZone(zone.id, updates)}
            onUpdateOption={(key, value) => onUpdateZoneOption(zone.id, key, value)}
            onDelete={() => onDeleteZone(zone.id)}
          />
        ))}

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
  )
}