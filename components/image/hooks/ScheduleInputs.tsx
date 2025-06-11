"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useScheduleData } from "../hooks/useScheduleData";

export function ScheduleInputs() {
  const { scheduleData, updateScheduleData, generateScheduleInputs } = useScheduleData();

  const getInputType = (dataType: string): string => {
    switch(dataType) {
      case 'datetime': return 'datetime-local';
      case 'notes': return 'textarea';
      case 'duration': return 'select';
      default: return 'text';
    }
  };

  const inputTypes = generateScheduleInputs();

  return (
    <div className="space-y-4">
      {inputTypes.map((dataType) => (
        <div key={dataType} className="space-y-2">
          <Label htmlFor={dataType} className="text-sm font-medium capitalize">
            {dataType.replace(/([A-Z])/g, ' $1').trim()}
          </Label>
          
          {getInputType(dataType) === 'textarea' ? (
            <Textarea
              id={dataType}
              value={scheduleData[dataType] || ''}
              onChange={(e) => updateScheduleData(dataType, e.target.value)}
              placeholder={`Enter ${dataType}...`}
              className="bg-gray-600 border-gray-500 text-white resize-vertical min-h-[60px]"
            />
          ) : getInputType(dataType) === 'select' && dataType === 'duration' ? (
            <Select
              value={scheduleData[dataType] || ''}
              onValueChange={(value) => updateScheduleData(dataType, value)}
            >
              <SelectTrigger className="bg-gray-600 border-gray-500 text-white">
                <SelectValue placeholder="Select duration..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1 hour">1 hour</SelectItem>
                <SelectItem value="2 hours">2 hours</SelectItem>
                <SelectItem value="3 hours">3 hours</SelectItem>
                <SelectItem value="4 hours">4 hours</SelectItem>
                <SelectItem value="All night">All night</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Input
              id={dataType}
              type={getInputType(dataType)}
              value={scheduleData[dataType] || ''}
              onChange={(e) => updateScheduleData(dataType, e.target.value)}
              placeholder={`Enter ${dataType}...`}
              className="bg-gray-600 border-gray-500 text-white"
            />
          )}
        </div>
      ))}
    </div>
  );
}