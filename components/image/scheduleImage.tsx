"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, Image, Text, Polygon, Circle } from "fabric";
import { Button } from "../ui/button";
import { FILL_COLORS, POINT_TYPES, TYPE_COLORS, TypedPoint } from "./types";

export default function ScheduleImage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [isPolygonMode, setIsPolygonMode] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState<TypedPoint[]>([]);
  const [selectedPointType, setSelectedPointType] =
    useState<string>("stream name");
  const [tempPoints, setTempPoints] = useState<Circle[]>([]);

  const savePoints = () => {
    console.log("saving");
    const pointsData = {
      points: polygonPoints,
      timestamp: new Date().toISOString(),
    };
    console.log(pointsData);
    localStorage.setItem("erinet-schedule-points", JSON.stringify(pointsData));
  };

  const loadPoints = () => {
    const saved = localStorage.getItem("erinet-schedule-points");
    if (saved) {
      const data = JSON.parse(saved);
      console.log(data);
      setPolygonPoints(data.points);
      recreateVisualPoints(data.points);
      console.log("Loaded");
    }
  };

  const recreateVisualPoints = (points: TypedPoint[]) => {
    if (!canvas) return;

    // Clear any existing temporary points first
    tempPoints.forEach((point) => canvas.remove(point));
    setTempPoints([]);

    // Create new visual indicators for each loaded point
    const newTempPoints: Circle[] = [];

    points.forEach((point) => {
      const pointCircle = new Circle({
        left: point.x - 3,
        top: point.y - 3,
        radius: 3,
        fill: TYPE_COLORS[point.type] || "#ff0000",
        selectable: false,
        evented: false,
      });

      canvas.add(pointCircle);
      newTempPoints.push(pointCircle);
    });

    setTempPoints(newTempPoints);
    canvas.renderAll();
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
      const newPoint: TypedPoint = {
        x: pointer.x,
        y: pointer.y,
        type: selectedPointType,
        id: crypto.randomUUID(), // or use a counter
      };

      // Create visual indicator with type-specific color
      const pointCircle = new Circle({
        left: pointer.x - 3,
        top: pointer.y - 3,
        radius: 3,
        fill: TYPE_COLORS[selectedPointType] || "#ff0000",
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
  }, [isPolygonMode, canvas]);

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

    // Create the polygon
    const polygon = new Polygon(relativePoints, {
      left: minX,
      top: minY,
      fill: FILL_COLORS[selectedPointType],
      stroke: TYPE_COLORS[selectedPointType],
      strokeWidth: 2,
      cornerStyle: "circle",
      cornerColor: TYPE_COLORS[selectedPointType],
      cornerSize: 8,
      transparentCorners: false,
    });

    canvas.add(polygon);
    console.log("polygon added to canvas");

    // Clean up temporary points
    tempPoints.forEach((point) => canvas.remove(point));

    // Reset state
    setPolygonPoints([]);
    setTempPoints([]);
    setIsPolygonMode(false);
    canvas.renderAll();
    console.log("polygon creation completed");
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

  const clearCanvas = () => {
    if (!canvas) return;

    const objects = canvas.getObjects();
    // Keep background image (first object) and instruction text (second object)
    // Remove everything else
    const objectsToKeep = objects.slice(0, 2);
    const objectsToRemove = objects.slice(2);

    canvas.remove(...objectsToRemove);

    // Reset polygon state
    setPolygonPoints([]);
    setTempPoints([]);
    setIsPolygonMode(false);

    canvas.renderAll();
  };

  const deleteSelected = () => {
    if (!canvas || isPolygonMode) return;

    const activeObject = canvas.getActiveObject();
    const objects = canvas.getObjects();

    // Don't allow deletion of background image (index 0) or instruction text (index 1)
    if (activeObject && objects.indexOf(activeObject) > 1) {
      canvas.remove(activeObject);
      canvas.renderAll();
    }
  };

  const bringToFront = () => {
    if (!canvas || isPolygonMode) return;

    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.bringObjectToFront(activeObject);
      canvas.renderAll();
    }
  };

  const sendToBack = () => {
    if (!canvas || isPolygonMode) return;

    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.sendObjectToBack(activeObject);
      canvas.renderAll();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Interactive Canvas with Polygon Creation
        </h1>

        {/* Controls */}
        <div className="mb-6 flex flex-wrap gap-4 justify-center">
          {/* Polygon Controls */}
          <div className="flex gap-2 border-r-2 pr-4">
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
                  <label className="font-semibold">Point Type:</label>
                  <select
                    value={selectedPointType}
                    onChange={(e) => setSelectedPointType(e.target.value)}
                    className="px-2 py-1 border rounded"
                  >
                    {POINT_TYPES.map((type) => (
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
                  : "bg-purple-500 text-white hover:bg-purple-600"
              }`}
            >
              Bring to Front
            </button>

            <button
              onClick={sendToBack}
              disabled={isPolygonMode}
              className={`px-4 py-2 rounded transition-colors ${
                isPolygonMode
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-purple-500 text-white hover:bg-purple-600"
              }`}
            >
              Send to Back
            </button>

            <button
              onClick={savePoints}
              className={`px-4 py-2 rounded transition-colors bg-purple-500 text-white hover:bg-purple-600`}
            >
              Save
            </button>

            <button
              onClick={loadPoints}
              className={`px-4 py-2 rounded transition-colors bg-purple-500 text-white hover:bg-purple-600`}
            >
              Load
            </button>

            <button
              onClick={clearCanvas}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Clear Canvas
            </button>
          </div>
        </div>

        {/* Canvas Container */}
        <div className="flex justify-center">
          <div className="border-2 border-gray-300 rounded-lg shadow-lg">
            <canvas ref={canvasRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
