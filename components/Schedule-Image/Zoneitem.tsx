"use client";

import React from "react";
import { MoreVertical, Trash2 } from "lucide-react";
import { Zone, FieldOptions } from "./types";
import { getDisplayValue } from "./utils";
import { fieldOptions } from "../websiteGenerator/constants";

export type ResizeHandle = "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w";

interface ZoneItemProps {
  zone: Zone;
  globalFontSize: number;
  isMoving: boolean;
  isResizing: boolean;
  menuOpen: boolean;
  onMoveStart: (e: React.MouseEvent) => void;
  onResizeStart: (e: React.MouseEvent, handle: ResizeHandle) => void;
  onMenuToggle: () => void;
  onUpdateZone: (updates: Partial<Zone>) => void;
  onUpdateOption: (key: string, value: string) => void;
  onDelete: () => void;
}

export function ZoneItem({
  zone,
  globalFontSize,
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
  const isTextZone = zone.field?.type === "text";
  const displayValue = getDisplayValue(zone.field, zone.options, zone);
  const menuFieldOpts: FieldOptions | null = isTextZone
    ? null
    : fieldOptions[zone.field?.type] || null;

  // Use the zone's own fontSize if overridden, otherwise use globalFontSize
  const effectiveFontSize = zone.fontSizeOverride
    ? zone.fontSize
    : globalFontSize;

  const handleCursors: Record<ResizeHandle, string> = {
    nw: "cursor-nwse-resize",
    ne: "cursor-nesw-resize",
    sw: "cursor-nesw-resize",
    se: "cursor-nwse-resize",
    n: "cursor-ns-resize",
    s: "cursor-ns-resize",
    e: "cursor-ew-resize",
    w: "cursor-ew-resize",
  };

  return (
    <div
      data-zone
      onClick={(e) => e.stopPropagation()}
      className={`absolute group ${isMoving || isResizing ? "ring-2 ring-primary z-50" : ""}`}
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
          isMoving ? "cursor-grabbing" : ""
        }`}
      />

      {/* Content display - always shows preview */}
      <div
        className="w-full h-full flex items-center px-1 overflow-hidden pointer-events-none"
        style={{
          justifyContent:
            zone.align === "left"
              ? "flex-start"
              : zone.align === "right"
                ? "flex-end"
                : "center",
          fontSize: `${effectiveFontSize}px`,
          color: zone.color,
          fontWeight: zone.bold ? "bold" : "normal",
          textShadow: "1px 1px 3px rgba(0,0,0,0.9)",
        }}
      >
        {displayValue}
      </div>

      {/* Resize handles - corners */}
      {(["nw", "ne", "sw", "se"] as const).map((handle) => (
        <div
          key={handle}
          onMouseDown={(e) => onResizeStart(e, handle)}
          className={`absolute w-3 h-3 bg-primary border-2 border-background rounded-sm opacity-0 group-hover:opacity-100 transition-opacity z-20 ${handleCursors[handle]} ${
            handle.includes("n") ? "-top-1.5" : "-bottom-1.5"
          } ${handle.includes("w") ? "-left-1.5" : "-right-1.5"}`}
        />
      ))}

      {/* Resize handles - edges */}
      {(["n", "s", "e", "w"] as const).map((handle) => (
        <div
          key={handle}
          onMouseDown={(e) => onResizeStart(e, handle)}
          className={`absolute opacity-0 group-hover:opacity-100 transition-opacity z-10 ${handleCursors[handle]} ${
            handle === "n" || handle === "s"
              ? "left-3 right-3 h-2"
              : "top-3 bottom-3 w-2"
          } ${handle === "n" ? "-top-1" : ""} ${handle === "s" ? "-bottom-1" : ""} ${
            handle === "w" ? "-left-1" : ""
          } ${handle === "e" ? "-right-1" : ""}`}
        />
      ))}

      {/* 3-dot menu button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onMenuToggle();
        }}
        className={`absolute -right-1 -top-1 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center shadow-lg transition-opacity z-30 ${
          menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>

      {/* Contextual Menu */}
      {menuOpen && (
        <ZoneMenu
          zone={zone}
          globalFontSize={globalFontSize}
          effectiveFontSize={effectiveFontSize}
          isTextZone={isTextZone}
          fieldOpts={menuFieldOpts}
          onUpdateZone={onUpdateZone}
          onUpdateOption={onUpdateOption}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}

interface ZoneMenuProps {
  zone: Zone;
  globalFontSize: number;
  effectiveFontSize: number;
  isTextZone: boolean;
  fieldOpts: FieldOptions | null;
  onUpdateZone: (updates: Partial<Zone>) => void;
  onUpdateOption: (key: string, value: string) => void;
  onDelete: () => void;
}

function ZoneMenu({
  zone,
  globalFontSize,
  effectiveFontSize,
  isTextZone,
  fieldOpts,
  onUpdateZone,
  onUpdateOption,
  onDelete,
}: ZoneMenuProps) {
  return (
    <div
      className="absolute right-0 top-7 bg-card rounded-lg shadow-2xl border border-border w-52 z-50 overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Text content input for text zones */}
      {isTextZone && (
        <div className="p-3 border-b border-border">
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
            Text Content
          </div>
          <textarea
            value={zone.customText || ""}
            onChange={(e) => onUpdateZone({ customText: e.target.value })}
            placeholder="Enter your text…"
            className="w-full bg-secondary border border-border rounded px-2 py-1.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
            rows={3}
            autoFocus
          />
        </div>
      )}

      {/* Field-specific options (not shown for text zones) */}
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
          <button
            onClick={() => onUpdateZone({ bold: !zone.bold })}
            className={`w-8 h-8 rounded text-sm font-bold ${
              zone.bold ? "bg-primary text-primary-foreground" : "bg-secondary"
            }`}
          >
            B
          </button>
        </div>

        {/* Font size with override toggle */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">Font Size</span>
            <button
              onClick={() => {
                if (zone.fontSizeOverride) {
                  // Switching back to global — reset fontSize to match global
                  onUpdateZone({
                    fontSizeOverride: false,
                    fontSize: globalFontSize,
                  });
                } else {
                  // Switching to override — keep current effective size as starting point
                  onUpdateZone({
                    fontSizeOverride: true,
                    fontSize: effectiveFontSize,
                  });
                }
              }}
              className={`text-xs px-2 py-0.5 rounded ${
                zone.fontSizeOverride
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {zone.fontSizeOverride ? "Override" : "Global"}
            </button>
          </div>
          <input
            type="number"
            value={effectiveFontSize}
            onChange={(e) => {
              const newSize = parseInt(e.target.value) || 16;
              onUpdateZone({ fontSize: newSize, fontSizeOverride: true });
            }}
            disabled={!zone.fontSizeOverride}
            className={`w-full bg-secondary border border-border rounded px-2 py-1 text-sm ${
              !zone.fontSizeOverride ? "opacity-50 cursor-not-allowed" : ""
            }`}
            min="8"
            max="72"
          />
        </div>

        <div className="flex mt-2 bg-secondary rounded overflow-hidden">
          {(["left", "center", "right"] as const).map((a) => (
            <button
              key={a}
              onClick={() => onUpdateZone({ align: a })}
              className={`flex-1 py-1.5 text-xs capitalize ${
                zone.align === a ? "bg-primary text-primary-foreground" : ""
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
  );
}
