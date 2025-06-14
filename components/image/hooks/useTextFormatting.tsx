// components/image/hooks/useTextFormatting.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

export type TextJustification = "left" | "center" | "right";
export type TimeFormat = "24" | "12";

interface TextFormatSettings {
  [dataType: string]: {
    fontSize: number;
    justification: TextJustification;
    timeFormat?: TimeFormat;
  };
}

interface TextFormattingContextType {
  textSettings: TextFormatSettings;
  updateTextSetting: (
    dataType: string,
    setting: "fontSize" | "justification" | "timeFormat",
    value: number | TextJustification | TimeFormat
  ) => void;
  getTextSettings: (dataType: string) => {
    fontSize: number;
    justification: TextJustification;
    timeFormat: TimeFormat;
  };
  resetTextSettings: () => void;
}

const defaultSettings = {
  fontSize: 16,
  justification: "center" as TextJustification,
  timeFormat: "24" as TimeFormat,
};

const TextFormattingContext = createContext<
  TextFormattingContextType | undefined
>(undefined);

export function TextFormattingProvider({ children }: { children: ReactNode }) {
  const [textSettings, setTextSettings] = useState<TextFormatSettings>({});

  const updateTextSetting = useCallback(
    (
      dataType: string,
      setting: "fontSize" | "justification" | "timeFormat",
      value: number | TextJustification | TimeFormat
    ) => {
      setTextSettings((prev) => ({
        ...prev,
        [dataType]: {
          ...defaultSettings,
          ...prev[dataType],
          [setting]: value,
        },
      }));
    },
    []
  );

  const getTextSettings = useCallback(
    (dataType: string) => {
      return {
        ...defaultSettings,
        ...textSettings[dataType],
      };
    },
    [textSettings]
  );

  const resetTextSettings = useCallback(() => {
    setTextSettings({});
  }, []);

  return (
    <TextFormattingContext.Provider
      value={{
        textSettings,
        updateTextSetting,
        getTextSettings,
        resetTextSettings,
      }}
    >
      {children}
    </TextFormattingContext.Provider>
  );
}

export function useTextFormatting() {
  const context = useContext(TextFormattingContext);
  if (context === undefined) {
    throw new Error(
      "useTextFormatting must be used within a TextFormattingProvider"
    );
  }
  return context;
}
