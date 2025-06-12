"use client";

import { useCallback, useState } from "react";
import { useCanvas } from "./useCanvas";
import { TypedPolygon } from "../types";
import {
  saveTemplate as saveTemplateAction,
  loadTemplate as loadTemplateAction,
  deleteTemplate as deleteTemplateAction,
  getTemplateInfo as getTemplateInfoAction,
  type SaveTemplateResult,
  type LoadTemplateResult,
} from "@/app/actions/template-actions";
import { fabric } from "fabric";

interface SaveTemplateData {
  guildId: string;
  templateName: string;
  backgroundUrl?: string;
}

export function useTemplateSave() {
  const { canvas } = useCanvas();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Extract polygon data from canvas
  const extractPolygonData = useCallback((): TypedPolygon[] => {
    if (!canvas) return [];

    const polygons: TypedPolygon[] = [];

    canvas.getObjects().forEach((obj) => {
      // Only extract polygon objects with our custom properties
      if ((obj as any).polygonType && (obj as any).points) {
        const typedObj = obj as any;

        polygons.push({
          id: typedObj.id || crypto.randomUUID(),
          points: typedObj.points || [],
          type: typedObj.polygonType,
          left: obj.left || 0,
          top: obj.top || 0,
          // Include additional Fabric.js properties for reconstruction
          fill: obj.fill as string,
          stroke: obj.stroke as string,
          strokeWidth: obj.strokeWidth,
          scaleX: obj.scaleX,
          scaleY: obj.scaleY,
          angle: obj.angle,
          opacity: obj.opacity,
        });
      }
    });

    return polygons;
  }, [canvas]);

  // Extract background image as base64
  const extractBackgroundImage = useCallback((): string | null => {
    if (!canvas) return null;

    // Find the background image object
    const backgroundObj = canvas
      .getObjects()
      .find(
        (obj) =>
          (obj as any).excludeFromExport === false && obj.selectable === false
      );

    if (backgroundObj && backgroundObj.type === "image") {
      try {
        // Create a temporary canvas with just the background
        const tempCanvas = new fabric.Canvas(null, {
          width: canvas.width,
          height: canvas.height,
        });

        // Clone and add the background object
        const clonedObj = fabric.util.object.clone(backgroundObj);
        tempCanvas.add(clonedObj);

        const dataURL = tempCanvas.toDataURL({
          format: "png",
          quality: 0.8,
        });

        tempCanvas.dispose();
        return dataURL;
      } catch (error) {
        console.error("Error extracting background image:", error);
        return null;
      }
    }

    return null;
  }, [canvas]);

  // Save template using server action
  const saveTemplate = useCallback(
    async (data: SaveTemplateData): Promise<SaveTemplateResult> => {
      if (!canvas) {
        return { success: false, error: "Canvas not initialized" };
      }

      setIsSaving(true);

      try {
        const polygons = extractPolygonData();
        const backgroundImage = extractBackgroundImage();

        const templateData = {
          polygons,
          canvasWidth: canvas.width || 1280,
          canvasHeight: canvas.height || 720,
          backgroundImage,
          version: "1.0",
          createdAt: new Date().toISOString(),
        };

        const payload = {
          guildId: data.guildId,
          templateName: data.templateName,
          templateData,
          backgroundUrl: data.backgroundUrl,
        };

        const result = await saveTemplateAction(payload);
        return result;
      } catch (error) {
        console.error("Error saving template:", error);
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        };
      } finally {
        setIsSaving(false);
      }
    },
    [canvas, extractPolygonData, extractBackgroundImage]
  );

  // Load template using server action
  const loadTemplate = useCallback(
    async (guildId: string): Promise<LoadTemplateResult> => {
      setIsLoading(true);

      try {
        const result = await loadTemplateAction({ guildId });
        return result;
      } catch (error) {
        console.error("Error loading template:", error);
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Delete template using server action
  const deleteTemplate = useCallback(async (guildId: string) => {
    setIsDeleting(true);

    try {
      const result = await deleteTemplateAction({ guildId });
      return result;
    } catch (error) {
      console.error("Error deleting template:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    } finally {
      setIsDeleting(false);
    }
  }, []);

  // Get template info (check if exists, name, last updated)
  const getTemplateInfo = useCallback(async (guildId: string) => {
    try {
      const result = await getTemplateInfoAction({ guildId });
      return result;
    } catch (error) {
      console.error("Error getting template info:", error);
      return {
        success: false,
        exists: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }, []);

  // Apply loaded template to canvas
  const applyTemplateToCanvas = useCallback(
    async (templateData: any) => {
      if (!canvas || !templateData.template_data) return false;

      try {
        canvas.clear();

        const data = templateData.template_data;

        // Set canvas dimensions if specified
        if (data.canvasWidth && data.canvasHeight) {
          canvas.setDimensions({
            width: data.canvasWidth,
            height: data.canvasHeight,
          });
        }

        // Load background image if present
        if (data.backgroundImage) {
          try {
            const imgObj = await fabric.Image.fromURL(data.backgroundImage);
            imgObj.set({
              left: 0,
              top: 0,
              selectable: false,
              evented: false,
              excludeFromExport: false,
            });

            // Scale to fit canvas if needed
            const scaleX = canvas.width! / imgObj.width!;
            const scaleY = canvas.height! / imgObj.height!;
            const scale = Math.min(scaleX, scaleY);

            imgObj.scale(scale);
            canvas.add(imgObj);
            canvas.sendObjectToBack(imgObj);
          } catch (imgError) {
            console.error("Error loading background image:", imgError);
            // Continue without background image
          }
        }

        // Recreate polygons
        if (data.polygons && Array.isArray(data.polygons)) {
          for (const polygonData of data.polygons) {
            try {
              const polygon = new fabric.Polygon(polygonData.points, {
                left: polygonData.left,
                top: polygonData.top,
                fill: polygonData.fill || "rgba(255, 0, 0, 0.3)",
                stroke: polygonData.stroke || "#ff0000",
                strokeWidth: polygonData.strokeWidth || 2,
                scaleX: polygonData.scaleX || 1,
                scaleY: polygonData.scaleY || 1,
                angle: polygonData.angle || 0,
                opacity: polygonData.opacity || 1,
                selectable: true,
                evented: true,
              });

              // Add custom properties
              (polygon as any).polygonType = polygonData.type;
              (polygon as any).points = polygonData.points;
              (polygon as any).id = polygonData.id;

              canvas.add(polygon);
            } catch (polygonError) {
              console.error("Error creating polygon:", polygonError);
              // Continue with next polygon
            }
          }
        }

        canvas.renderAll();
        return true;
      } catch (error) {
        console.error("Error applying template to canvas:", error);
        return false;
      }
    },
    [canvas]
  );

  return {
    saveTemplate,
    loadTemplate,
    deleteTemplate,
    getTemplateInfo,
    applyTemplateToCanvas,
    extractPolygonData,
    isSaving,
    isLoading,
    isDeleting,
  };
}
