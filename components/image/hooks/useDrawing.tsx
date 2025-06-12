"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import { Canvas, Polygon, Circle, Group, Text } from "fabric";
import { Point, getTypeColor } from "../types";
import { useCanvas } from "./useCanvas";

interface DrawingContextType {
  isDrawingMode: boolean;
  currentDataType: string;
  drawingPoints: Point[];
  customDataTypes: string[];
  selectedPolygon: Group | null;
  setCurrentDataType: (type: string) => void;
  toggleDrawingMode: () => void;
  finishPolygon: () => void;
  cancelPolygon: () => void;
  addCustomDataType: (typeName: string) => void;
  deleteSelected: () => void;
}

const DrawingContext = createContext<DrawingContextType | undefined>(undefined);

export function DrawingProvider({ children }: { children: ReactNode }) {
  const { canvas } = useCanvas();

  const [isDrawingMode, setIsDrawingMode] = useState(false);
  // Updated default to use offset-based naming
  const [currentDataType, setCurrentDataType] = useState("day0_stream_name");
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([]);
  const [tempPoints, setTempPoints] = useState<Circle[]>([]);
  const [customDataTypes, setCustomDataTypes] = useState<string[]>([]);
  const [selectedPolygon, setSelectedPolygon] = useState<Group | null>(null);

  // Handle canvas interactions
  useEffect(() => {
    if (!canvas) return;

    const handleCanvasClick = (e: any) => {
      if (!isDrawingMode) return;

      const pointer = canvas.getPointer(e.e);
      const newPoint: Point = { x: pointer.x, y: pointer.y };

      // Create visual indicator
      const pointCircle = new Circle({
        left: pointer.x - 4,
        top: pointer.y - 4,
        radius: 4,
        fill: getTypeColor(currentDataType),
        stroke: "#fff",
        strokeWidth: 2,
        selectable: false,
        evented: false,
      });

      canvas.add(pointCircle);
      setTempPoints((prev) => [...prev, pointCircle]);
      setDrawingPoints((prev) => [...prev, newPoint]);
      canvas.renderAll();
    };

    const handleObjectSelection = (e: any) => {
      if (!isDrawingMode && e.selected) {
        const obj = e.selected[0];
        if ((obj as any).polygonType) {
          setSelectedPolygon(obj as Group);
        }
      }
    };

    if (isDrawingMode) {
      canvas.on("mouse:down", handleCanvasClick);
      canvas.selection = false;
      canvas.forEachObject((obj) => {
        obj.selectable = false;
        obj.evented = false;
      });
    } else {
      canvas.off("mouse:down", handleCanvasClick);
      canvas.selection = true;
      canvas.forEachObject((obj, index) => {
        // Keep background non-selectable
        if (index === 0) {
          obj.selectable = false;
          obj.evented = false;
        } else {
          obj.selectable = true;
          obj.evented = true;
        }
      });
    }

    canvas.on("selection:created", handleObjectSelection);
    canvas.on("selection:updated", handleObjectSelection);
    canvas.on("selection:cleared", () => setSelectedPolygon(null));

    canvas.renderAll();

    return () => {
      canvas.off("mouse:down", handleCanvasClick);
      canvas.off("selection:created", handleObjectSelection);
      canvas.off("selection:updated", handleObjectSelection);
      canvas.off("selection:cleared");
    };
  }, [isDrawingMode, canvas, currentDataType]);

  const toggleDrawingMode = useCallback(() => {
    if (isDrawingMode) {
      cancelPolygon();
    }
    setIsDrawingMode(!isDrawingMode);
  }, [isDrawingMode]);

  const finishPolygon = useCallback(() => {
    if (!canvas || drawingPoints.length < 3) {
      alert("You need at least 3 points to create a polygon!");
      return;
    }

    // Calculate bounding box
    const minX = Math.min(...drawingPoints.map((point) => point.x));
    const minY = Math.min(...drawingPoints.map((point) => point.y));

    // Create relative points for the polygon
    const relativePoints = drawingPoints.map((point) => ({
      x: point.x - minX,
      y: point.y - minY,
    }));

    // Create the polygon
    const polygon = new Polygon(relativePoints, {
      left: minX,
      top: minY,
      fill: getTypeColor(currentDataType),
      stroke: getTypeColor(currentDataType),
      strokeWidth: 2,
      cornerStyle: "circle",
      cornerColor: getTypeColor(currentDataType),
      cornerSize: 8,
      transparentCorners: false,
    });

    // Create text object with better default styling
    // const textObj = new Text(`[${currentDataType}]`, {
    //   left: 0,
    //   top: 0,
    //   fontFamily: "Arial",
    //   fontSize: 14,
    //   fill: "#fff",
    //   stroke: "#000",
    //   strokeWidth: 1,
    //   textAlign: "center",
    //   originX: "center",
    //   originY: "center",
    // });

    // Group polygon and text
    const group = new Group([polygon], {
      left: minX,
      top: minY,
    });

    // Store metadata
    const polygonId = crypto.randomUUID();
    (group as any).polygonType = currentDataType;
    (group as any).polygonId = polygonId;

    canvas.add(group);
    canvas.renderAll();

    // Clean up
    cleanupDrawing();
    setIsDrawingMode(false);
  }, [canvas, drawingPoints, currentDataType]);

  const cancelPolygon = useCallback(() => {
    cleanupDrawing();
  }, []);

  const cleanupDrawing = useCallback(() => {
    if (!canvas) return;

    tempPoints.forEach((point) => canvas.remove(point));
    setTempPoints([]);
    setDrawingPoints([]);
    canvas.renderAll();
  }, [canvas, tempPoints]);

  const deleteSelected = useCallback(() => {
    if (!canvas || !selectedPolygon) return;

    canvas.remove(selectedPolygon);
    setSelectedPolygon(null);
    canvas.renderAll();
  }, [canvas, selectedPolygon]);

  const addCustomDataType = useCallback(
    (typeName: string) => {
      if (typeName && !customDataTypes.includes(typeName)) {
        setCustomDataTypes((prev) => [...prev, typeName]);
        // Automatically select the newly added custom type
        setCurrentDataType(typeName);
      }
    },
    [customDataTypes]
  );

  return (
    <DrawingContext.Provider
      value={{
        isDrawingMode,
        currentDataType,
        drawingPoints,
        customDataTypes,
        selectedPolygon,
        setCurrentDataType,
        toggleDrawingMode,
        finishPolygon,
        cancelPolygon,
        addCustomDataType,
        deleteSelected,
      }}
    >
      {children}
    </DrawingContext.Provider>
  );
}

export function useDrawing() {
  const context = useContext(DrawingContext);
  if (context === undefined) {
    throw new Error("useDrawing must be used within a DrawingProvider");
  }
  return context;
}
