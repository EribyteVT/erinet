"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, Image, Text, Polygon, Circle, Group } from "fabric";
import { Button } from "../ui/button";
import {
  POLYGON_TYPES,
  Point,
  TypedPolygon,
  getTypeColor,
} from "./types";

interface ScheduleData {
  [key: string]: string;
}

interface Template {
  id: string;
  name: string;
  polygons: TypedPolygon[];
  backgroundImage?: string;
  created: string;
}

export default function ScheduleImage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  
  // Mode management
  const [mode, setMode] = useState<'design' | 'schedule'>('design');
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  
  // Drawing state
  const [currentDataType, setCurrentDataType] = useState<string>("streamTitle");
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([]);
  const [tempPoints, setTempPoints] = useState<Circle[]>([]);
  const [selectedPolygon, setSelectedPolygon] = useState<Group | null>(null);
  
  // Template and data management
  const [currentTemplate, setCurrentTemplate] = useState<string>("default");
  const [savedPolygons, setSavedPolygons] = useState<TypedPolygon[]>([]);
  const [scheduleData, setScheduleData] = useState<ScheduleData>({});
  const [customDataTypes, setCustomDataTypes] = useState<string[]>([]);
  
  // Available data types (expanded from your original)
  const defaultDataTypes = [
    "streamTitle", "streamDate", "duration", 
    "art", "logo", "weekday"
  ];
  
  const allDataTypes = [...defaultDataTypes, ...customDataTypes];

  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current && !canvas) {
      const fabricCanvas = new Canvas(canvasRef.current, {
        width: 1280,
        height: 720,
        backgroundColor: "#f0f0f0",
        selection: true,
      });

      setCanvas(fabricCanvas);

      // Add background image
      Image.fromURL("template_test.png")
        .then((backgroundImg) => {
          backgroundImg.scaleToWidth(fabricCanvas.width!);
          backgroundImg.scaleToHeight(fabricCanvas.height!);
          backgroundImg.set({
            left: 0,
            top: 0,
            selectable: false,
            evented: false,
            excludeFromExport: false,
          });
          fabricCanvas.add(backgroundImg);
          fabricCanvas.sendObjectToBack(backgroundImg);
          fabricCanvas.renderAll();
        })
        .catch((error) => {
          console.error("Error loading background image:", error);
          const instructionText = new Text(
            'Design Mode: Create custom polygons for your schedule data\nSchedule Mode: Fill out forms to generate weekly schedules',
            {
              left: 50,
              top: 50,
              fontFamily: "Arial",
              fontSize: 16,
              fill: "#666",
              selectable: false,
            }
          );
          fabricCanvas.add(instructionText);
          fabricCanvas.renderAll();
        });

      return () => {
        fabricCanvas.dispose();
      };
    }
  }, []);

  // Handle canvas interactions based on mode
  useEffect(() => {
    if (!canvas) return;

    const handleCanvasClick = (e: any) => {
      if (mode !== 'design' || !isDrawingMode) return;

      const pointer = canvas.getPointer(e.e);
      const newPoint: Point = { x: pointer.x, y: pointer.y };

      // Create visual indicator
      const pointCircle = new Circle({
        left: pointer.x - 4,
        top: pointer.y - 4,
        radius: 4,
        fill: getTypeColor(currentDataType),
        stroke: '#fff',
        strokeWidth: 2,
        selectable: false,
        evented: false,
      });

      canvas.add(pointCircle);
      setTempPoints(prev => [...prev, pointCircle]);
      setDrawingPoints(prev => [...prev, newPoint]);
      canvas.renderAll();
    };

    const handleObjectSelection = (e: any) => {
      if (mode === 'design' && !isDrawingMode && e.selected) {
        const obj = e.selected[0];
        if ((obj as any).polygonType) {
          setSelectedPolygon(obj as Group);
        }
      }
    };

    if (isDrawingMode && mode === 'design') {
      canvas.on("mouse:down", handleCanvasClick);
      canvas.selection = false;
      canvas.forEachObject((obj) => {
        obj.selectable = false;
        obj.evented = false;
      });
    } else {
      canvas.off("mouse:down", handleCanvasClick);
      canvas.selection = mode === 'design';
      canvas.forEachObject((obj, index) => {
        // Keep background non-selectable
        if (index === 0) {
          obj.selectable = false;
          obj.evented = false;
        } else {
          obj.selectable = mode === 'design';
          obj.evented = mode === 'design';
        }
      });
    }

    canvas.on('selection:created', handleObjectSelection);
    canvas.on('selection:updated', handleObjectSelection);
    canvas.on('selection:cleared', () => setSelectedPolygon(null));

    canvas.renderAll();

    return () => {
      canvas.off("mouse:down", handleCanvasClick);
      canvas.off('selection:created', handleObjectSelection);
      canvas.off('selection:updated', handleObjectSelection);
      canvas.off('selection:cleared');
    };
  }, [isDrawingMode, canvas, currentDataType, mode]);

  const toggleDrawingMode = () => {
    if (isDrawingMode) {
      cancelPolygon();
    }
    setIsDrawingMode(!isDrawingMode);
  };

  const finishPolygon = () => {
    if (!canvas || drawingPoints.length < 3) {
      alert("You need at least 3 points to create a polygon!");
      return;
    }

    // Calculate bounding box
    const minX = Math.min(...drawingPoints.map(point => point.x));
    const minY = Math.min(...drawingPoints.map(point => point.y));
    const maxX = Math.max(...drawingPoints.map(point => point.x));
    const maxY = Math.max(...drawingPoints.map(point => point.y));

    // Create relative points for the polygon
    const relativePoints = drawingPoints.map(point => ({
      x: point.x - minX,
      y: point.y - minY,
    }));

    // Create the polygon
    const polygon = new Polygon(relativePoints, {
      left: minX,
      top: minY,
      fill: getTypeColor(currentDataType),
      stroke: getTypeColor(currentDataType),
      strokeWidth: 2,
      cornerStyle: "circle",
      cornerColor: getTypeColor(currentDataType),
      cornerSize: 8,
      transparentCorners: false,
    });

    // Group polygon and text
    const group = new Group([polygon], {
      left: minX,
      top: minY,
    });

    // Store metadata
    const polygonId = crypto.randomUUID();
    (group as any).polygonType = currentDataType;
    (group as any).polygonId = polygonId;

    canvas.add(group);
    canvas.renderAll();

    // Clean up
    cleanupDrawing();
    setIsDrawingMode(false);
    updatePolygonsList();
  };

  const cancelPolygon = () => {
    cleanupDrawing();
  };

  const cleanupDrawing = () => {
    if (!canvas) return;
    
    tempPoints.forEach(point => canvas.remove(point));
    setTempPoints([]);
    setDrawingPoints([]);
    canvas.renderAll();
  };

  const deleteSelected = () => {
    if (!canvas || !selectedPolygon) return;
    
    canvas.remove(selectedPolygon);
    setSelectedPolygon(null);
    canvas.renderAll();
    updatePolygonsList();
  };

  // const duplicateSelected = () => {
  //   if (!canvas || !selectedPolygon) return;

  //   selectedPolygon.clone((cloned: Group) => {
  //     cloned.set({
  //       left: (selectedPolygon.left || 0) + 20,
  //       top: (selectedPolygon.top || 0) + 20,
  //     });

  //     const newId = crypto.randomUUID();
  //     (cloned as any).polygonType = (selectedPolygon as any).polygonType;
  //     (cloned as any).polygonId = newId;

  //     canvas.add(cloned);
  //     canvas.renderAll();
  //     updatePolygonsList();
  //   });
  // };

  const updatePolygonsList = () => {
    if (!canvas) return;

    const polygonObjects = canvas.getObjects().filter(obj => 
      (obj as any).polygonType
    ) as Group[];

    const polygonsData: TypedPolygon[] = polygonObjects.map(group => ({
      id: (group as any).polygonId || crypto.randomUUID(),
      points: [], // Would need to extract from the polygon in the group
      type: (group as any).polygonType || "unknown",
      left: group.left || 0,
      top: group.top || 0,
    }));

    setSavedPolygons(polygonsData);
  };

  const saveTemplate = () => {
    if (!canvas) return;

    const templateData: Template = {
      id: crypto.randomUUID(),
      name: currentTemplate,
      polygons: savedPolygons,
      created: new Date().toISOString(),
    };

    localStorage.setItem(`template-${currentTemplate}`, JSON.stringify(templateData));
    alert("Template saved successfully!");
  };

  const loadTemplate = (templateName: string) => {
    const stored = localStorage.getItem(`template-${templateName}`);
    if (stored) {
      const template: Template = JSON.parse(stored);
      setCurrentTemplate(templateName);
      setSavedPolygons(template.polygons);
      // Here you would recreate the polygons on canvas
      alert("Template loaded!");
    }
  };

  const switchMode = (newMode: 'design' | 'schedule') => {
    if (isDrawingMode) {
      cancelPolygon();
      setIsDrawingMode(false);
    }
    setMode(newMode);
    updatePolygonsList();
  };

  const addCustomDataType = (typeName: string) => {
    if (typeName && !allDataTypes.includes(typeName)) {
      setCustomDataTypes(prev => [...prev, typeName]);
    }
  };

  const updateScheduleData = (dataType: string, value: string) => {
    setScheduleData(prev => ({ ...prev, [dataType]: value }));
    updatePolygonText(dataType, value);
  };

  const updatePolygonText = (dataType: string, value: string) => {
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
  };

  const generateScheduleInputs = () => {
    const polygonTypes = new Set<string>();
    
    if (canvas) {
      canvas.getObjects().forEach(obj => {
        const type = (obj as any).polygonType;
        if (type) polygonTypes.add(type);
      });
    }

    return Array.from(polygonTypes);
  };

  const getInputType = (dataType: string): string => {
    switch(dataType) {
      case 'datetime': return 'datetime-local';
      case 'notes': return 'textarea';
      case 'duration': return 'select';
      default: return 'text';
    }
  };

  const loadPreset = (presetType: string) => {
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
  };

  const clearAllScheduleData = () => {
    const emptyData: ScheduleData = {};
    generateScheduleInputs().forEach(type => {
      emptyData[type] = '';
    });
    
    setScheduleData(emptyData);
    Object.keys(emptyData).forEach(key => {
      updatePolygonText(key, '');
    });
  };

  const exportImage = () => {
    if (!canvas) return;
    
    // Hide selection indicators
    canvas.discardActiveObject();
    canvas.renderAll();
    
    // Export as image
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2,
    });
    
    // Create download link
    const link = document.createElement('a');
    link.download = `schedule-${new Date().toISOString().split('T')[0]}.png`;
    link.href = dataURL;
    link.click();
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-900 text-white">
      {/* Top Bar */}
      <div className="h-16 bg-gray-800 flex items-center justify-between px-6 border-b border-gray-700">
        <div className="flex gap-2">
          <Button
            onClick={() => switchMode('design')}
            variant={mode === 'design' ? 'default' : 'outline'}
            className={mode === 'design' ? 'bg-green-500 text-black' : ''}
          >
            🎨 Design Template
          </Button>
          <Button
            onClick={() => switchMode('schedule')}
            variant={mode === 'schedule' ? 'default' : 'outline'}
            className={mode === 'schedule' ? 'bg-green-500 text-black' : ''}
          >
            📅 Weekly Schedule
          </Button>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => {}}>
            Import Background
          </Button>
          <Button onClick={exportImage} className="bg-green-500 text-black hover:bg-green-600">
            Export PNG
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          {mode === 'design' ? (
            // Design Mode Panel
            <div className="p-6 space-y-6">
              {/* Data Type Selection */}
              <div>
                <h3 className="text-green-400 text-sm font-semibold uppercase tracking-wide mb-4">
                  Data Type
                </h3>
                <div className="grid grid-cols-2 gap-2 mb-4">
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
                  <input
                    type="text"
                    placeholder="Custom type..."
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addCustomDataType((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Custom type..."]') as HTMLInputElement;
                      if (input?.value) {
                        addCustomDataType(input.value);
                        input.value = '';
                      }
                    }}
                    className="bg-green-500 text-black text-xs px-3"
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Drawing Controls */}
              <div>
                <h3 className="text-green-400 text-sm font-semibold uppercase tracking-wide mb-4">
                  Drawing Mode
                </h3>
                <Button
                  onClick={toggleDrawingMode}
                  className={`w-full mb-3 ${
                    isDrawingMode 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-green-500 hover:bg-green-600 text-black'
                  }`}
                >
                  {isDrawingMode ? 'Exit Drawing Mode' : 'Start Drawing Polygon'}
                </Button>

                {isDrawingMode && (
                  <div className="bg-gray-700 border-2 border-green-500 rounded-lg p-4 text-center">
                    <p className="text-green-400 font-semibold mb-2">Drawing Mode Active</p>
                    <p className="text-sm text-gray-300 mb-3">
                      Click on canvas to add points for your <span className="text-green-400">{currentDataType}</span> polygon
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={finishPolygon}
                        disabled={drawingPoints.length < 3}
                        className="flex-1 bg-green-500 text-black"
                      >
                        Finish ({drawingPoints.length})
                      </Button>
                      <Button
                        onClick={cancelPolygon}
                        variant="destructive"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Polygon Management */}
              <div>
                <h3 className="text-green-400 text-sm font-semibold uppercase tracking-wide mb-4">
                  Template Polygons
                </h3>
                <div className="bg-gray-700 rounded-lg p-4 max-h-64 overflow-y-auto mb-4">
                  {savedPolygons.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center">No polygons yet</p>
                  ) : (
                    savedPolygons.map((polygon, index) => (
                      <div
                        key={polygon.id}
                        className={`flex justify-between items-center p-2 mb-2 bg-gray-600 rounded cursor-pointer ${
                          selectedPolygon && (selectedPolygon as any).polygonId === polygon.id
                            ? 'ring-2 ring-green-500'
                            : ''
                        }`}
                        style={{ borderLeft: `4px solid ${getTypeColor(polygon.type)}` }}
                      >
                        <span className="text-sm">{polygon.type}</span>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Delete specific polygon
                          }}
                          variant="destructive"
                          className="text-xs p-1 h-auto"
                        >
                          ×
                        </Button>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={deleteSelected}
                    disabled={!selectedPolygon}
                    variant="destructive"
                    className="flex-1"
                  >
                    Delete
                  </Button>
                </div>
              </div>

              {/* Template Management */}
              <div>
                <Button
                  onClick={saveTemplate}
                  className="w-full bg-green-500 text-black hover:bg-green-600"
                >
                  💾 Save Template
                </Button>
              </div>
            </div>
          ) : (
            // Schedule Mode Panel
            <div className="p-6 space-y-6">
              {/* Week Selection */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-green-400 text-sm font-semibold uppercase tracking-wide mb-3">
                  Week Selection
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <Button variant="outline" className="px-3">←</Button>
                  <input
                    type="date"
                    defaultValue="2025-06-09"
                    className="flex-1 px-3 py-2 bg-gray-600 border border-gray-500 rounded text-sm"
                  />
                  <Button variant="outline" className="px-3">→</Button>
                </div>
                <p className="text-xs text-gray-400">Week of June 9-15, 2025</p>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => loadPreset('gaming')}
                  variant="outline"
                  className="text-xs"
                >
                  Gaming Preset
                </Button>
                <Button
                  onClick={() => loadPreset('art')}
                  variant="outline"
                  className="text-xs"
                >
                  Art Preset
                </Button>
                <Button
                  onClick={clearAllScheduleData}
                  variant="outline"
                  className="text-xs"
                >
                  Clear All
                </Button>
                <Button
                  onClick={() => {
                    Object.keys(scheduleData).forEach(key => {
                      updatePolygonText(key, scheduleData[key]);
                    });
                  }}
                  className="bg-green-500 text-black text-xs"
                >
                  🚀 Update All
                </Button>
              </div>

              {/* Schedule Inputs */}
              <div className="space-y-3">
                {generateScheduleInputs().map(dataType => (
                  <div
                    key={dataType}
                    className="bg-gray-700 rounded-lg p-3"
                    style={{ borderLeft: `4px solid ${getTypeColor(dataType)}` }}
                  >
                    <label className="block text-xs text-gray-400 uppercase tracking-wide mb-2">
                      {dataType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </label>
                    
                    {getInputType(dataType) === 'textarea' ? (
                      <textarea
                        value={scheduleData[dataType] || ''}
                        onChange={(e) => updateScheduleData(dataType, e.target.value)}
                        placeholder={`Enter ${dataType}...`}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-sm resize-vertical min-h-[60px]"
                      />
                    ) : getInputType(dataType) === 'select' && dataType === 'duration' ? (
                      <select
                        value={scheduleData[dataType] || ''}
                        onChange={(e) => updateScheduleData(dataType, e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-sm"
                      >
                        <option value="">Select duration...</option>
                        <option value="1 hour">1 hour</option>
                        <option value="2 hours">2 hours</option>
                        <option value="3 hours">3 hours</option>
                        <option value="4 hours">4 hours</option>
                        <option value="All night">All night</option>
                      </select>
                    ) : (
                      <input
                        type={getInputType(dataType)}
                        value={scheduleData[dataType] || ''}
                        onChange={(e) => updateScheduleData(dataType, e.target.value)}
                        placeholder={`Enter ${dataType}...`}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-sm"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Generate Actions */}
              <div className="space-y-3">
                <Button
                  onClick={() => alert('Schedule image generated!')}
                  className="w-full bg-green-500 text-black hover:bg-green-600"
                >
                  📸 Generate Final Image
                </Button>
                <Button
                  onClick={() => alert('Week saved!')}
                  variant="outline"
                  className="w-full"
                >
                  💾 Save This Week
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-gray-900 flex items-center justify-center p-6">
          <div className="relative">
            <canvas
              ref={canvasRef}
              className={`rounded-lg border-2 ${
                isDrawingMode 
                  ? 'border-green-500 shadow-green-500/20 shadow-lg' 
                  : 'border-gray-600'
              } transition-all duration-300`}
            />
            
            {/* Canvas Status Overlay */}
            <div className="absolute top-3 right-3 bg-black/80 px-3 py-2 rounded text-sm">
              Template: {currentTemplate} | {savedPolygons.length} polygons
            </div>

            {isDrawingMode && (
              <div className="absolute top-3 left-3 bg-green-500/20 border border-green-500 px-3 py-2 rounded text-sm text-green-400">
                Drawing: {currentDataType} ({drawingPoints.length} points)
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}