"use client";

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@radix-ui/react-collapsible";

import { ChevronDown, ChevronRight } from "lucide-react";

import { ReactElement, useState } from "react";

export default function ChangeLogItem({
  date,
  version,
  log_item,
}: {
  date: string;
  version: string;
  log_item: ReactElement;
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <h1>
            {date}-{version}
          </h1>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-9">{log_item}</div>
        </CollapsibleContent>
      </Collapsible>
    </>
  );
}
