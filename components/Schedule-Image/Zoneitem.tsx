'use client'

import React from 'react'
import { MoreVertical, Trash2 } from 'lucide-react'
import { Zone, FieldOptions } from './types'
import { getDisplayValue } from './utils'
import { fieldOptions } from './constants'

export type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w'

interface ZoneItemProps {
  zone: Zone
  isMoving: boolean
  isResizing: boolean
  menuOpen: boolean
  onMoveStart: (e: React.MouseEvent) => void
  onResizeStart: (e: React.MouseEvent, handle: ResizeHandle) => void
  onMenuToggle: () => void
  onUpdateZone: (updates: Partial<Zone>) => void
  onUpdateOption: (key: string, value: string) => void
  onDelete: () => void
}

export function ZoneItem({
  zone,
  isMoving,
  isResizing,
  menuOpen,
  onMoveStart,
  onResizeStart,
  onMenuToggle,
  onUpdateZone,
  onUpdateOption,
  onDelete,
}: ZoneItemProps) {
  const displayValue = getDisplayValue(zone.field, zone.options)
  const menuFieldOpts: FieldOptions | null = fieldOptions[zone.field?.type] || null

  const handleCursors: Record<ResizeHandle, string> = {
    nw: 'cursor-nwse-resize',
    ne: 'cursor-nesw-resize',
    sw: 'cursor-nesw-resize',
    se: 'cursor-nwse-resize',
    n: 'cursor-ns-resize',
    s: 'cursor-ns-resize',
    e: 'cursor-ew-resize',
    w: 'cursor-ew-resize',
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`absolute group ${isMoving || isResizing ? 'ring-2 ring-primary z-50' : ''}`}
      style={{
        left: `${zone.x}%`,
        top: `${zone.y}%`,
        width: `${zone.width}%`,
        height: `${zone.height}%`,
      }}
    >
      {/* Border overlay - visible on hover */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/50 pointer-events-none transition-colors" />

      {/* Move handle - covers entire zone */}
      <div
        onMouseDown={onMoveStart}
        className={`absolute inset-0 cursor-grab active:cursor-grabbing ${
          isMoving ? 'cursor-grabbing' : ''
        }`}
      />

      {/* Content display - always shows preview */}
      <div
        className="w-full h-full flex items-center px-1 overflow-hidden pointer-events-none"
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
          textShadow: '1px 1px 3px rgba(0,0,0,0.9)',
        }}
      >
        {displayValue}
      </div>

      {/* Resize handles - corners */}
      {(['nw', 'ne', 'sw', 'se'] as const).map((handle) => (
        <div
          key={handle}
          onMouseDown={(e) => onResizeStart(e, handle)}
          className={`absolute w-3 h-3 bg-primary border-2 border-background rounded-sm opacity-0 group-hover:opacity-100 transition-opacity z-20 ${handleCursors[handle]} ${
            handle.includes('n') ? '-top-1.5' : '-bottom-1.5'
          } ${handle.includes('w') ? '-left-1.5' : '-right-1.5'}`}
        />
      ))}

      {/* Resize handles - edges */}
      {(['n', 's', 'e', 'w'] as const).map((handle) => (
        <div
          key={handle}
          onMouseDown={(e) => onResizeStart(e, handle)}
          className={`absolute opacity-0 group-hover:opacity-100 transition-opacity z-10 ${handleCursors[handle]} ${
            handle === 'n' || handle === 's'
              ? 'left-3 right-3 h-2'
              : 'top-3 bottom-3 w-2'
          } ${handle === 'n' ? '-top-1' : ''} ${handle === 's' ? '-bottom-1' : ''} ${
            handle === 'w' ? '-left-1' : ''
          } ${handle === 'e' ? '-right-1' : ''}`}
        />
      ))}

      {/* 3-dot menu button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onMenuToggle()
        }}
        className={`absolute -right-1 -top-1 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center shadow-lg transition-opacity z-30 ${
          menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>

      {/* Contextual Menu */}
      {menuOpen && (
        <ZoneMenu
          zone={zone}
          fieldOpts={menuFieldOpts}
          onUpdateZone={onUpdateZone}
          onUpdateOption={onUpdateOption}
          onDelete={onDelete}
        />
      )}
    </div>
  )
}

interface ZoneMenuProps {
  zone: Zone
  fieldOpts: FieldOptions | null
  onUpdateZone: (updates: Partial<Zone>) => void
  onUpdateOption: (key: string, value: string) => void
  onDelete: () => void
}

function ZoneMenu({ zone, fieldOpts, onUpdateZone, onUpdateOption, onDelete }: ZoneMenuProps) {
  return (
    <div
      className="absolute right-0 top-7 bg-card rounded-lg shadow-2xl border border-border w-52 z-50 overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Field-specific options */}
      {fieldOpts && (
        <div className="p-3 border-b border-border space-y-3">
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Options
          </div>
          {Object.entries(fieldOpts).map(([key, opt]) => (
            <div key={key} className="flex items-center justify-between gap-2">
              <span className="text-sm">{opt.label}</span>
              <select
                value={zone.options[key] ?? opt.default}
                onChange={(e) => onUpdateOption(key, e.target.value)}
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
            value={zone.color}
            onChange={(e) => onUpdateZone({ color: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer border-0"
          />
          <input
            type="number"
            value={zone.fontSize}
            onChange={(e) => onUpdateZone({ fontSize: parseInt(e.target.value) || 16 })}
            className="w-14 bg-secondary border border-border rounded px-2 py-1 text-sm"
            min="8"
            max="72"
          />
          <button
            onClick={() => onUpdateZone({ bold: !zone.bold })}
            className={`w-8 h-8 rounded text-sm font-bold ${
              zone.bold ? 'bg-primary text-primary-foreground' : 'bg-secondary'
            }`}
          >
            B
          </button>
        </div>
        <div className="flex mt-2 bg-secondary rounded overflow-hidden">
          {(['left', 'center', 'right'] as const).map((a) => (
            <button
              key={a}
              onClick={() => onUpdateZone({ align: a })}
              className={`flex-1 py-1.5 text-xs capitalize ${
                zone.align === a ? 'bg-primary text-primary-foreground' : ''
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={onDelete}
        className="w-full px-3 py-2 text-red-400 hover:bg-red-400/10 text-sm flex items-center gap-2"
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>
    </div>
  )
}