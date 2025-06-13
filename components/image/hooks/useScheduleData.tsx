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
  const [scheduleData, setScheduleData] = useState<ScheduleData>({});
  const [weekStartDate, setWeekStartDate] = useState<Date>(() => {
    // Default to the most recent Monday
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    return monday;
  });

  const updatePolygonText = useCallback(
    (dataType: string, value: string) => {
      if (!canvas) return;

      canvas.getObjects().forEach((obj) => {
        if ((obj as any).polygonType === dataType) {
          const polygon = obj as Polygon;

          // Get polygon bounds
          const bounds = polygon.getBoundingRect();

          // Format the display value
          let displayValue = value;

          // Create or find existing text object for this polygon
          let textObj = canvas
            .getObjects()
            .find(
              (o) => o.type === "text" && (o as any).linkedPolygon === dataType
            ) as Text;

          if (!textObj) {
            // Create new text object if it doesn't exist
            textObj = new Text(displayValue || `[${dataType}]`, {
              left: bounds.left + bounds.width / 2,
              top: bounds.top + bounds.height / 2,
              originX: "center",
              originY: "center",
              fontSize: 16,
              fill: "#000000",
              fontFamily: "Arial",
              textAlign: "center",
            });

            // Link the text to this polygon
            (textObj as any).linkedPolygon = dataType;
            canvas.add(textObj);
          } else {
            // Update existing text
            textObj.set("text", displayValue || `[${dataType}]`);

            // Reposition text to center of polygon
            textObj.set({
              left: bounds.left + bounds.width / 2,
              top: bounds.top + bounds.height / 2,
            });
          }

          // Auto-size text to fit within polygon bounds
          const fitTextToPolygon = (textObj: Text, bounds: any) => {
            const maxWidth = bounds.width * 0.9; // 90% of polygon width for padding
            const maxHeight = bounds.height * 0.9; // 90% of polygon height for padding

            let fontSize = parseInt(textObj.fontSize?.toString() || "16");

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

                if (
                  textObj.getBoundingRect().width > maxWidth &&
                  currentLine !== ""
                ) {
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
        }
      });

      canvas.renderAll();
    },
    [canvas]
  );

  const updateScheduleData = useCallback(
    (dataType: string, value: string) => {
      setScheduleData((prev) => ({ ...prev, [dataType]: value }));
      updatePolygonText(dataType, value);
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

  const loadPreset = useCallback(
    (presetType: string) => {
      const basePresets: { [key: string]: any } = {
        gaming: {
          stream_name: "Epic Gaming Session",
          stream_time: "20:00",
          game: "Cyberpunk 2077",
          duration: "4 hours",
          notes: "Viewer challenges & epic boss fights!",
        },
        art: {
          stream_name: "Digital Art Creation",
          stream_time: "18:00",
          game: "Photoshop Live",
          duration: "3 hours",
          notes: "Commission work & tutorials",
        },
        variety: {
          stream_name: "Variety Stream Night",
          stream_time: "19:00",
          game: "Chat Decides!",
          duration: "2 hours",
          notes: "Random games & chatting",
        },
      };

      const basePreset = basePresets[presetType];
      if (!basePreset) return;

      // Apply preset to all available days
      const groupedData = groupInputsByOffset();
      const newScheduleData: ScheduleData = { ...scheduleData };

      groupedData.forEach((dayData) => {
        dayData.inputs.forEach((inputType) => {
          const field = getFieldFromType(inputType);
          if (field && basePreset[field]) {
            newScheduleData[inputType] = basePreset[field];
          }
        });
      });

      setScheduleData(newScheduleData);

      // Update all polygon texts
      Object.keys(newScheduleData).forEach((key) => {
        updatePolygonText(key, newScheduleData[key]);
      });
    },
    [scheduleData, groupInputsByOffset, updatePolygonText]
  );

  const clearAllScheduleData = useCallback(() => {
    const emptyData: ScheduleData = {};
    generateScheduleInputs().forEach((type) => {
      emptyData[type] = "";
    });

    setScheduleData(emptyData);
    Object.keys(emptyData).forEach((key) => {
      updatePolygonText(key, "");
    });
  }, [generateScheduleInputs, updatePolygonText]);

  return (
    <ScheduleDataContext.Provider
      value={{
        scheduleData,
        weekStartDate,
        setWeekStartDate,
        updateScheduleData,
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
