// components/image/components/TemplateSave.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTemplateSave } from "../hooks/useTemplateSave";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Save,
  Upload,
  Check,
  AlertCircle,
  Trash2,
  Info,
} from "lucide-react";

interface TemplateSaveProps {
  guildId: string; // This should be passed from your Discord integration
}

export function TemplateSave({ guildId }: TemplateSaveProps) {
  const {
    saveTemplate,
    loadTemplate,
    deleteTemplate,
    getTemplateInfo,
    applyTemplateToCanvas,
    extractPolygonData,
    isSaving,
    isLoading,
    isDeleting,
  } = useTemplateSave();

  const [templateName, setTemplateName] = useState("");
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [templateInfo, setTemplateInfo] = useState<{
    exists: boolean;
    templateName?: string;
    lastUpdated?: Date;
  }>({ exists: false });

  // Load template info on component mount
  useEffect(() => {
    const loadTemplateInfo = async () => {
      const info = await getTemplateInfo(guildId);
      if (info.success) {
        setTemplateInfo({
          exists: info.exists,
          templateName: info.templateName,
          lastUpdated: info.lastUpdated,
        });

        // Pre-fill template name if it exists
        if (info.templateName) {
          setTemplateName(info.templateName);
        }
      }
    };

    loadTemplateInfo();
  }, [guildId, getTemplateInfo]);

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      setMessage({ type: "error", text: "Please enter a template name" });
      return;
    }

    // Check if there are polygons to save
    const polygons = extractPolygonData();
    if (polygons.length === 0) {
      setMessage({
        type: "error",
        text: "No polygons found. Create some schedule areas first!",
      });
      return;
    }

    const result = await saveTemplate({
      guildId,
      templateName: templateName.trim(),
      backgroundUrl: backgroundUrl.trim() || undefined,
    });

    if (result.success) {
      setMessage({ type: "success", text: result.message });

      // Update template info
      setTemplateInfo({
        exists: true,
        templateName: templateName.trim(),
        lastUpdated: new Date(),
      });
    } else {
      setMessage({ type: "error", text: result.error });
    }
  };

  const handleLoadTemplate = async () => {
    const result = await loadTemplate(guildId);

    if (result.success && result.template) {
      const applied = await applyTemplateToCanvas(result.template);

      if (applied) {
        setMessage({ type: "success", text: "Template loaded successfully!" });

        // Update form fields with loaded template data
        if (result.template.template_name) {
          setTemplateName(result.template.template_name);
        }
        if (result.template.background_url) {
          setBackgroundUrl(result.template.background_url);
        }
      } else {
        setMessage({
          type: "error",
          text: "Failed to apply template to canvas",
        });
      }
    } else {
      setMessage({
        type: "error",
        text: "error",
      });
    }
  };

  const handleDeleteTemplate = async () => {
    if (
      !confirm(
        "Are you sure you want to delete your saved template? This action cannot be undone."
      )
    ) {
      return;
    }

    const result = await deleteTemplate(guildId);

    if (result.success) {
      setMessage({
        type: "success",
        text: result.message || "Template deleted successfully",
      });

      // Reset template info and form
      setTemplateInfo({ exists: false });
      setTemplateName("");
      setBackgroundUrl("");
    } else {
      setMessage({
        type: "error",
        text: result.error || "Failed to delete template",
      });
    }
  };

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const isAnyActionRunning = isSaving || isLoading || isDeleting;

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white text-lg">
          💾 Template Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Template Status Info */}
        {templateInfo.exists && (
          <Alert className="bg-blue-900/50 border-blue-600 text-blue-200">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p>
                  <strong>Saved Template:</strong>{" "}
                  {templateInfo.templateName || "Unnamed Template"}
                </p>
                {templateInfo.lastUpdated && (
                  <p className="text-sm opacity-80">
                    Last updated:{" "}
                    {new Date(templateInfo.lastUpdated).toLocaleString()}
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Status Message */}
        {message && (
          <Alert
            className={`${
              message.type === "success"
                ? "bg-green-900/50 border-green-600 text-green-200"
                : message.type === "info"
                ? "bg-blue-900/50 border-blue-600 text-blue-200"
                : "bg-red-900/50 border-red-600 text-red-200"
            }`}
          >
            {message.type === "success" ? (
              <Check className="h-4 w-4" />
            ) : message.type === "info" ? (
              <Info className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Template Name Input */}
        <div className="space-y-2">
          <Label
            htmlFor="templateName"
            className="text-sm font-medium text-gray-300"
          >
            Template Name
          </Label>
          <Input
            id="templateName"
            type="text"
            placeholder="My Streaming Schedule Template"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
            disabled={isAnyActionRunning}
          />
        </div>

        {/* Background URL Input (Optional) */}
        <div className="space-y-2">
          <Label
            htmlFor="backgroundUrl"
            className="text-sm font-medium text-gray-300"
          >
            Background Image URL (Optional)
          </Label>
          <Input
            id="backgroundUrl"
            type="url"
            placeholder="https://example.com/my-background.png"
            value={backgroundUrl}
            onChange={(e) => setBackgroundUrl(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
            disabled={isAnyActionRunning}
          />
          <p className="text-xs text-gray-400">
            Leave empty to save the current background image with the template
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            onClick={handleSaveTemplate}
            disabled={isAnyActionRunning || !templateName.trim()}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {templateInfo.exists
                  ? "Updating Template..."
                  : "Saving Template..."}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {templateInfo.exists ? "Update Template" : "Save Template"}
              </>
            )}
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleLoadTemplate}
              disabled={isAnyActionRunning || !templateInfo.exists}
              variant="outline"
              className="bg-gray-700 hover:bg-gray-600 border-gray-600 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Upload className="mr-1 h-4 w-4" />
                  Load Template
                </>
              )}
            </Button>

            <Button
              onClick={handleDeleteTemplate}
              disabled={isAnyActionRunning || !templateInfo.exists}
              variant="destructive"
              className="bg-red-600 hover:bg-red-500"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-1 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="text-xs text-gray-400 p-3 bg-gray-700/50 rounded border border-gray-600">
          <p className="font-medium mb-1">💡 How it works:</p>
          <ul className="space-y-1">
            <li>• Create polygons in Design Mode for your schedule areas</li>
            <li>• Save your layout as a reusable template</li>
            <li>
              • Load your template anytime to start with your saved layout
            </li>
            <li>• Each server can have one saved template</li>
            <li>
              • Templates include both polygon layouts and background images
            </li>
          </ul>
        </div>

        {/* Guild ID Info (for debugging - remove in production) */}
        {process.env.NODE_ENV === "development" && (
          <div className="text-xs text-gray-500 p-2 bg-gray-900/50 rounded">
            Guild ID: {guildId}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
