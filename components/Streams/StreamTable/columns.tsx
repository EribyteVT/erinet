"use client";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "../../ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { Stream } from "../types";
import SendStreamDiscordButton from "./StreamComponents/SendStreamDiscordButton";
import SendStreamTwitchButton from "./StreamComponents/SendStreamTwitchButton";

export const initialSortingState: SortingState = [
  {
    id: "stream_date",
    desc: false,
  },
];

export const columns = ({
  onDelete,
  onEdit,
  broadcasterId,
  guild,
  hasTwitchAuth,
  apiBaseUrl,
  twitchName,
}: {
  onDelete: (stream: Stream) => void;
  onEdit: (stream: Stream) => void;
  broadcasterId: string | null | undefined;
  guild: string;
  hasTwitchAuth: boolean;
  apiBaseUrl: string;
  twitchName: string;
}): ColumnDef<Stream>[] => [
  {
    accessorKey: "stream_id",
    header: "ID",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("stream_id")}</div>
    ),
  },
  {
    accessorKey: "stream_name",
    header: () => <div className="">Stream Name</div>,
    cell: ({ row }) => <div>{row.getValue("stream_name")}</div>,
  },
  {
    accessorKey: "stream_date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Time
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">
        {format(row.getValue("stream_date"), "MM/dd/yyyy hh:mm aa", {
          locale: enUS,
        })}
      </div>
    ),
  },
  {
    accessorKey: "duration",
    header: () => <div className="">Duration (minutes)</div>,
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("duration") + " minutes"}</div>
    ),
  },
  {
    accessorKey: "event_id",
    header: () => <div className="">Discord Event</div>,
    cell: ({ row }) => (
      <div className="font-medium">
        {
          <SendStreamDiscordButton
            stream={row.original}
            guild={guild}
            apiBaseUrl={apiBaseUrl}
            twitchName={twitchName}
          />
        }
      </div>
    ),
  },
  {
    accessorKey: "twitch_segment_id",
    header: () => <div className="">Twitch Event</div>,
    cell: ({ row }) => (
      <div className="font-medium">
        {
          <SendStreamTwitchButton
            stream={row.original}
            broadcasterId={broadcasterId}
            guild={guild}
            hasTwitchAuth={hasTwitchAuth}
            apiBaseUrl={apiBaseUrl}
          />
        }
      </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const stream = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(stream)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(stream)}
              className="text-red-600"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
