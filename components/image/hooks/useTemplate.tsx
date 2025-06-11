"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Group } from "fabric";
import { TypedPolygon } from "../types";
import { useCanvas } from "./useCanvas";

interface Template {
  id: string;
  name: string;
  polygons: TypedPolygon[];
  backgroundImage?: string;
  created: string;
}

interface TemplateContextType {
  currentTemplate: string;
  savedPolygons: TypedPolygon[];
  setCurrentTemplate: (name: string) => void;
  saveTemplate: () => void;
  loadTemplate: (templateName: string) => void;
  updatePolygonsList: () => void;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export function TemplateProvider({ children }: { children: ReactNode }) {
  const { canvas } = useCanvas();
  const [currentTemplate, setCurrentTemplate] = useState<string>("default");
  const [savedPolygons, setSavedPolygons] = useState<TypedPolygon[]>([]);

  const updatePolygonsList = useCallback(() => {
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
  }, [canvas]);

  const saveTemplate = useCallback(() => {
    if (!canvas) return;

    const templateData: Template = {
      id: crypto.randomUUID(),
      name: currentTemplate,
      polygons: savedPolygons,
      created: new Date().toISOString(),
    };

    localStorage.setItem(`template-${currentTemplate}`, JSON.stringify(templateData));
    alert("Template saved successfully!");
  }, [canvas, currentTemplate, savedPolygons]);

  const loadTemplate = useCallback((templateName: string) => {
    const stored = localStorage.getItem(`template-${templateName}`);
    if (stored) {
      const template: Template = JSON.parse(stored);
      setCurrentTemplate(templateName);
      setSavedPolygons(template.polygons);
      alert("Template loaded!");
    }
  }, []);

  return (
    <TemplateContext.Provider value={{
      currentTemplate,
      savedPolygons,
      setCurrentTemplate,
      saveTemplate,
      loadTemplate,
      updatePolygonsList
    }}>
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplate() {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    throw new Error('useTemplate must be used within a TemplateProvider');
  }
  return context;
}