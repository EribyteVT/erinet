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
  // Apply loaded template data to canvas
  const applyTemplateToCanvas = useCallback(
    async (data: any): Promise<boolean> => {
      console.log("🔄 Starting applyTemplateToCanvas", data);

      if (!canvas) {
        console.error("❌ Canvas not available");
        return false;
      }

      try {
        console.log("🧹 Clearing canvas...");
        // Clear existing objects
        canvas.clear();

        // ✅ RESTORE CANVAS PROPERTIES AFTER CLEAR - This is the key fix!
        canvas.backgroundColor = "#f0f0f0"; // Restore background color

        // Set canvas dimensions if provided, otherwise use defaults
        const canvasWidth = data.canvasWidth || 1280;
        const canvasHeight = data.canvasHeight || 720;

        console.log(
          `📐 Setting canvas dimensions: ${canvasWidth}x${canvasHeight}`
        );
        canvas.setDimensions({
          width: canvasWidth,
          height: canvasHeight,
        });

        // ✅ Ensure canvas is visible and properly configured
        canvas.selection = true;
        canvas.renderAll(); // Render after setting background and dimensions

        // Load background image if provided

        try {
          // Add timeout to prevent hanging
          const imageLoadPromise = fabric.FabricImage.fromURL(
            "http://localhost:3000/template_test.png"
          );

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Image load timeout")), 10000)
          );

          const imgObj = (await Promise.race([
            imageLoadPromise,
            timeoutPromise,
          ])) as fabric.FabricImage;

          console.log("✅ Background image loaded successfully");

          // Scale to fit canvas
          const scaleX = canvas.width! / imgObj.getScaledWidth();
          const scaleY = canvas.height! / imgObj.getScaledHeight();
          const scale = Math.min(scaleX, scaleY);

          console.log(`🔧 Scaling image: ${scale}`);
          imgObj.set({
            scaleX: scale,
            scaleY: scale,
            left: 0,
            top: 0,
            selectable: false,
            evented: false,
            excludeFromExport: false,
          });
          canvas.add(imgObj);
          canvas.sendObjectToBack(imgObj);
          console.log("✅ Background image added to canvas");
        } catch (imgError) {
          console.error("❌ Error loading background image:", imgError);
          // Continue without background image - don't fail the whole operation
        }

        // Recreate polygons
        if (data.polygons && Array.isArray(data.polygons)) {
          console.log(`🔺 Loading ${data.polygons.length} polygons...`);

          for (let i = 0; i < data.polygons.length; i++) {
            const polygonData = data.polygons[i];
            console.log(
              `🔺 Creating polygon ${i + 1}/${data.polygons.length}:`,
              polygonData
            );

            try {
              // Create the polygon exactly like in useDrawing.tsx
              const polygon = new fabric.Polygon(polygonData.points, {
                left: 0, // Reset to 0 since group will handle positioning
                top: 0, // Reset to 0 since group will handle positioning
                fill: polygonData.fill || "rgba(255, 0, 0, 0.3)",
                stroke: polygonData.stroke || "#ff0000",
                strokeWidth: polygonData.strokeWidth || 2,
                scaleX: polygonData.scaleX || 1,
                scaleY: polygonData.scaleY || 1,
                angle: polygonData.angle || 0,
                opacity: polygonData.opacity || 1,
                cornerStyle: "circle",
                cornerColor: polygonData.stroke || "#ff0000",
                cornerSize: 8,
                transparentCorners: false,
                selectable: true,
                evented: true,
              });

              // Create group just like original
              const group = new fabric.Group([polygon], {
                left: polygonData.left,
                top: polygonData.top,
                selectable: true,
                evented: true,
              });

              // Add metadata to GROUP, not individual polygon
              (group as any).polygonType = polygonData.type;
              (group as any).polygonId = polygonData.id;
              (group as any).points = polygonData.points;

              canvas.add(group);
              console.log(`✅ Polygon group ${i + 1} added successfully`);
            } catch (polygonError) {
              console.error(
                `❌ Error creating polygon ${i + 1}:`,
                polygonError
              );
              // Continue with next polygon
            }
          }
        } else {
          console.log("ℹ️ No polygons to load");
        }

        console.log("🎨 Final render...");
        canvas.renderAll();

        // ✅ Add a small delay to ensure everything is rendered properly
        await new Promise((resolve) => setTimeout(resolve, 100));

        console.log("✅ Template applied successfully!");
        return true;
      } catch (error) {
        console.error("❌ Error applying template to canvas:", error);
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
