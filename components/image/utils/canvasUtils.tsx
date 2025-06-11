"use client";

import { Canvas, Group, Text } from "fabric";
import { Point } from "../types";

export const getPolygonBounds = (points: Point[]): { minX: number; minY: number; maxX: number; maxY: number } => {
  const minX = Math.min(...points.map(point => point.x));
  const minY = Math.min(...points.map(point => point.y));
  const maxX = Math.max(...points.map(point => point.x));
  const maxY = Math.max(...points.map(point => point.y));
  
  return { minX, minY, maxX, maxY };
};

export const createRelativePoints = (points: Point[], bounds: { minX: number; minY: number }): Point[] => {
  return points.map(point => ({
    x: point.x - bounds.minX,
    y: point.y - bounds.minY,
  }));
};

export const updateCanvasObjectText = (canvas: Canvas, dataType: string, value: string): void => {
  canvas.getObjects().forEach(obj => {
    if ((obj as any).polygonType === dataType) {
      const group = obj as Group;
      const textObj = group.getObjects().find(o => o.type === 'text') as Text;
      if (textObj) {
        let displayValue = value;
        
        // Format based on data type
        if (dataType === 'datetime' && value) {
          const date = new Date(value);
          displayValue = date.toLocaleDateString() + ' ' + 
                        date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        }
        
        textObj.set('text', displayValue || `[${dataType}]`);
      }
    }
  });
  
  canvas.renderAll();
};

export const exportCanvasAsImage = (canvas: Canvas, filename?: string): void => {
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
  link.download = filename || `schedule-${new Date().toISOString().split('T')[0]}.png`;
  link.href = dataURL;
  link.click();
};