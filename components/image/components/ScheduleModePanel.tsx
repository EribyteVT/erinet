// components/image/components/ScheduleModePanel.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Download } from "lucide-react";
import { useCanvas } from "../hooks/useCanvas";
import { useScheduleData } from "../hooks/useScheduleData";
import { ScheduleInputs } from "./ScheduleInputs";
// import { WeekSelector } from "./WeekSelector";
import { GenerateScheduleButton } from "./GenerateScheduleButton";

interface ScheduleModePanelProps {
  guild: string;
  streamerId: number;
}

export function ScheduleModePanel({
  guild,
}: //   streamerId,
ScheduleModePanelProps) {
  const streamerId = 3;
  const { groupInputsByOffset } = useScheduleData();

  const groupedInputs = groupInputsByOffset();

  return (
    <div className="w-100 bg-gray-800 border-r border-gray-700 overflow-y-auto">
      <div className="p-6 space-y-6"></div>
    </div>
  );
}
