"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useCallback } from "react";
import { useDrawing } from "../hooks/useDrawing";
import { useCanvas } from "../hooks/useCanvas";
import {
  OFFSET_STREAM_TYPES,
  SINGULAR_POLYGON_TYPES,
  generateOffsetTemplate,
} from "../types";
import { DrawingControls } from "./DrawingControls";

var stream_number_positions = [
  "First Stream",
  "Second Stream",
  "Third Stream",
  "Fourth Stream",
  "Fifth Stream",
  "Sixth Stream",
  "Seventh Stream",
];

export function DataTypeSelector() {
  const {
    currentDataType,
    setCurrentDataType,
    customDataTypes,
    addCustomDataType,
  } = useDrawing();
  const { canvas } = useCanvas();

  const [selectedDay, setSelectedDay] = useState("0");
  const [selectedField, setSelectedField] = useState("stream_name");
  const [customTypeName, setCustomTypeName] = useState("");
  const [canvasUpdateTrigger, setCanvasUpdateTrigger] = useState(0);

  const dayOptions = Array.from({ length: 7 }, (_, i) => ({
    value: i.toString(),
    label: stream_number_positions[i],
  }));

  // Function to get already used day+field combinations from canvas
  const getUsedDataTypes = useCallback(() => {
    if (!canvas) return new Set<string>();

    const usedTypes = new Set<string>();
    canvas.getObjects().forEach((obj) => {
      const polygonType = (obj as any).polygonType;
      if (polygonType && polygonType.startsWith("day")) {
        usedTypes.add(polygonType);
      }
    });
    return usedTypes;
  }, [canvas, canvasUpdateTrigger]);

  // Get currently used data types
  const usedDataTypes = getUsedDataTypes();

  // Separated field options - Basic vs Advanced (always show all options)
  const basicFieldOptions = [
    { value: "stream_name", label: "Stream Name" },
    { value: "stream_date", label: "Stream Date" },
    { value: "stream_time", label: "Stream Time" },
  ];

  const advancedFieldOptions = [
    { value: "stream_month", label: "Stream Date Month" },
    { value: "stream_day", label: "Stream Date Day" },
    { value: "stream_time_ntz", label: "Stream Time (no timezone)" },
    { value: "stream_tz", label: "Stream Timezone" },
    { value: "game", label: "Game/Category" },
    { value: "duration", label: "Duration" },
    { value: "notes", label: "Notes" },
  ];

  // Combined for compatibility - all options available
  const fieldOptions = [...basicFieldOptions, ...advancedFieldOptions];

  // Check if current day+field combination is already used
  const currentDataTypeUsed = usedDataTypes.has(
    `day${selectedDay}_${selectedField}`
  );

  const singularTypes = [...SINGULAR_POLYGON_TYPES];

  const allDataTypes = [
    ...OFFSET_STREAM_TYPES,
    ...singularTypes,
    ...customDataTypes,
  ];

  const handleQuickSelectOffsetType = () => {
    const offsetType = `day${selectedDay}_${selectedField}`;
    setCurrentDataType(offsetType);
  };

  const getDisplayName = () => {
    const streamName = stream_number_positions[parseInt(selectedDay)];
    const fieldLabel =
      fieldOptions.find((option) => option.value === selectedField)?.label ||
      selectedField;

    // Make it more natural by shortening some field names
    const shortFieldName = fieldLabel
      .replace("Stream ", "") // "Stream Name" -> "Name"
      .replace("Stream Date ", "") // "Stream Date Month" -> "Month"
      .replace("Stream Time", "Time"); // Keep "Stream Time" as "Time"

    return `${streamName}'s ${shortFieldName}`;
  };

  // Automatically select the generated type when day or field changes
  useEffect(() => {
    const offsetType = `day${selectedDay}_${selectedField}`;
    setCurrentDataType(offsetType);
  }, [selectedDay, selectedField, setCurrentDataType]);

  // Force re-render when canvas objects change
  useEffect(() => {
    if (!canvas) return;

    const handleCanvasChange = () => {
      // Force component re-render by updating the trigger
      setCanvasUpdateTrigger((prev) => prev + 1);
    };

    canvas.on("object:added", handleCanvasChange);
    canvas.on("object:removed", handleCanvasChange);

    return () => {
      canvas.off("object:added", handleCanvasChange);
      canvas.off("object:removed", handleCanvasChange);
    };
  }, [canvas]);

  const handleAddCustomType = (value: string) => {
    if (value.trim()) {
      addCustomDataType(value.trim());
      setCustomTypeName("");
    }
  };

  // Group types for better organization
  const offsetTypes = allDataTypes.filter((type) => type.startsWith("day"));
  const legacyTypesFiltered = allDataTypes.filter((type) =>
    singularTypes.includes(type as any)
  );
  const customTypesFiltered = allDataTypes.filter(
    (type) => !type.startsWith("day") && !singularTypes.includes(type as any)
  );

  return (
    <Card className="bg-gray-700 border-gray-600">
      <CardHeader className="pb-3">
        <CardTitle className="text-green-400 text-sm font-semibold uppercase tracking-wide">
          Data Type Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Multiple Type Generator */}
        <div className="space-y-3 p-3 bg-gray-600 rounded-lg">
          <Label className="text-xs font-medium text-green-300">
            Stream Types
          </Label>

          {/* Show used data types status */}
          {usedDataTypes.size > 0 && (
            <div className="text-xs text-yellow-300 bg-yellow-900/20 p-2 rounded max-h-20 overflow-y-auto">
              <div className="font-medium mb-1">Used combinations:</div>
              <div className="space-y-1">
                {Array.from(usedDataTypes).map((dataType) => {
                  const match = dataType.match(/day(\d+)_(.+)/);
                  if (match) {
                    const dayNum = parseInt(match[1]);
                    const field = match[2];
                    const streamName = stream_number_positions[dayNum];
                    const fieldLabel =
                      fieldOptions.find((f) => f.value === field)?.label ||
                      field;
                    return (
                      <div key={dataType} className="text-xs">
                        {streamName}'s {fieldLabel}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-gray-300">Stream Number</Label>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dayOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-gray-300">Field</Label>
              <Select value={selectedField} onValueChange={setSelectedField}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {/* Basic Field Options */}
                  {basicFieldOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}

                  {/* Separator */}
                  <div className="px-2 py-1">
                    <div className="border-t border-gray-300 relative">
                      <span className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-500 font-medium">
                        Advanced
                      </span>
                    </div>
                  </div>

                  {/* Advanced Field Options */}
                  {advancedFieldOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div
            className={`w-full text-xs h-7 rounded px-3 py-1 text-center flex items-center justify-center ${
              currentDataTypeUsed
                ? "bg-red-500 text-white"
                : currentDataType === `day${selectedDay}_${selectedField}`
                ? "bg-green-500 text-black"
                : "bg-gray-600 text-white"
            }`}
          >
            {currentDataTypeUsed
              ? `${getDisplayName()} - Already Used`
              : getDisplayName()}
          </div>
        </div>

        {/* Singular Types */}
        {legacyTypesFiltered.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-yellow-300">
              Singular Types
            </Label>
            <div className="grid grid-cols-2 gap-1">
              {legacyTypesFiltered.map((type) => (
                <Button
                  key={type}
                  onClick={() => setCurrentDataType(type)}
                  variant={currentDataType === type ? "default" : "outline"}
                  className={`text-xs p-2 h-auto ${
                    currentDataType === type
                      ? "bg-green-500 text-black border-green-500"
                      : "bg-gray-600 border-gray-500 text-white hover:bg-gray-500"
                  }`}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Types */}
        {customTypesFiltered.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-blue-300">
              Custom Types
            </Label>
            <div className="grid grid-cols-2 gap-1">
              {customTypesFiltered.map((type) => (
                <Button
                  key={type}
                  onClick={() => setCurrentDataType(type)}
                  variant={currentDataType === type ? "default" : "outline"}
                  className={`text-xs p-2 h-auto ${
                    currentDataType === type
                      ? "bg-green-500 text-black border-green-500"
                      : "bg-gray-600 border-gray-500 text-white hover:bg-gray-500"
                  }`}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Add Custom Type */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-purple-300">
            Add Custom Type
          </Label>
          <div className="flex gap-1">
            <Input
              value={customTypeName}
              onChange={(e) => setCustomTypeName(e.target.value)}
              placeholder="Custom type name"
              className="bg-gray-600 border-gray-500 text-white text-xs h-7"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddCustomType(customTypeName);
                }
              }}
            />
            <Button
              onClick={() => handleAddCustomType(customTypeName)}
              disabled={!customTypeName.trim()}
              className="bg-purple-500 hover:bg-purple-600 text-white text-xs h-7 px-2"
            >
              Add
            </Button>
          </div>
        </div>

        {/* Drawing Controls */}
        {!currentDataTypeUsed ? (
          <DrawingControls />
        ) : (
          <div className="text-center p-4 bg-red-900/20 rounded border border-red-500">
            <p className="text-xs text-red-300">
              Drawing disabled: This specific combination "{getDisplayName()}"
              is already used. Choose a different day/field combination or
              delete the existing polygon.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
