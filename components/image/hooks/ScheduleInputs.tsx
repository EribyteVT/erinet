"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useScheduleData } from "../hooks/useScheduleData";
import { getFieldFromType } from "../types";

export function ScheduleInputs() {
  const { 
    scheduleData, 
    updateScheduleData, 
    groupInputsByOffset, 
    weekStartDate, 
    setWeekStartDate 
  } = useScheduleData();

  const groupedInputs = groupInputsByOffset();

  const getInputType = (dataType: string): string => {
    const field = getFieldFromType(dataType);
    switch(field) {
      case 'stream_time': return 'time';
      case 'notes': return 'textarea';
      case 'duration': return 'select';
      default: return 'text';
    }
  };

  const formatFieldName = (dataType: string): string => {
    const field = getFieldFromType(dataType);
    if (!field) return dataType;
    
    return field
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const getPlaceholder = (dataType: string): string => {
    const field = getFieldFromType(dataType);
    switch(field) {
      case 'stream_name': return 'Enter stream title...';
      case 'stream_time': return 'Select time...';
      case 'game': return 'Enter game/category...';
      case 'duration': return 'Select duration...';
      case 'notes': return 'Enter additional notes...';
      default: return `Enter ${field}...`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Week Start Date Picker */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-green-400">Week Starting Date</Label>
        <Input
          type="date"
          value={weekStartDate.toISOString().split('T')[0]}
          onChange={(e) => setWeekStartDate(new Date(e.target.value))}
          className="bg-gray-600 border-gray-500 text-white"
        />
        <p className="text-xs text-gray-400">
          This will be Day 0. All other days will be calculated from this date.
        </p>
      </div>

      {/* Grouped by Day */}
      {groupedInputs.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <p className="text-sm">No schedule fields found.</p>
          <p className="text-xs mt-1">
            Create polygons in Design Mode first, then return here to fill in your schedule.
          </p>
        </div>
      ) : (
        groupedInputs.map((dayData) => (
          <Card key={dayData.offset} className="bg-gray-600 border-gray-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-400 flex items-center justify-between">
                <span>
                  Day {dayData.offset}: {dayData.dayName}
                </span>
                <span className="text-xs text-gray-300 font-normal">
                  {dayData.date.toLocaleDateString()}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dayData.inputs.map(dataType => {
                const inputType = getInputType(dataType);
                const fieldName = formatFieldName(dataType);
                const placeholder = getPlaceholder(dataType);

                return (
                  <div key={dataType} className="space-y-2">
                    <Label htmlFor={dataType} className="text-xs font-medium text-gray-200">
                      {fieldName}
                    </Label>
                    
                    {inputType === 'textarea' ? (
                      <Textarea
                        id={dataType}
                        value={scheduleData[dataType] || ''}
                        onChange={(e) => updateScheduleData(dataType, e.target.value)}
                        placeholder={placeholder}
                        className="bg-gray-700 border-gray-600 text-white resize-vertical min-h-[60px] text-sm"
                        rows={2}
                      />
                    ) : inputType === 'select' && getFieldFromType(dataType) === 'duration' ? (
                      <Select
                        value={scheduleData[dataType] || ''}
                        onValueChange={(value) => updateScheduleData(dataType, value)}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white text-sm">
                          <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1 hour">1 hour</SelectItem>
                          <SelectItem value="1.5 hours">1.5 hours</SelectItem>
                          <SelectItem value="2 hours">2 hours</SelectItem>
                          <SelectItem value="3 hours">3 hours</SelectItem>
                          <SelectItem value="4 hours">4 hours</SelectItem>
                          <SelectItem value="5 hours">5 hours</SelectItem>
                          <SelectItem value="6+ hours">6+ hours</SelectItem>
                          <SelectItem value="All night">All night</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id={dataType}
                        type={inputType}
                        value={scheduleData[dataType] || ''}
                        onChange={(e) => updateScheduleData(dataType, e.target.value)}
                        placeholder={placeholder}
                        className="bg-gray-700 border-gray-600 text-white text-sm"
                      />
                    )}
                  </div>
                );
              })}
              
              {dayData.inputs.length === 0 && (
                <p className="text-xs text-gray-400 italic text-center py-2">
                  No fields for this day
                </p>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}