"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useDrawing } from "../hooks/useDrawing";
import { OFFSET_STREAM_TYPES, SINGULAR_POLYGON_TYPES, generateOffsetTemplate } from "../types";

var stream_number_positions = ["First Stream", "Second Stream","Third Stream", "Fourth Stream","Fifth Stream", "Sixth Stream","Seventh Stream"]

export function DataTypeSelector() {
  const { 
    currentDataType, 
    setCurrentDataType, 
    customDataTypes, 
    addCustomDataType 
  } = useDrawing();

  const [selectedDay, setSelectedDay] = useState("0");
  const [selectedField, setSelectedField] = useState("stream_name");
  const [customTypeName, setCustomTypeName] = useState("");

  const dayOptions = Array.from({ length: 7 }, (_, i) => ({
    value: i.toString(),
    label: stream_number_positions[i]}
  ));

  const fieldOptions = [
    { value: "stream_name", label: "Stream Name" },
    { value: "stream_date", label: "Stream Date" },
    { value: "stream_time", label: "Stream Time" },
    { value: "stream_month", label: "Stream Date Month" },
    { value: "stream_day", label: "Stream Date Day" },
    { value: "stream_time_ntz", label: "Stream Time (no timezone)" },
    { value: "stream_tz", label: "Stream Timezone" },
    { value: "game", label: "Game/Category" },
    { value: "duration", label: "Duration" },
    { value: "notes", label: "Notes" }
  ];

  const singularTypes = [...SINGULAR_POLYGON_TYPES];
  const allDataTypes = [...OFFSET_STREAM_TYPES, ...singularTypes, ...customDataTypes];

  const handleQuickSelectOffsetType = () => {
    const offsetType = `day${selectedDay}_${selectedField}`;
    setCurrentDataType(offsetType);
  };

  const handleAddCustomType = (value: string) => {
    if (value.trim()) {
      addCustomDataType(value.trim());
      setCustomTypeName("");
    }
  };

  // Group types for better organization
  const offsetTypes = allDataTypes.filter(type => type.startsWith('day'));
  const legacyTypesFiltered = allDataTypes.filter(type => singularTypes.includes(type as any));
  const customTypesFiltered = allDataTypes.filter(type => 
    !type.startsWith('day') && !singularTypes.includes(type as any)
  );

  return (
    <Card className="bg-gray-700 border-gray-600">
      <CardHeader className="pb-3">
        <CardTitle className="text-green-400 text-sm font-semibold uppercase tracking-wide">
          Data Type Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

         {/* Current Selection Display */}
        <div className="p-2 bg-green-900/30 border border-green-500/50 rounded text-center">
          <p className="text-xs text-green-300 font-medium">Current Type:</p>
          <p className="text-sm text-green-400 font-mono">{currentDataType}</p>
        </div>
        
        {/* Multiple Type Generator */}
        <div className="space-y-3 p-3 bg-gray-600 rounded-lg">
          <Label className="text-xs font-medium text-green-300">Stream Types</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-gray-300">Stream Number</Label>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dayOptions.map(option => (
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
                  {fieldOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={handleQuickSelectOffsetType}
            className="w-full bg-green-500 text-black text-xs h-7"
          >
            Select: day{selectedDay}_{selectedField}
          </Button>
        </div>


        {/* Singular Types */}
        {legacyTypesFiltered.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-yellow-300">Singular Types</Label>
            <div className="grid grid-cols-2 gap-1">
              {legacyTypesFiltered.map(type => (
                <Button
                  key={type}
                  onClick={() => setCurrentDataType(type)}
                  variant={currentDataType === type ? 'default' : 'outline'}
                  className={`text-xs p-2 h-auto ${
                    currentDataType === type ? 'bg-green-500 text-black' : 'bg-gray-600 hover:bg-gray-500'
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
            <Label className="text-xs font-medium text-purple-300">Custom Types</Label>
            <div className="grid grid-cols-2 gap-1">
              {customTypesFiltered.map(type => (
                <Button
                  key={type}
                  onClick={() => setCurrentDataType(type)}
                  variant={currentDataType === type ? 'default' : 'outline'}
                  className={`text-xs p-2 h-auto ${
                    currentDataType === type ? 'bg-green-500 text-black' : 'bg-gray-600 hover:bg-gray-500'
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
          <Label className="text-xs font-medium text-gray-300">Add Custom Type</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Custom type name..."
              value={customTypeName}
              onChange={(e) => setCustomTypeName(e.target.value)}
              className="flex-1 bg-gray-600 border-gray-500 text-sm h-8"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddCustomType(customTypeName);
                }
              }}
            />
            <Button
              onClick={() => handleAddCustomType(customTypeName)}
              disabled={!customTypeName.trim()}
              className="bg-green-500 text-black text-xs px-3 h-8"
            >
              Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}