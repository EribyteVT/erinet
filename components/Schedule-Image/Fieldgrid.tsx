"use client";

import React from "react";
import { GripVertical } from "lucide-react";
import { ScheduleRow } from "./types";

interface FieldGridProps {
  schedule: ScheduleRow[];
  selectedField: string | null;
  usedFieldIds: Set<string>;
  onFieldClick: (fieldId: string) => void;
  onDragStart: (e: React.DragEvent, fieldId: string) => void;
  onDragEnd: () => void;
}

export function FieldGrid({
  schedule,
  selectedField,
  usedFieldIds,
  onFieldClick,
  onDragStart,
  onDragEnd,
}: FieldGridProps) {
  const getFieldClassName = (fieldId: string, hasValue: boolean = true) => {
    const baseClass =
      "bg-card px-3 py-2 flex items-center gap-2 transition-all select-none";

    if (usedFieldIds.has(fieldId)) {
      return `${baseClass} opacity-40 cursor-not-allowed`;
    }

    if (selectedField === fieldId) {
      return `${baseClass} bg-primary/30 ring-2 ring-primary ring-inset cursor-pointer`;
    }

    return `${baseClass} hover:bg-secondary cursor-grab active:cursor-grabbing ${!hasValue ? "text-muted-foreground" : ""}`;
  };

  return (
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
      {schedule.map((row, i) => (
        <React.Fragment key={i}>
          {/* Day */}
          <div
            draggable={!usedFieldIds.has(`${i}_day`)}
            onDragStart={(e) => onDragStart(e, `${i}_day`)}
            onDragEnd={onDragEnd}
            onClick={() => onFieldClick(`${i}_day`)}
            className={getFieldClassName(`${i}_day`)}
          >
            {!usedFieldIds.has(`${i}_day`) && (
              <GripVertical className="w-3 h-3 text-muted-foreground shrink-0" />
            )}
            <span className="text-sm truncate">{row.day.slice(0, 3)}</span>
          </div>

          {/* Time */}
          <div
            draggable={!usedFieldIds.has(`${i}_time`)}
            onDragStart={(e) => onDragStart(e, `${i}_time`)}
            onDragEnd={onDragEnd}
            onClick={() => onFieldClick(`${i}_time`)}
            className={getFieldClassName(`${i}_time`, !!row.time)}
          >
            {!usedFieldIds.has(`${i}_time`) && (
              <GripVertical className="w-3 h-3 text-muted-foreground shrink-0" />
            )}
            <span className="text-sm truncate">{row.time || "OFF"}</span>
          </div>

          {/* Game */}
          <div
            draggable={!usedFieldIds.has(`${i}_game`)}
            onDragStart={(e) => onDragStart(e, `${i}_game`)}
            onDragEnd={onDragEnd}
            onClick={() => onFieldClick(`${i}_game`)}
            className={getFieldClassName(`${i}_game`, !!row.game)}
          >
            {!usedFieldIds.has(`${i}_game`) && (
              <GripVertical className="w-3 h-3 text-muted-foreground shrink-0" />
            )}
            <span className="text-sm truncate">{row.game || "—"}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
