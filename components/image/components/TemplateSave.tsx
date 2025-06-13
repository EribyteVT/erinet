// components/image/components/TemplateSave.tsx - Updated with file upload
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Progress } from "@/components/ui/progress";
import {
  Save,
  Upload,
  Trash2,
  Info,
  Image as ImageIcon,
  X,
  FileImage,
} from "lucide-react";
import { useTemplateSave } from "../hooks/useTemplateSave";

interface TemplateInfo {
  exists: boolean;
  templateName?: string;
  lastUpdated?: Date;
  backgroundFile?: {
    name: string;
    path: string;
    size: number;
    type: string;
  };
}

interface Message {
  type: "success" | "error" | "info";
  text: string;
}

interface TemplateSaveProps {
  guildId: string;
}

export function TemplateSave({ guildId }: TemplateSaveProps) {
  const [templateName, setTemplateName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [templateInfo, setTemplateInfo] = useState<TemplateInfo>({
    exists: false,
  });
  const [message, setMessage] = useState<Message | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    saveTemplate,
    loadTemplate,
    deleteTemplate,
    getTemplateInfo,
    isSaving,
    isLoading,
    isDeleting,
    polygons,
  } = useTemplateSave();

  // Load template info on component mount
  useEffect(() => {
    const loadInfo = async () => {
      const info = await getTemplateInfo(guildId);
      if (info.success) {
        setTemplateInfo({
          exists: info.exists,
          templateName: info.templateName,
          lastUpdated: info.lastUpdated,
          backgroundFile: info.backgroundFile,
        });

        if (info.templateName) {
          setTemplateName(info.templateName);
        }

        // Set preview if background file exists
        if (info.backgroundFile) {
          setFilePreview(info.backgroundFile.path);
        }
      }
    };

    loadInfo();
  }, [guildId, getTemplateInfo]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setMessage({
        type: "error",
        text: "Please select an image file (JPEG, PNG, WebP)",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: "error",
        text: "File size must be less than 5MB",
      });
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setFilePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Clear any existing messages
    setMessage(null);
  };

  const uploadBackgroundImage = async (file: File): Promise<boolean> => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append("background", file);
      formData.append("guildId", guildId);

      const response = await fetch("/api/upload/background", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      setUploadProgress(100);
      return true;
    } catch (error) {
      console.error("Error uploading background:", error);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Upload failed",
      });
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteBackgroundImage = async () => {
    try {
      const response = await fetch(
        `/api/upload/background?guildId=${guildId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Delete failed");
      }

      setSelectedFile(null);
      setFilePreview(null);

      // Update template info
      setTemplateInfo((prev) => ({
        ...prev,
        backgroundFile: undefined,
      }));

      setMessage({
        type: "success",
        text: "Background image deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting background:", error);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Delete failed",
      });
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      setMessage({
        type: "error",
        text: "Please enter a template name",
      });
      return;
    }

    try {
      // Upload background image first if selected
      if (selectedFile) {
        const uploadSuccess = await uploadBackgroundImage(selectedFile);
        if (!uploadSuccess) {
          return; // Error message already set by uploadBackgroundImage
        }
      }

      // Create template data
      const templateData = {
        version: "2.0" as const,
        canvas: { width: 800, height: 600 }, // You should get these from your canvas
        scheduleDays: [],
        singularPolygons: polygons,
      };

      const result = await saveTemplate(
        {
          guildId,
          templateName,
        },
        templateData
      );

      if (result.success) {
        setMessage({
          type: "success",
          text: result.message || "Template saved successfully!",
        });

        // Update template info
        setTemplateInfo({
          exists: true,
          templateName,
          lastUpdated: new Date(),
          backgroundFile: selectedFile
            ? {
                name: selectedFile.name,
                path: filePreview || "",
                size: selectedFile.size,
                type: selectedFile.type,
              }
            : templateInfo.backgroundFile,
        });

        // Clear selected file
        setSelectedFile(null);
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to save template",
        });
      }
    } catch (error) {
      console.error("Error saving template:", error);
      setMessage({
        type: "error",
        text: "An unexpected error occurred",
      });
    }

    // Clear message after 5 seconds
    setTimeout(() => setMessage(null), 5000);
  };

  const handleLoadTemplate = async () => {
    const result = await loadTemplate(guildId);

    if (result.success) {
      setMessage({
        type: "success",
        text: "Template loaded successfully!",
      });

      if (result.template.template_name) {
        setTemplateName(result.template.template_name);
      }

      // Set preview if background image exists
      if (result.template.backgroundImage) {
        setFilePreview(result.template.backgroundImage);
      }
    } else {
      setMessage({
        type: "error",
        text: result.error || "Failed to load template",
      });
    }

    setTimeout(() => setMessage(null), 5000);
  };

  const handleDeleteTemplate = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this template? This action cannot be undone."
      )
    ) {
      return;
    }

    const result = await deleteTemplate(guildId);

    if (result.success) {
      setMessage({
        type: "success",
        text: "Template deleted successfully!",
      });

      // Reset form and template info
      setTemplateName("");
      setSelectedFile(null);
      setFilePreview(null);
      setTemplateInfo({ exists: false });
    } else {
      setMessage({
        type: "error",
        text: result.error || "Failed to delete template",
      });
    }

    setTimeout(() => setMessage(null), 5000);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Card className="bg-gray-700 border-gray-600 m-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-blue-400 text-sm font-semibold uppercase tracking-wide">
          Template Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Message Display */}
        {message && (
          <Alert
            className={`${
              message.type === "success"
                ? "bg-green-900/50 border-green-700 text-green-100"
                : message.type === "error"
                ? "bg-red-900/50 border-red-700 text-red-100"
                : "bg-blue-900/50 border-blue-700 text-blue-100"
            }`}
          >
            <Info className="h-4 w-4" />
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Template Info Display */}
        {templateInfo.exists && (
          <Alert className="bg-blue-900/50 border-blue-700">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-blue-100">
              Existing template: <strong>{templateInfo.templateName}</strong>
              {templateInfo.lastUpdated && (
                <div className="text-xs mt-1 text-blue-200">
                  Last updated: {templateInfo.lastUpdated.toLocaleString()}
                </div>
              )}
              {templateInfo.backgroundFile && (
                <div className="text-xs mt-1 text-blue-200">
                  Background: {templateInfo.backgroundFile.name} (
                  {formatFileSize(templateInfo.backgroundFile.size)})
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Template Name Input */}
        <div className="space-y-2">
          <Label htmlFor="templateName" className="text-gray-200">
            Template Name
          </Label>
          <Input
            id="templateName"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Enter template name..."
            className="bg-gray-600 border-gray-500 text-white"
          />
        </div>

        {/* Background Image Upload */}
        <div className="space-y-3">
          <Label className="text-gray-200">Background Image</Label>

          {/* File Upload Button */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="bg-gray-600 border-gray-500 text-gray-200 hover:bg-gray-500"
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {selectedFile || templateInfo.backgroundFile
                ? "Change Image"
                : "Upload Image"}
            </Button>

            {(templateInfo.backgroundFile || filePreview) && (
              <Button
                type="button"
                variant="outline"
                onClick={deleteBackgroundImage}
                className="bg-red-600 border-red-500 text-white hover:bg-red-500"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-300">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              {/* <Progress value={uploadProgress} className="w-full" /> */}
            </div>
          )}

          {/* File Preview */}
          {filePreview && (
            <div className="relative">
              <div className="border border-gray-500 rounded-lg p-2 bg-gray-600">
                <img
                  src={filePreview}
                  alt="Background preview"
                  className="max-w-full h-32 object-contain rounded"
                />
                {selectedFile && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-300">
                    <FileImage className="h-4 w-4" />
                    <span>{selectedFile.name}</span>
                    <span className="text-gray-400">
                      ({formatFileSize(selectedFile.size)})
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <p className="text-xs text-gray-400">
            Supported formats: JPEG, PNG, WebP. Maximum size: 5MB
          </p>
        </div>

        {/* Polygons Count Display */}
        <div className="text-sm text-gray-300">
          Current polygons:{" "}
          <span className="font-semibold">{polygons.length}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-2">
          <Button
            onClick={handleSaveTemplate}
            disabled={isSaving || !templateName.trim() || isUploading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isSaving ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </div>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Template
              </>
            )}
          </Button>

          {templateInfo.exists && (
            <>
              <Button
                onClick={handleLoadTemplate}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Loading...
                  </div>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Load Template
                  </>
                )}
              </Button>

              <Button
                onClick={handleDeleteTemplate}
                disabled={isDeleting}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </div>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Template
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
