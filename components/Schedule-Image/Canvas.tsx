"use client";

import React, { useRef, useCallback } from "react";
import { Upload } from "lucide-react";
import {
  Zone,
  Field,
  DrawingState,
  MovingZoneState,
  ResizingZoneState,
} from "./types";
import { getCoords, clampPosition } from "./utils";
import {
  DEFAULT_ZONE_WIDTH,
  DEFAULT_ZONE_HEIGHT,
} from "../websiteGenerator/constants";
import { ZoneItem, ResizeHandle } from "./Zoneitem";

interface CanvasProps {
  bgImage: string | null;
  zones: Zone[];
  fieldList: Field[];
  selectedField: string | null;
  menuOpen: number | null;
  drawing: DrawingState;
  movingZone: MovingZoneState | null;
  resizingZone: ResizingZoneState | null;
  draggedField: string | null;
  usedFieldIds: Set<string>;
  globalFontSize: number;
  textPlaceMode: boolean;
  onSetBgImage: (image: string) => void;
  onSetDrawing: (drawing: DrawingState) => void;
  onSetMovingZone: (state: MovingZoneState | null) => void;
  onSetResizingZone: (state: ResizingZoneState | null) => void;
  onSetMenuOpen: (id: number | null) => void;
  onPlaceField: (
    fieldId: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ) => void;
  onPlaceTextBox: (x: number, y: number, width: number, height: number) => void;
  onUpdateZone: (id: number, updates: Partial<Zone>) => void;
  onUpdateZoneOption: (id: number, key: string, value: string) => void;
  onDeleteZone: (id: number) => void;
  onSetZones: (zones: Zone[]) => void;
}

const MIN_ZONE_WIDTH = 5;
const MIN_ZONE_HEIGHT = 3;

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
  globalFontSize,
  textPlaceMode,
  onSetBgImage,
  onSetDrawing,
  onSetMovingZone,
  onSetResizingZone,
  onSetMenuOpen,
  onPlaceField,
  onPlaceTextBox,
  onUpdateZone,
  onUpdateZoneOption,
  onDeleteZone,
  onSetZones,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  // Can place if a field is selected OR in text place mode
  const canPlace = (selectedField || textPlaceMode) && bgImage;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (movingZone || resizingZone) return;
      if (!canPlace) return;
      const coords = getCoords(e, canvasRef);
      onSetDrawing({ active: true, start: coords, current: coords });
    },
    [movingZone, resizingZone, canPlace, onSetDrawing],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      // Handle resizing a zone
      if (resizingZone) {
        const coords = getCoords(e, canvasRef);
        const deltaX = coords.x - resizingZone.startX;
        const deltaY = coords.y - resizingZone.startY;
        const handle = resizingZone.handle;

        let newX = resizingZone.startZoneX;
        let newY = resizingZone.startZoneY;
        let newWidth = resizingZone.startWidth;
        let newHeight = resizingZone.startHeight;

        if (handle.includes("e"))
          newWidth = Math.max(MIN_ZONE_WIDTH, resizingZone.startWidth + deltaX);
        if (handle.includes("w")) {
          newWidth = Math.max(MIN_ZONE_WIDTH, resizingZone.startWidth - deltaX);
          newX = resizingZone.startZoneX + (resizingZone.startWidth - newWidth);
        }
        if (handle.includes("s"))
          newHeight = Math.max(
            MIN_ZONE_HEIGHT,
            resizingZone.startHeight + deltaY,
          );
        if (handle.includes("n")) {
          newHeight = Math.max(
            MIN_ZONE_HEIGHT,
            resizingZone.startHeight - deltaY,
          );
          newY =
            resizingZone.startZoneY + (resizingZone.startHeight - newHeight);
        }

        const clamped = clampPosition(newX, newY, newWidth, newHeight);
        onUpdateZone(resizingZone.id, {
          x: clamped.x,
          y: clamped.y,
          width: Math.min(newWidth, 100 - clamped.x),
          height: Math.min(newHeight, 100 - clamped.y),
        });
        return;
      }

      // Handle moving a zone
      if (movingZone) {
        const coords = getCoords(e, canvasRef);
        const zone = zones.find((z) => z.id === movingZone.id);
        if (!zone) return;
        const newX = coords.x - movingZone.offsetX;
        const newY = coords.y - movingZone.offsetY;
        const clamped = clampPosition(newX, newY, zone.width, zone.height);
        onUpdateZone(movingZone.id, { x: clamped.x, y: clamped.y });
        return;
      }

      // Handle drawing
      if (drawing.active) {
        const coords = getCoords(e, canvasRef);
        onSetDrawing({ ...drawing, current: coords });
      }
    },
    [resizingZone, movingZone, drawing, zones, onUpdateZone, onSetDrawing],
  );

  const handleMouseUp = useCallback(() => {
    if (resizingZone) {
      onSetResizingZone(null);
      return;
    }

    if (movingZone) {
      onSetMovingZone(null);
      return;
    }

    if (drawing.active && drawing.start && drawing.current) {
      const x = Math.min(drawing.start.x, drawing.current.x);
      const y = Math.min(drawing.start.y, drawing.current.y);
      const w = Math.abs(drawing.current.x - drawing.start.x);
      const h = Math.abs(drawing.current.y - drawing.start.y);

      if (w > 2 && h > 2) {
        if (textPlaceMode) {
          onPlaceTextBox(x, y, w, h);
        } else if (selectedField) {
          onPlaceField(selectedField, x, y, w, h);
        }
      }
      onSetDrawing({ active: false, start: null, current: null });
    }
  }, [
    resizingZone,
    movingZone,
    drawing,
    selectedField,
    textPlaceMode,
    onSetResizingZone,
    onSetMovingZone,
    onPlaceField,
    onPlaceTextBox,
    onSetDrawing,
  ]);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (!canPlace) return;
      if (drawing.active) return;

      const target = e.target as HTMLElement;
      if (target.closest("[data-zone]")) return;

      const coords = getCoords(e, canvasRef);
      if (textPlaceMode) {
        onPlaceTextBox(
          coords.x - DEFAULT_ZONE_WIDTH / 2,
          coords.y - DEFAULT_ZONE_HEIGHT / 2,
          DEFAULT_ZONE_WIDTH,
          DEFAULT_ZONE_HEIGHT,
        );
      } else if (selectedField) {
        onPlaceField(
          selectedField,
          coords.x - DEFAULT_ZONE_WIDTH / 2,
          coords.y - DEFAULT_ZONE_HEIGHT / 2,
          DEFAULT_ZONE_WIDTH,
          DEFAULT_ZONE_HEIGHT,
        );
      }
    },
    [
      canPlace,
      drawing.active,
      selectedField,
      textPlaceMode,
      onPlaceField,
      onPlaceTextBox,
    ],
  );

  const handleZoneMoveStart = useCallback(
    (e: React.MouseEvent, zone: Zone) => {
      e.stopPropagation();
      const coords = getCoords(e, canvasRef);
      onSetMovingZone({
        id: zone.id,
        offsetX: coords.x - zone.x,
        offsetY: coords.y - zone.y,
      });
      onSetMenuOpen(null);
    },
    [onSetMovingZone, onSetMenuOpen],
  );

  const handleZoneResizeStart = useCallback(
    (e: React.MouseEvent, zone: Zone, handle: ResizeHandle) => {
      e.stopPropagation();
      e.preventDefault();
      const coords = getCoords(e, canvasRef);
      onSetResizingZone({
        id: zone.id,
        handle,
        startX: coords.x,
        startY: coords.y,
        startZoneX: zone.x,
        startZoneY: zone.y,
        startWidth: zone.width,
        startHeight: zone.height,
      });
      onSetMenuOpen(null);
    },
    [onSetResizingZone, onSetMenuOpen],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const fieldId = e.dataTransfer.getData("text/plain");
      if (!fieldId || !bgImage || usedFieldIds.has(fieldId)) return;
      const coords = getCoords(e, canvasRef);
      onPlaceField(
        fieldId,
        coords.x - DEFAULT_ZONE_WIDTH / 2,
        coords.y - DEFAULT_ZONE_HEIGHT / 2,
        DEFAULT_ZONE_WIDTH,
        DEFAULT_ZONE_HEIGHT,
      );
    },
    [bgImage, usedFieldIds, onPlaceField],
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const guildId = "101010000111";
    const file = e.target.files?.[0];
    if (!file) return;

    // Show loading state (you'll need to add this state)
    // setIsUploading(true)

    try {
      // First, show preview immediately for better UX
      const reader = new FileReader();
      reader.onload = (e) => onSetBgImage(e.target?.result as string);
      reader.readAsDataURL(file);

      // Upload to API
      const formData = new FormData();
      formData.append("background", file);
      formData.append("guildId", guildId); // You'll need to pass guildId as a prop

      console.log("sending");

      const response = await fetch("/api/background", {
        method: "POST",
        body: formData,
      });

      console.log("sent");

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const data = await response.json();

      // Update with the actual S3 URL
      onSetBgImage(data.file.url);

      // Optionally show success message
      console.log("Image uploaded successfully:", data.file.url);
    } catch (error) {
      console.error("Error uploading image:", error);
      // Show error message to user
      alert("Failed to upload image. Please try again.");
      // Clear the preview
      // onSetBgImage(null)
    } finally {
      // setIsUploading(false)
    }
  };

  // Determine cursor based on current state
  const getCursorClass = () => {
    if (resizingZone) return "";
    if (movingZone) return "cursor-grabbing";
    if (canPlace) return "cursor-crosshair";
    return "";
  };

  return (
    <div className="flex-1 p-6 overflow-auto bg-secondary/30">
      <div className="mb-4">
        <label className="px-4 py-2 rounded-md text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-pointer inline-flex items-center gap-2">
          <Upload className="w-4 h-4" />
          {bgImage ? "Change Image" : "Upload Background"}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        {canPlace && (
          <span className="ml-4 text-sm text-primary">
            {textPlaceMode
              ? "Click on the image to place a text box, or drag to draw a custom size"
              : "Click on the image to place, or drag to draw a custom size"}
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
          if (drawing.active) handleMouseUp();
          if (movingZone) onSetMovingZone(null);
          if (resizingZone) onSetResizingZone(null);
        }}
        onClick={handleCanvasClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative bg-card rounded-lg overflow-hidden shadow-lg ${getCursorClass()} ${
          draggedField && bgImage ? "ring-2 ring-primary ring-dashed" : ""
        }`}
        style={{ width: "80%", aspectRatio: "16/9" }}
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
            globalFontSize={globalFontSize}
            isMoving={movingZone?.id === zone.id}
            isResizing={resizingZone?.id === zone.id}
            menuOpen={menuOpen === zone.id}
            onMoveStart={(e) => handleZoneMoveStart(e, zone)}
            onResizeStart={(e, handle) =>
              handleZoneResizeStart(e, zone, handle)
            }
            onMenuToggle={() =>
              onSetMenuOpen(menuOpen === zone.id ? null : zone.id)
            }
            onUpdateZone={(updates) => onUpdateZone(zone.id, updates)}
            onUpdateOption={(key, value) =>
              onUpdateZoneOption(zone.id, key, value)
            }
            onDelete={() => onDeleteZone(zone.id)}
          />
        ))}

        {/* Drawing preview */}
        {drawing.active && drawing.start && drawing.current && (
          <div
            className="absolute border-2 border-dashed border-primary bg-primary/10 pointer-events-none"
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
  );
}
