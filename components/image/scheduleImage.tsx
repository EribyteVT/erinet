"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, Image, Text, Polygon, Circle } from "fabric";
import { Button } from "../ui/button";
import {
  FILL_COLORS,
  POLYGON_TYPES,
  TYPE_COLORS,
  Point,
  TypedPolygon,
  getTypeColor,
} from "./types";

export default function ScheduleImage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [isPolygonMode, setIsPolygonMode] = useState(false);

  // Changed from TypedPoint[] to Point[] since types are now on polygons
  const [polygonPoints, setPolygonPoints] = useState<Point[]>([]);
  const [selectedPolygonType, setSelectedPolygonType] =
    useState<string>("stream name");
  const [tempPoints, setTempPoints] = useState<Circle[]>([]);

  // New state for saving typed polygons
  const [savedPolygons, setSavedPolygons] = useState<TypedPolygon[]>([]);

  const savePolygons = () => {
    if (!canvas) return;

    console.log("saving polygons");

    // Get all polygon objects from canvas and convert to TypedPolygon format
    const polygonObjects = canvas
      .getObjects()
      .filter((obj) => obj.type === "polygon") as Polygon[];

    const polygonsToSave: TypedPolygon[] = polygonObjects.map((polygon) => {
      // Get the custom type property we'll set on the polygon
      const polygonType = (polygon as any).polygonType || "stream name";

      return {
        id: (polygon as any).polygonId || crypto.randomUUID(),
        points: (polygon as any).points.map((point: any) => ({
          x: point.x,
          y: point.y,
        })),
        type: polygonType,
        left: polygon.left || 0,
        top: polygon.top || 0,
      };
    });

    const polygonData = {
      polygons: polygonsToSave,
      timestamp: new Date().toISOString(),
    };

    console.log("Saving polygon data:", polygonData);
    localStorage.setItem(
      "erinet-schedule-polygons",
      JSON.stringify(polygonData)
    );
    setSavedPolygons(polygonsToSave);
  };

  const loadPolygons = () => {
    const saved = localStorage.getItem("erinet-schedule-polygons");
    if (saved) {
      const data = JSON.parse(saved);
      console.log("Loading polygon data:", data);
      setSavedPolygons(data.polygons);
      recreatePolygons(data.polygons);
      console.log("Polygons loaded");
    }
  };

  const recreatePolygons = (polygons: TypedPolygon[]) => {
    if (!canvas) return;

    // Remove any existing polygons (but keep background and other objects)
    const objectsToRemove = canvas
      .getObjects()
      .filter((obj) => obj.type === "polygon" && (obj as any).polygonId);
    objectsToRemove.forEach((obj) => canvas.remove(obj));

    // Recreate polygons from saved data
    polygons.forEach((polygonData) => {
      const polygon = new Polygon(polygonData.points, {
        left: polygonData.left,
        top: polygonData.top,
        fill: getTypeColor(polygonData.type) + "55",
        stroke: getTypeColor(polygonData.type),
        strokeWidth: 2,
        cornerStyle: "circle",
        cornerColor: getTypeColor(polygonData.type),
        cornerSize: 8,
        transparentCorners: false,
      });

      // Store type and id on the polygon object for later retrieval
      (polygon as any).polygonType = polygonData.type;
      (polygon as any).polygonId = polygonData.id;

      canvas.add(polygon);
    });

    canvas.renderAll();
  };

  const cancelPolygon = () => {
    if (!canvas) return;

    // Remove temporary points
    tempPoints.forEach((point) => canvas.remove(point));

    // Reset state
    setPolygonPoints([]);
    setTempPoints([]);
    canvas.renderAll();
  };

  const deleteSelected = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
      canvas.renderAll();
    }
  };

  const bringToFront = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.bringObjectToFront(activeObject);
      canvas.renderAll();
    }
  };

  // Initialize canvas only once
  useEffect(() => {
    if (canvasRef.current && !canvas) {
      const fabricCanvas = new Canvas(canvasRef.current, {
        width: 1280,
        height: 720,
        backgroundColor: "#f0f0f0",
        selection: true,
      });

      setCanvas(fabricCanvas);

      // Add background image first
      Image.fromURL("template_test.png")
        .then((backgroundImg) => {
          // Scale the background image to fit the canvas
          backgroundImg.scaleToWidth(fabricCanvas.width!);
          backgroundImg.scaleToHeight(fabricCanvas.height!);

          backgroundImg.set({
            left: 0,
            top: 0,
            selectable: false,
            evented: false,
            excludeFromExport: false,
          });

          fabricCanvas.add(backgroundImg);
          fabricCanvas.sendObjectToBack(backgroundImg);
          fabricCanvas.renderAll();
        })
        .catch((error) => {
          console.error("Error loading background image:", error);

          // If background image fails to load, just add the instruction text
          const instructionText = new Text(
            'Click "Add Image" to add images or "Polygon Mode" to draw polygons.\nDrag images to move them around!',
            {
              left: 50,
              top: 50,
              fontFamily: "Arial",
              fontSize: 16,
              fill: "#666",
              selectable: false,
            }
          );
          fabricCanvas.add(instructionText);
          fabricCanvas.renderAll();
        });

      return () => {
        fabricCanvas.dispose();
      };
    }
  }, []); // Empty dependency array - only run once

  // Handle polygon mode changes and canvas click events
  useEffect(() => {
    if (!canvas) return;

    const handleCanvasClick = (e: any) => {
      if (!isPolygonMode) return;

      const pointer = canvas.getPointer(e.e);
      const newPoint: Point = {
        x: pointer.x,
        y: pointer.y,
      };

      // Create visual indicator with type-specific color
      const pointCircle = new Circle({
        left: pointer.x - 3,
        top: pointer.y - 3,
        radius: 3,
        fill: getTypeColor(selectedPolygonType),
        selectable: false,
        evented: false,
      });

      canvas.add(pointCircle);
      setTempPoints((prev) => [...prev, pointCircle]);
      setPolygonPoints((prev) => [...prev, newPoint]);
      canvas.renderAll();
    };

    // Add or remove event listener based on polygon mode
    if (isPolygonMode) {
      canvas.on("mouse:down", handleCanvasClick);
    } else {
      canvas.off("mouse:down", handleCanvasClick);
    }

    // Update canvas selection behavior
    canvas.selection = !isPolygonMode;
    canvas.forEachObject((obj, index) => {
      // Keep background image (index 0) and instruction text (index 1) always non-selectable
      if (index === 0 || index === 1) {
        obj.selectable = false;
        obj.evented = false;
      } else {
        // For all other objects, toggle based on polygon mode
        obj.selectable = !isPolygonMode;
        obj.evented = !isPolygonMode;
      }
    });
    canvas.renderAll();

    // Cleanup function
    return () => {
      canvas.off("mouse:down", handleCanvasClick);
    };
  }, [isPolygonMode, canvas, selectedPolygonType]);

  const addImageToCanvas = (imageUrl: string) => {
    if (!canvas || isPolygonMode) return;

    Image.fromURL(imageUrl).then((img) => {
      // Scale the image to fit nicely on canvas
      img.scaleToWidth(150);

      // Position the image randomly
      img.set({
        left: Math.random() * (canvas.width! - 150),
        top: Math.random() * (canvas.height! - 150) + 100,
        cornerStyle: "circle",
        cornerColor: "#4285f4",
        cornerSize: 10,
        transparentCorners: false,
      });

      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    });
  };

  const addImageFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !canvas || isPolygonMode) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      addImageToCanvas(imageUrl);
    };
    reader.readAsDataURL(file);
  };

  const togglePolygonMode = () => {
    if (isPolygonMode) {
      // Exit polygon mode - cancel current polygon
      cancelPolygon();
    }
    setIsPolygonMode(!isPolygonMode);
  };

  const finishPolygon = () => {
    if (!canvas || polygonPoints.length < 3) {
      console.log("not enough points or no canvas");
      alert("You need at least 3 points to create a polygon!");
      return;
    }

    // Calculate the bounding box of the polygon points
    const minX = Math.min(...polygonPoints.map((point) => point.x));
    const minY = Math.min(...polygonPoints.map((point) => point.y));

    // Adjust points to be relative to the polygon's position
    const relativePoints = polygonPoints.map((point) => ({
      x: point.x - minX,
      y: point.y - minY,
    }));

    // Create the polygon with the selected type
    const polygon = new Polygon(relativePoints, {
      left: minX,
      top: minY,
      fill: getTypeColor(selectedPolygonType) + "55",
      stroke: getTypeColor(selectedPolygonType),
      strokeWidth: 2,
      cornerStyle: "circle",
      cornerColor: getTypeColor(selectedPolygonType),
      cornerSize: 8,
      transparentCorners: false,
    });

    // Store type and id on the polygon object
    const polygonId = crypto.randomUUID();
    (polygon as any).polygonType = selectedPolygonType;
    (polygon as any).polygonId = polygonId;

    canvas.add(polygon);
    console.log(`polygon added to canvas with type: ${selectedPolygonType}`);

    // Clean up temporary points
    tempPoints.forEach((point) => canvas.remove(point));

    // Reset state
    setPolygonPoints([]);
    setTempPoints([]);
    setIsPolygonMode(false);
    canvas.renderAll();
    console.log("polygon creation completed");
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-4">
      <div className="flex flex-wrap gap-4 mb-4">
        {/* Polygon Mode Controls */}
        <div className="flex flex-col gap-2">
          <button
            onClick={togglePolygonMode}
            className={`px-4 py-2 rounded transition-colors ${
              isPolygonMode
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-indigo-500 text-white hover:bg-indigo-600"
            }`}
          >
            {isPolygonMode ? "Exit Polygon Mode" : "Polygon Mode"}
          </button>

          {isPolygonMode && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
              <div className="flex items-center gap-4 mb-2">
                <Button
                  onClick={finishPolygon}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  disabled={polygonPoints.length < 3}
                >
                  Finish Polygon ({polygonPoints.length} points)
                </Button>
                <Button
                  onClick={cancelPolygon}
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                >
                  Cancel
                </Button>
                <label className="font-semibold">Polygon Type:</label>
                <select
                  value={selectedPolygonType}
                  onChange={(e) => setSelectedPolygonType(e.target.value)}
                  className="px-2 py-1 border rounded"
                >
                  {POLYGON_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Other Controls */}
        <div className="flex gap-2">
          <label
            className={`px-4 py-2 rounded transition-colors cursor-pointer ${
              isPolygonMode
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-500 text-white hover:bg-green-600"
            }`}
          >
            Upload Image
            <input
              type="file"
              accept="image/*"
              onChange={addImageFromFile}
              className="hidden"
              disabled={isPolygonMode}
            />
          </label>

          <button
            onClick={deleteSelected}
            disabled={isPolygonMode}
            className={`px-4 py-2 rounded transition-colors ${
              isPolygonMode
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-red-500 text-white hover:bg-red-600"
            }`}
          >
            Delete Selected
          </button>

          <button
            onClick={bringToFront}
            disabled={isPolygonMode}
            className={`px-4 py-2 rounded transition-colors ${
              isPolygonMode
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Bring to Front
          </button>
        </div>

        {/* Save/Load Controls */}
        <div className="flex gap-2">
          <button
            onClick={savePolygons}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
          >
            Save Polygons
          </button>
          <button
            onClick={loadPolygons}
            className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors"
          >
            Load Polygons
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <canvas ref={canvasRef} />
      </div>

      {/* Debug Info */}
      {savedPolygons.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded">
          <h3 className="font-semibold mb-2">
            Saved Polygons ({savedPolygons.length}):
          </h3>
          <div className="space-y-1">
            {savedPolygons.map((polygon, index) => (
              <div key={polygon.id} className="text-sm">
                {index + 1}. Type:{" "}
                <span className="font-medium">{polygon.type}</span> | Points:{" "}
                {polygon.points.length} | Position: ({Math.round(polygon.left)},{" "}
                {Math.round(polygon.top)})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
