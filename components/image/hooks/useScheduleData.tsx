// components/image/hooks/useScheduleData.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Text, Group, Polygon } from "fabric";
import { useCanvas } from "./useCanvas";
import { useTextFormatting, TextJustification } from "./useTextFormatting";
import {
  getOffsetFromType,
  getFieldFromType,
  getDateFromOffset,
  getDayName,
} from "../types";

interface ScheduleData {
  [key: string]: string;
}

interface DayGroupedData {
  offset: number;
  date: Date;
  dayName: string;
  inputs: string[];
}

interface ScheduleDataContextType {
  scheduleData: ScheduleData;
  weekStartDate: Date;
  setWeekStartDate: (date: Date) => void;
  updateScheduleData: (dataType: string, value: string) => void;
  batchUpdateScheduleData: (updates: Record<string, string>) => void;
  generateScheduleInputs: () => string[];
  groupInputsByOffset: () => DayGroupedData[];
  loadPreset: (presetType: string) => void;
  clearAllScheduleData: () => void;
}

const ScheduleDataContext = createContext<ScheduleDataContextType | undefined>(
  undefined
);

export function ScheduleDataProvider({ children }: { children: ReactNode }) {
  const { canvas } = useCanvas();
  const { getTextSettings } = useTextFormatting();
  const [scheduleData, setScheduleData] = useState<ScheduleData>({});
  const [weekStartDate, setWeekStartDate] = useState<Date>(() => {
    // Default to the most recent Monday
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    return monday;
  });

  // Helper function to get text positioning based on justification
  const getTextPosition = useCallback(
    (bounds: any, justification: TextJustification) => {
      const padding = bounds.width * 0.05; // 5% padding

      switch (justification) {
        case "left":
          return {
            left: bounds.left + padding,
            originX: "left" as const,
          };
        case "right":
          return {
            left: bounds.left + bounds.width - padding,
            originX: "right" as const,
          };
        case "center":
        default:
          return {
            left: bounds.left + bounds.width / 2,
            originX: "center" as const,
          };
      }
    },
    []
  );

  // Format time value based on settings
  const formatTimeValue = useCallback(
    (value: string, dataType: string): string => {
      const field = getFieldFromType(dataType);
      if (!field || !field.includes("time") || !value) return value;

      const settings = getTextSettings(field);

      try {
        // Parse the time value (assuming HH:mm format)
        const [hours, minutes] = value.split(":").map(Number);

        if (isNaN(hours) || isNaN(minutes)) return value;

        if (settings.timeFormat === "12") {
          // Convert to 12-hour format
          const period = hours >= 12 ? "PM" : "AM";
          const displayHours =
            hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
          return `${displayHours}:${minutes
            .toString()
            .padStart(2, "0")} ${period}`;
        } else {
          // Keep 24-hour format
          return `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}`;
        }
      } catch (error) {
        return value; // Return original value if parsing fails
      }
    },
    [getTextSettings]
  );

  const updatePolygonText = useCallback(
    (dataType: string, value: string) => {
      if (!canvas) return;

      canvas.getObjects().forEach((obj) => {
        if ((obj as any).polygonType === dataType) {
          const polygon = obj as Polygon;

          // Get polygon bounds
          const bounds = polygon.getBoundingRect();

          // Get field type and formatting settings
          const field = getFieldFromType(dataType);
          const settings = field
            ? getTextSettings(field)
            : getTextSettings("default");

          // Get text position based on justification
          const textPosition = getTextPosition(bounds, settings.justification);

          // Format the display value
          let displayValue = formatTimeValue(value, dataType);

          // Create or find existing text object for this polygon
          let textObj = canvas
            .getObjects()
            .find(
              (o) => o.type === "text" && (o as any).linkedPolygon === dataType
            ) as Text;

          if (!textObj) {
            console.log(`Creating new text object for ${dataType}`);
            // Create new text object if it doesn't exist
            const textContent =
              value !== undefined && value !== null
                ? displayValue
                : `[${dataType}]`;

            textObj = new Text(textContent, {
              left: textPosition.left,
              top: bounds.top + bounds.height / 2,
              originX: textPosition.originX,
              originY: "center",
              fontSize: settings.fontSize,
              fill: "#000000",
              fontFamily: "Arial",
              textAlign: settings.justification,
            });

            // Link the text to this polygon
            (textObj as any).linkedPolygon = dataType;
            canvas.add(textObj);
          } else {
            console.log(`Updating existing text object for ${dataType}`);
            // Update existing text with new formatting
            const textContent =
              value !== undefined && value !== null
                ? displayValue
                : `[${dataType}]`;

            textObj.set({
              text: textContent,
              fontSize: settings.fontSize,
              textAlign: settings.justification,
              left: textPosition.left,
              top: bounds.top + bounds.height / 2,
              originX: textPosition.originX,
              originY: "center",
            });
          }

          // Auto-size text to fit within polygon bounds
          const fitTextToPolygon = (textObj: Text, bounds: any) => {
            const maxWidth = bounds.width * 0.9; // 90% of polygon width for padding
            const maxHeight = bounds.height * 0.9; // 90% of polygon height for padding

            let fontSize = settings.fontSize;

            // Scale down font size until text fits
            while (fontSize > 8) {
              // Minimum font size
              textObj.set("fontSize", fontSize);

              const textBounds = textObj.getBoundingRect();

              if (
                textBounds.width <= maxWidth &&
                textBounds.height <= maxHeight
              ) {
                break;
              }

              fontSize -= 1;
            }

            // Handle text wrapping for long text
            const words = (textObj.text || "").split(" ");
            if (words.length > 1) {
              let wrappedText = "";
              let currentLine = "";

              for (const word of words) {
                const testLine = currentLine ? `${currentLine} ${word}` : word;
                textObj.set("text", testLine);

                const testBounds = textObj.getBoundingRect();

                if (testBounds.width > maxWidth && currentLine) {
                  wrappedText += (wrappedText ? "\n" : "") + currentLine;
                  currentLine = word;
                } else {
                  currentLine = testLine;
                }
              }

              wrappedText += (wrappedText ? "\n" : "") + currentLine;
              textObj.set("text", wrappedText);

              // Check if wrapped text still fits, if not reduce font size more
              while (
                textObj.getBoundingRect().height > maxHeight &&
                fontSize > 8
              ) {
                fontSize -= 1;
                textObj.set("fontSize", fontSize);
              }
            }
          };

          fitTextToPolygon(textObj, bounds);

          // Ensure the text coordinates are updated
          textObj.setCoords();
        }
      });

      canvas.renderAll();
    },
    [canvas, getTextSettings, formatTimeValue, getTextPosition]
  );

  const updateScheduleData = useCallback(
    (dataType: string, value: string) => {
      console.log(`Single update: ${dataType} = ${value}`);
      setScheduleData((prev) => ({ ...prev, [dataType]: value }));
      updatePolygonText(dataType, value);
    },
    [updatePolygonText]
  );

  const batchUpdateScheduleData = useCallback(
    (updates: Record<string, string>) => {
      console.log("Batch updating schedule data:", updates);

      // Update state in one go
      setScheduleData((prev) => ({ ...prev, ...updates }));

      // Use requestAnimationFrame to ensure canvas is ready for updates
      requestAnimationFrame(() => {
        // Update all text objects after state is updated
        Object.entries(updates).forEach(([dataType, value]) => {
          updatePolygonText(dataType, value);
        });
      });
    },
    [updatePolygonText]
  );

  const generateScheduleInputs = useCallback(() => {
    const polygonTypes = new Set<string>();

    if (canvas) {
      canvas.getObjects().forEach((obj) => {
        const type = (obj as any).polygonType;
        if (type) polygonTypes.add(type);
      });
    }

    return Array.from(polygonTypes);
  }, [canvas]);

  const groupInputsByOffset = useCallback((): DayGroupedData[] => {
    const inputTypes = generateScheduleInputs();
    const grouped: { [offset: number]: DayGroupedData } = {};

    inputTypes.forEach((type) => {
      const offset = getOffsetFromType(type);
      if (offset !== null) {
        if (!grouped[offset]) {
          const date = getDateFromOffset(weekStartDate, offset);
          grouped[offset] = {
            offset,
            date,
            dayName: getDayName(offset, weekStartDate),
            inputs: [],
          };
        }
        grouped[offset].inputs.push(type);
      }
    });

    // Sort inputs within each day for better UX
    Object.values(grouped).forEach((dayData) => {
      dayData.inputs.sort((a, b) => {
        const fieldA = getFieldFromType(a) || "";
        const fieldB = getFieldFromType(b) || "";

        // Define preferred order
        const order = [
          "stream_name",
          "stream_time",
          "game",
          "duration",
          "notes",
        ];
        const indexA = order.indexOf(fieldA);
        const indexB = order.indexOf(fieldB);

        if (indexA === -1 && indexB === -1) return fieldA.localeCompare(fieldB);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
    });

    return Object.values(grouped).sort((a, b) => a.offset - b.offset);
  }, [weekStartDate, generateScheduleInputs]);

  const loadPreset = useCallback((presetType: string) => {
    // Implementation for loading presets can be added here
    console.log(`Loading preset: ${presetType}`);
  }, []);

  const clearAllScheduleData = useCallback(() => {
    const emptyData: ScheduleData = {};
    generateScheduleInputs().forEach((type) => {
      emptyData[type] = "";
    });

    // Use batch update instead of individual updates
    batchUpdateScheduleData(emptyData);
  }, [generateScheduleInputs, batchUpdateScheduleData]);

  return (
    <ScheduleDataContext.Provider
      value={{
        scheduleData,
        weekStartDate,
        setWeekStartDate,
        updateScheduleData,
        batchUpdateScheduleData,
        generateScheduleInputs,
        groupInputsByOffset,
        loadPreset,
        clearAllScheduleData,
      }}
    >
      {children}
    </ScheduleDataContext.Provider>
  );
}

export function useScheduleData() {
  const context = useContext(ScheduleDataContext);
  if (context === undefined) {
    throw new Error(
      "useScheduleData must be used within a ScheduleDataProvider"
    );
  }
  return context;
}
