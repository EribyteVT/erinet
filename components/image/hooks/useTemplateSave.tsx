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
import * as fabric from "fabric"; // Changed import for Fabric 6.x

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
      // Check for both polygonType and polygonId (as used in PolygonsList)
      const polygonType = (obj as any).polygonType;
      const polygonId = (obj as any).polygonId;

      if (polygonType && polygonId && obj.type === "group") {
        const group = obj as any;

        // Get the actual polygon from the group to extract points
        const polygonObj = group
          .getObjects()
          .find((o: any) => o.type === "polygon");

        const points = polygonObj?.points || [];

        polygons.push({
          id: polygonId,
          points: points,
          type: polygonType,
          left: obj.left || 0,
          top: obj.top || 0,
          // Include additional Fabric.js properties with fallbacks for null values
          fill: "rgba(255, 0, 0, 0.3)",
          stroke: "#ff0000",
          strokeWidth: obj.strokeWidth || 2,
          scaleX: obj.scaleX || 1,
          scaleY: obj.scaleY || 1,
          angle: obj.angle || 0,
          opacity: obj.opacity || 1,
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
        // Get the image element from the fabric image object
        const imageElement =
          (backgroundObj as any)._element ||
          (backgroundObj as any).getElement();

        if (imageElement) {
          // Create a temporary canvas to convert image to base64
          const tempCanvas = document.createElement("canvas");
          const ctx = tempCanvas.getContext("2d");

          tempCanvas.width = imageElement.width || imageElement.naturalWidth;
          tempCanvas.height = imageElement.height || imageElement.naturalHeight;

          if (ctx) {
            ctx.drawImage(imageElement, 0, 0);
            return tempCanvas.toDataURL("image/png", 0.8);
          }
        }
      } catch (error) {
        console.error("Error extracting background image:", error);
        return null;
      }
    }

    return null;
  }, [canvas]);

  // Save template using server action
  const saveTemplate = useCallback(
    async (
      data: SaveTemplateData,
      polygonData?: TypedPolygon[]
    ): Promise<SaveTemplateResult> => {
      if (!canvas) {
        return { success: false, error: "Canvas not initialized" };
      }

      setIsSaving(true);

      try {
        // Use provided polygon data or extract from canvas if not provided
        const polygons = polygonData || extractPolygonData();
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

  // Apply loaded template data to canvas
  const applyTemplateToCanvas = useCallback(
    async (data: any): Promise<boolean> => {
      if (!canvas) return false;

      try {
        // Clear existing objects
        canvas.clear();

        // Set canvas dimensions if provided
        if (data.canvasWidth && data.canvasHeight) {
          canvas.setDimensions({
            width: data.canvasWidth,
            height: data.canvasHeight,
          });
        }

        // Load background image if provided
        if (data.backgroundImage) {
          try {
            const imgObj = await fabric.FabricImage.fromURL(
              data.backgroundImage
            );

            // Scale to fit canvas
            const scaleX = canvas.width! / imgObj.getScaledWidth();
            const scaleY = canvas.height! / imgObj.getScaledHeight();
            const scale = Math.min(scaleX, scaleY);

            imgObj.set({ scaleX: scale, scaleY: scale });
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
    extractBackgroundImage,
    isSaving,
    isLoading,
    isDeleting,
  };
}
