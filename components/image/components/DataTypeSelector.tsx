"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDrawing } from "../hooks/useDrawing";

const DEFAULT_DATA_TYPES = [
  "streamTitle", "streamDate", "duration", 
  "art", "logo", "weekday"
];

export function DataTypeSelector() {
  const { 
    currentDataType, 
    setCurrentDataType, 
    customDataTypes, 
    addCustomDataType 
  } = useDrawing();

  const allDataTypes = [...DEFAULT_DATA_TYPES, ...customDataTypes];

  const handleAddCustomType = (value: string) => {
    if (value.trim()) {
      addCustomDataType(value.trim());
    }
  };

  return (
    <Card className="bg-gray-700 border-gray-600">
      <CardHeader className="pb-3">
        <CardTitle className="text-green-400 text-sm font-semibold uppercase tracking-wide">
          Data Type
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {allDataTypes.map(type => (
            <Button
              key={type}
              onClick={() => setCurrentDataType(type)}
              variant={currentDataType === type ? 'default' : 'outline'}
              className={`text-xs p-2 h-auto ${
                currentDataType === type ? 'bg-green-500 text-black' : ''
              }`}
            >
              {type}
            </Button>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Input
            placeholder="Custom type..."
            className="flex-1 bg-gray-600 border-gray-500 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddCustomType((e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = '';
              }
            }}
          />
          <Button
            onClick={() => {
              const input = document.querySelector('input[placeholder="Custom type..."]') as HTMLInputElement;
              if (input?.value) {
                handleAddCustomType(input.value);
                input.value = '';
              }
            }}
            className="bg-green-500 text-black text-xs px-3"
          >
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}