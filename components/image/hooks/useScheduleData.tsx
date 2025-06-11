"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Text, Group } from "fabric";
import { useCanvas } from "./useCanvas";

interface ScheduleData {
  [key: string]: string;
}

interface ScheduleDataContextType {
  scheduleData: ScheduleData;
  updateScheduleData: (dataType: string, value: string) => void;
  generateScheduleInputs: () => string[];
  loadPreset: (presetType: string) => void;
  clearAllScheduleData: () => void;
}

const ScheduleDataContext = createContext<ScheduleDataContextType | undefined>(undefined);

export function ScheduleDataProvider({ children }: { children: ReactNode }) {
  const { canvas } = useCanvas();
  const [scheduleData, setScheduleData] = useState<ScheduleData>({});

  const updatePolygonText = useCallback((dataType: string, value: string) => {
    if (!canvas) return;

    canvas.getObjects().forEach(obj => {
      if ((obj as any).polygonType === dataType) {
        const group = obj as Group;
        const textObj = group.getObjects().find(o => o.type === 'text') as Text;
        if (textObj) {
          let displayValue = value;
          
          // Format based on data type
          if (dataType === 'datetime' && value) {
            const date = new Date(value);
            displayValue = date.toLocaleDateString() + ' ' + 
                          date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
          }
          
          textObj.set('text', displayValue || `[${dataType}]`);
        }
      }
    });
    
    canvas.renderAll();
  }, [canvas]);

  const updateScheduleData = useCallback((dataType: string, value: string) => {
    setScheduleData(prev => ({ ...prev, [dataType]: value }));
    updatePolygonText(dataType, value);
  }, [updatePolygonText]);

  const generateScheduleInputs = useCallback(() => {
    const polygonTypes = new Set<string>();
    
    if (canvas) {
      canvas.getObjects().forEach(obj => {
        const type = (obj as any).polygonType;
        if (type) polygonTypes.add(type);
      });
    }

    return Array.from(polygonTypes);
  }, [canvas]);

  const loadPreset = useCallback((presetType: string) => {
    const presets: { [key: string]: ScheduleData } = {
      gaming: {
        streamTitle: 'Epic Gaming Marathon',
        game: 'Cyberpunk 2077',
        duration: '4 hours',
        streamer: 'GamerPro2025',
        notes: 'Viewer challenges & epic boss fights!',
        platform: 'Twitch'
      },
      art: {
        streamTitle: 'Digital Art Creation',
        game: 'Photoshop Live',
        duration: '3 hours',
        streamer: 'ArtMaster',
        notes: 'Commission work & tutorials',
        platform: 'Twitch'
      },
      variety: {
        streamTitle: 'Variety Stream Night',
        game: 'Chat Decides!',
        duration: '2 hours',
        streamer: 'VarietyStreamer',
        notes: 'Random games & chatting',
        platform: 'Twitch'
      }
    };

    const preset = presets[presetType];
    if (preset) {
      setScheduleData(preset);
      Object.keys(preset).forEach(key => {
        updatePolygonText(key, preset[key]);
      });
    }
  }, [updatePolygonText]);

  const clearAllScheduleData = useCallback(() => {
    const emptyData: ScheduleData = {};
    generateScheduleInputs().forEach(type => {
      emptyData[type] = '';
    });
    
    setScheduleData(emptyData);
    Object.keys(emptyData).forEach(key => {
      updatePolygonText(key, '');
    });
  }, [generateScheduleInputs, updatePolygonText]);

  return (
    <ScheduleDataContext.Provider value={{
      scheduleData,
      updateScheduleData,
      generateScheduleInputs,
      loadPreset,
      clearAllScheduleData
    }}>
      {children}
    </ScheduleDataContext.Provider>
  );
}

export function useScheduleData() {
  const context = useContext(ScheduleDataContext);
  if (context === undefined) {
    throw new Error('useScheduleData must be used within a ScheduleDataProvider');
  }
  return context;
}