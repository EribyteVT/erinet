"use client";

import React, { useState, useEffect, useRef } from "react";
import { Check, Plus } from "lucide-react";
import { POLYGON_TYPES, TYPE_COLORS } from "./types";

interface TypeSelectorProps {
  selectedPolygonType: string;
  setSelectedPolygonType: (type: string) => void;
  guildId?: string;
}

export const TypeSelector: React.FC<TypeSelectorProps> = ({
  selectedPolygonType,
  setSelectedPolygonType,
  guildId = "default",
}) => {
  const [customTypes, setCustomTypes] = useState<
    Array<{
      id: number;
      name: string;
      color: string;
      createdAt: string;
    }>
  >([]);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customTypeName, setCustomTypeName] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load custom types from localStorage
  useEffect(() => {
    const savedCustomTypes = localStorage.getItem(`custom-types-${guildId}`);
    if (savedCustomTypes) {
      setCustomTypes(JSON.parse(savedCustomTypes));
    }
  }, [guildId]);

  // Focus input when adding custom type
  useEffect(() => {
    if (isAddingCustom && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAddingCustom]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        setIsAddingCustom(false);
        setCustomTypeName("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Generate color for custom types
  const generateColor = (typeName: string): string => {
    let hash = 0;
    for (let i = 0; i < typeName.length; i++) {
      hash = typeName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  // Get color for any type
  const getTypeColor = (type: string): string => {
    if (TYPE_COLORS[type as keyof typeof TYPE_COLORS]) {
      return TYPE_COLORS[type as keyof typeof TYPE_COLORS];
    }
    const customType = customTypes.find((ct) => ct.name === type);
    return customType?.color || generateColor(type);
  };

  // Get all available types
  const getAllTypes = (): string[] => {
    return [...POLYGON_TYPES, ...customTypes.map((ct) => ct.name)];
  };

  // Save custom types to localStorage
  const saveCustomTypes = (types: typeof customTypes) => {
    localStorage.setItem(`custom-types-${guildId}`, JSON.stringify(types));
    setCustomTypes(types);
  };

  // Add new custom type
  const addCustomType = () => {
    const trimmedName = customTypeName.trim();
    if (trimmedName && !getAllTypes().includes(trimmedName)) {
      const newType = {
        id: Date.now(),
        name: trimmedName,
        color: generateColor(trimmedName),
        createdAt: new Date().toISOString(),
      };

      const newTypes = [...customTypes, newType];
      saveCustomTypes(newTypes);

      // Select the new type and close the input
      setSelectedPolygonType(trimmedName);
      setIsAddingCustom(false);
      setCustomTypeName("");
      setIsDropdownOpen(false);
    }
  };

  // Handle selecting a type
  const handleTypeSelect = (type: string) => {
    if (type === "__ADD_CUSTOM__") {
      setIsAddingCustom(true);
      setCustomTypeName("");
    } else {
      setSelectedPolygonType(type);
      setIsDropdownOpen(false);
      setIsAddingCustom(false);
    }
  };

  // Handle input key events
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addCustomType();
    } else if (e.key === "Escape") {
      setIsAddingCustom(false);
      setCustomTypeName("");
      setIsDropdownOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Type Display */}
      <div
        className="flex items-center gap-2 px-3 py-2 border rounded-md bg-white cursor-pointer hover:bg-gray-50 min-w-48"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <div
          className="w-4 h-4 rounded border"
          style={{ backgroundColor: getTypeColor(selectedPolygonType) }}
        />
        <span className="flex-1">{selectedPolygonType}</span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isDropdownOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
          {/* Default Types */}
          <div className="py-1">
            <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
              Default Types
            </div>
            {POLYGON_TYPES.map((type) => (
              <div
                key={type}
                className={`flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer ${
                  selectedPolygonType === type ? "bg-blue-50 text-blue-700" : ""
                }`}
                onClick={() => handleTypeSelect(type)}
              >
                <div
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: TYPE_COLORS[type] }}
                />
                <span>{type}</span>
                {selectedPolygonType === type && (
                  <Check className="w-4 h-4 ml-auto text-blue-600" />
                )}
              </div>
            ))}
          </div>

          {/* Custom Types */}
          {customTypes.length > 0 && (
            <div className="py-1 border-t">
              <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Custom Types
              </div>
              {customTypes.map((type) => (
                <div
                  key={type.id}
                  className={`flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer ${
                    selectedPolygonType === type.name
                      ? "bg-blue-50 text-blue-700"
                      : ""
                  }`}
                  onClick={() => handleTypeSelect(type.name)}
                >
                  <div
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: type.color }}
                  />
                  <span>{type.name}</span>
                  {selectedPolygonType === type.name && (
                    <Check className="w-4 h-4 ml-auto text-blue-600" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add Custom Type Section */}
          <div className="py-1 border-t">
            {!isAddingCustom ? (
              <div
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer text-blue-600"
                onClick={() => handleTypeSelect("__ADD_CUSTOM__")}
              >
                <Plus className="w-4 h-4" />
                <span>Add custom type...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50">
                <div className="w-4 h-4 rounded border bg-gray-200" />
                <input
                  ref={inputRef}
                  type="text"
                  value={customTypeName}
                  onChange={(e) => setCustomTypeName(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Enter type name..."
                  className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={addCustomType}
                  disabled={
                    !customTypeName.trim() ||
                    getAllTypes().includes(customTypeName.trim())
                  }
                  className="p-1 text-green-600 hover:bg-green-100 rounded disabled:text-gray-400 disabled:hover:bg-transparent"
                  title="Add type"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Validation message */}
            {isAddingCustom &&
              customTypeName.trim() &&
              getAllTypes().includes(customTypeName.trim()) && (
                <div className="px-3 py-1 text-xs text-red-500">
                  Type name already exists
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};
