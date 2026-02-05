'use client'

import React, { useRef, useCallback } from 'react'
import { Upload } from 'lucide-react'
import { Zone, Field, DrawingState, MovingZoneState, ResizingZoneState } from './types'
import { getCoords, clampPosition } from './utils'
import { DEFAULT_ZONE_WIDTH, DEFAULT_ZONE_HEIGHT } from './constants'
import { ZoneItem, ResizeHandle } from './Zoneitem'

interface CanvasProps {
  bgImage: string | null
  zones: Zone[]
  fieldList: Field[]
  selectedField: string | null
  menuOpen: number | null
  drawing: DrawingState
  movingZone: MovingZoneState | null
  resizingZone: ResizingZoneState | null
  draggedField: string | null
  usedFieldIds: Set<string>
  onSetBgImage: (image: string) => void
  onSetDrawing: (drawing: DrawingState) => void
  onSetMovingZone: (state: MovingZoneState | null) => void
  onSetResizingZone: (state: ResizingZoneState | null) => void
  onSetMenuOpen: (id: number | null) => void
  onPlaceField: (fieldId: string, x: number, y: number, width: number, height: number) => void
  onUpdateZone: (id: number, updates: Partial<Zone>) => void
  onUpdateZoneOption: (id: number, key: string, value: string) => void
  onDeleteZone: (id: number) => void
  onSetZones: (zones: Zone[]) => void
}

const MIN_ZONE_WIDTH = 5
const MIN_ZONE_HEIGHT = 3

export function Canvas({
  bgImage,
  zones,
  fieldList,
  selectedField,
  menuOpen,
  drawing,
  movingZone,
  resizingZone,
  draggedField,
  usedFieldIds,
  onSetBgImage,
  onSetDrawing,
  onSetMovingZone,
  onSetResizingZone,
  onSetMenuOpen,
  onPlaceField,
  onUpdateZone,
  onUpdateZoneOption,
  onDeleteZone,
  onSetZones,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (movingZone || resizingZone) return
    if (!selectedField || !bgImage) return
    const coords = getCoords(e, canvasRef)
    onSetDrawing({ active: true, start: coords, current: coords })
  }, [movingZone, resizingZone, selectedField, bgImage, onSetDrawing])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // Handle resizing a zone
    if (resizingZone) {
      const coords = getCoords(e, canvasRef)
      const deltaX = coords.x - resizingZone.startX
      const deltaY = coords.y - resizingZone.startY
      const handle = resizingZone.handle

      let newX = resizingZone.startZoneX
      let newY = resizingZone.startZoneY
      let newWidth = resizingZone.startWidth
      let newHeight = resizingZone.startHeight

      // Handle horizontal resizing
      if (handle.includes('w')) {
        const maxDeltaX = resizingZone.startWidth - MIN_ZONE_WIDTH
        const clampedDeltaX = Math.min(deltaX, maxDeltaX)
        newX = Math.max(0, resizingZone.startZoneX + clampedDeltaX)
        newWidth = resizingZone.startWidth - (newX - resizingZone.startZoneX)
      } else if (handle.includes('e')) {
        newWidth = Math.max(MIN_ZONE_WIDTH, Math.min(resizingZone.startWidth + deltaX, 100 - resizingZone.startZoneX))
      }

      // Handle vertical resizing
      if (handle.includes('n')) {
        const maxDeltaY = resizingZone.startHeight - MIN_ZONE_HEIGHT
        const clampedDeltaY = Math.min(deltaY, maxDeltaY)
        newY = Math.max(0, resizingZone.startZoneY + clampedDeltaY)
        newHeight = resizingZone.startHeight - (newY - resizingZone.startZoneY)
      } else if (handle.includes('s')) {
        newHeight = Math.max(MIN_ZONE_HEIGHT, Math.min(resizingZone.startHeight + deltaY, 100 - resizingZone.startZoneY))
      }

      onSetZones(zones.map(z =>
        z.id === resizingZone.id
          ? { ...z, x: newX, y: newY, width: newWidth, height: newHeight }
          : z
      ))
      return
    }

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
  }, [resizingZone, movingZone, zones, drawing, onSetZones, onSetDrawing])

  const handleMouseUp = useCallback(() => {
    // Handle finishing resize
    if (resizingZone) {
      onSetResizingZone(null)
      return
    }

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
  }, [resizingZone, movingZone, drawing, selectedField, onSetResizingZone, onSetMovingZone, onPlaceField, onSetDrawing])

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    onSetMenuOpen(null)
    
    if (movingZone || resizingZone) return
    
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
  }, [movingZone, resizingZone, selectedField, bgImage, drawing.active, onSetMenuOpen, onPlaceField])

  const handleZoneMoveStart = useCallback((e: React.MouseEvent, zone: Zone) => {
    e.stopPropagation()
    e.preventDefault()
    
    const coords = getCoords(e, canvasRef)
    onSetMovingZone({
      id: zone.id,
      offsetX: coords.x - zone.x,
      offsetY: coords.y - zone.y,
    })
    onSetMenuOpen(null)
  }, [onSetMovingZone, onSetMenuOpen])

  const handleZoneResizeStart = useCallback((e: React.MouseEvent, zone: Zone, handle: ResizeHandle) => {
    e.stopPropagation()
    e.preventDefault()
    
    const coords = getCoords(e, canvasRef)
    onSetResizingZone({
      id: zone.id,
      handle,
      startX: coords.x,
      startY: coords.y,
      startZoneX: zone.x,
      startZoneY: zone.y,
      startWidth: zone.width,
      startHeight: zone.height,
    })
    onSetMenuOpen(null)
  }, [onSetResizingZone, onSetMenuOpen])

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

  // Determine cursor based on current state
  const getCursorClass = () => {
    if (resizingZone) return ''
    if (movingZone) return 'cursor-grabbing'
    if (selectedField && bgImage) return 'cursor-crosshair'
    return ''
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
          if (resizingZone) onSetResizingZone(null)
        }}
        onClick={handleCanvasClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative bg-card rounded-lg overflow-hidden shadow-lg ${getCursorClass()} ${
          draggedField && bgImage ? 'ring-2 ring-primary ring-dashed' : ''
        }`}
        style={{ width: '80%',  aspectRatio: '16/9' }}
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
            isMoving={movingZone?.id === zone.id}
            isResizing={resizingZone?.id === zone.id}
            menuOpen={menuOpen === zone.id}
            onMoveStart={(e) => handleZoneMoveStart(e, zone)}
            onResizeStart={(e, handle) => handleZoneResizeStart(e, zone, handle)}
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