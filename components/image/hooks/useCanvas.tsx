"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Canvas, Image, Text } from "fabric";

interface CanvasContextType {
  canvas: Canvas | null;
  initializeCanvas: (canvasElement: HTMLCanvasElement) => void;
  exportImage: () => void;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export function CanvasProvider({ children }: { children: ReactNode }) {
  const [canvas, setCanvas] = useState<Canvas | null>(null);

  const initializeCanvas = useCallback((canvasElement: HTMLCanvasElement) => {
    if (canvas) return; // Already initialized

    const fabricCanvas = new Canvas(canvasElement, {
      width: 1280,
      height: 720,
      backgroundColor: "#f0f0f0",
      selection: true,
    });

    setCanvas(fabricCanvas);

    // Add background image
    Image.fromURL("template_test.png")
      .then((backgroundImg) => {
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
        const instructionText = new Text(
          'Design Mode: Create custom polygons for your schedule data\nSchedule Mode: Fill out forms to generate weekly schedules',
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
  }, [canvas]);

  const exportImage = useCallback(() => {
    if (!canvas) return;
    
    // Hide selection indicators
    canvas.discardActiveObject();
    canvas.renderAll();
    
    // Export as image
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2,
    });
    
    // Create download link
    const link = document.createElement('a');
    link.download = `schedule-${new Date().toISOString().split('T')[0]}.png`;
    link.href = dataURL;
    link.click();
  }, [canvas]);

  return (
    <CanvasContext.Provider value={{
      canvas,
      initializeCanvas,
      exportImage
    }}>
      {children}
    </CanvasContext.Provider>
  );
}

export function useCanvas() {
  const context = useContext(CanvasContext);
  if (context === undefined) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
}