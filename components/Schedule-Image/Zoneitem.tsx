'use client'

import React from 'react'
import { MoreVertical, Trash2, Move } from 'lucide-react'
import { Zone, FieldOptions } from './types'
import { getDisplayValue } from './utils'
import { fieldOptions } from './Constants'

interface ZoneItemProps {
  zone: Zone
  preview: boolean
  isMoving: boolean
  menuOpen: boolean
  onMoveStart: (e: React.MouseEvent) => void
  onMenuToggle: () => void
  onUpdateZone: (updates: Partial<Zone>) => void
  onUpdateOption: (key: string, value: string) => void
  onDelete: () => void
}

export function ZoneItem({
  zone,
  preview,
  isMoving,
  menuOpen,
  onMoveStart,
  onMenuToggle,
  onUpdateZone,
  onUpdateOption,
  onDelete,
}: ZoneItemProps) {
  const displayValue = getDisplayValue(zone.field, zone.options)
  const menuFieldOpts: FieldOptions | null = fieldOptions[zone.field?.type] || null

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`absolute group ${
        preview ? '' : 'border-2 border-primary/50 bg-primary/10'
      } ${isMoving ? 'ring-2 ring-primary z-50' : ''}`}
      style={{
        left: `${zone.x}%`,
        top: `${zone.y}%`,
        width: `${zone.width}%`,
        height: `${zone.height}%`,
      }}
    >
      {/* Move handle - covers entire zone when not in preview */}
      {!preview && (
        <div
          onMouseDown={onMoveStart}
          className={`absolute inset-0 cursor-grab active:cursor-grabbing ${
            isMoving ? 'cursor-grabbing' : ''
          }`}
        />
      )}

      {/* Content display */}
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
          textShadow: preview ? '1px 1px 3px rgba(0,0,0,0.9)' : 'none',
        }}
      >
        {preview ? (
          displayValue
        ) : (
          <span className="text-xs bg-black/70 px-1.5 py-0.5 rounded truncate flex items-center gap-1">
            <Move className="w-3 h-3 opacity-60" />
            {displayValue}
          </span>
        )}
      </div>

      {/* 3-dot menu button */}
      {!preview && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onMenuToggle()
          }}
          className={`absolute -right-1 -top-1 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center shadow-lg transition-opacity z-10 ${
            menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Contextual Menu */}
      {menuOpen && !preview && (
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