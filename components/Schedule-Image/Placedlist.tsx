"use client";

import React from "react";
import { Trash2, Type } from "lucide-react";
import { Zone } from "./types";

interface PlacedListProps {
  zones: Zone[];
  onDelete: (id: number) => void;
}

export function PlacedList({ zones, onDelete }: PlacedListProps) {
  if (zones.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
        Placed ({zones.length})
      </h3>
      <div className="space-y-1">
        {zones.map((zone) => {
          const isText = zone.field?.type === "text";
          return (
            <div
              key={zone.id}
              className="flex items-center justify-between px-3 py-2 bg-secondary rounded-md text-sm"
            >
              <span className="truncate flex items-center gap-2">
                {isText && (
                  <Type className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                )}
                {isText ? zone.customText || "Text" : zone.field?.label}
              </span>
              <button
                onClick={() => onDelete(zone.id)}
                className="text-muted-foreground hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
