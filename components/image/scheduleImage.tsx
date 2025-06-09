"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, Image, Text, Polygon, Circle } from "fabric";
import { Button } from "../ui/button";

export default function ScheduleImage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [isPolygonMode, setIsPolygonMode] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState<
    { x: number; y: number }[]
  >([]);
  const [tempPoints, setTempPoints] = useState<Circle[]>([]);

  // Sample image URLs (you can replace these with your own images)
  const sampleImages = [
    "https://picsum.photos/200/150?random=1",
    "https://picsum.photos/200/150?random=2",
    "https://picsum.photos/200/150?random=3",
    "https://picsum.photos/200/150?random=4",
  ];

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
      const newPoint = { x: pointer.x, y: pointer.y };

      // Add visual point indicator
      const pointCircle = new Circle({
        left: pointer.x - 3,
        top: pointer.y - 3,
        radius: 3,
        fill: "#ff0000",
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
    console.log("finish polygon called");
    console.log("canvas:", !!canvas);
    console.log("polygonPoints length:", polygonPoints.length);
    console.log("polygonPoints:", polygonPoints);
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
      fill: "rgba(0, 150, 255, 0.3)",
      stroke: "#0096ff",
      strokeWidth: 2,
      cornerStyle: "circle",
      cornerColor: "#4285f4",
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
              <>
                <Button
                  onClick={finishPolygon}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  disabled={polygonPoints.length < 3}
                >
                  Finish Polygon ({polygonPoints.length} points)
                </Button>

                <button
                  onClick={cancelPolygon}
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
          </div>

          {/* Image Controls */}
          <div className="flex gap-2">
            {sampleImages.map((url, index) => (
              <button
                key={index}
                onClick={() => addImageToCanvas(url)}
                disabled={isPolygonMode}
                className={`px-4 py-2 rounded transition-colors ${
                  isPolygonMode
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                Add Image {index + 1}
              </button>
            ))}
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

        {/* Instructions */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">How to Use:</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Image Controls:</h3>
              <ul className="space-y-2 text-gray-700">
                <li>
                  • <strong>Add Images:</strong> Click "Add Image" buttons or
                  upload your own
                </li>
                <li>
                  • <strong>Move Images:</strong> Click and drag any image to
                  move it
                </li>
                <li>
                  • <strong>Resize Images:</strong> Drag corner handles to
                  resize
                </li>
                <li>
                  • <strong>Rotate Images:</strong> Drag the rotation handle
                  above selection
                </li>
                <li>
                  • <strong>Layer Control:</strong> Use "Bring to Front" and
                  "Send to Back"
                </li>
                <li>
                  • <strong>Delete:</strong> Select an image and click "Delete
                  Selected"
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Polygon Creation:</h3>
              <ul className="space-y-2 text-gray-700">
                <li>
                  • <strong>Enter Polygon Mode:</strong> Click "Polygon Mode"
                  button
                </li>
                <li>
                  • <strong>Add Points:</strong> Click anywhere on the canvas to
                  add points
                </li>
                <li>
                  • <strong>Visual Feedback:</strong> Red dots show where you've
                  clicked
                </li>
                <li>
                  • <strong>Finish Polygon:</strong> Click "Finish Polygon"
                  (minimum 3 points)
                </li>
                <li>
                  • <strong>Cancel:</strong> Click "Cancel" to discard current
                  polygon
                </li>
                <li>
                  • <strong>Exit Mode:</strong> Click "Exit Polygon Mode" when
                  done
                </li>
              </ul>
            </div>
          </div>

          {isPolygonMode && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-blue-800 font-semibold">
                🔵 Polygon Mode Active - Click on the canvas to add points!
              </p>
              <p className="text-blue-600 text-sm mt-1">
                Current points: {polygonPoints.length} | Minimum needed: 3
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
