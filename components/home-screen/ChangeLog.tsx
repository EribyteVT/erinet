"use client";

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@radix-ui/react-collapsible";

import { ChevronDown, ChevronRight } from "lucide-react";

import { useState } from "react";
import ChangeLogItem from "./ChangeLogItem";

function BuildItem({ changelogitem }: { changelogitem: any }) {
  let x = (
    <ul className=" list-disc">
      {changelogitem.items.map((data: any) => (
        <li key={data}>{data}</li>
      ))}
    </ul>
  );

  return (
    <ChangeLogItem
      date={changelogitem.date}
      version={changelogitem.version}
      log_item={x}
    />
  );
}

function BuildList({ changelog }: { changelog: any[] }) {
  {
    console.log(changelog);
    return changelog.map((data: any) => (
      <>
        <BuildItem key={data.version} changelogitem={data} />
        <hr />
      </>
    ));
  }
}

export default function ChangeLog({ content }: { content: any }) {
  console.log(content.changelog);
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <h1 className=" text-2xl">Change log</h1>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <hr />
          <div className="px-3">
            <BuildList changelog={content.changelog} />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
