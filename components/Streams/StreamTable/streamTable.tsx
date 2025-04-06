"use client";
import React, { Dispatch, SetStateAction, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { columns, initialSortingState } from "./columns";
import { Stream, Streamer } from "../types";
import { useStreams } from "./utils/useStreams";
import { AddRow } from "./StreamComponents/AddRow";
import { Button } from "@/components/ui/button";
import { EditStreamModal } from "./StreamComponents/EditStreamModal";
import { DeleteConfirmationModal } from "./StreamComponents/DeleteConfirmationModal";
import { addWeeks, format } from "date-fns";
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { PageContainer } from "@/components/ui/page-container";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { deleteStreamAction } from "@/app/actions/streamActions";

export function StreamTable({
  guild,
  streamer,
  hasTwitchAuth,
  twitchBroadcasterId,
  setIsLoading,
  isLoading,
  setLoadingMessage,
  loadingMessage,
  apiBaseUrl,
}: {
  guild: string;
  streamer: Streamer;
  hasTwitchAuth: boolean;
  twitchBroadcasterId: string | null | undefined;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  isLoading: boolean;
  setLoadingMessage: Dispatch<SetStateAction<string>>;
  loadingMessage: string;
  apiBaseUrl: string;
}) {
  // State management
  const [data, setData] = React.useState<Stream[]>([]);
  const [editingStream, setEditingStream] = React.useState<Stream | null>(null);
  const [streamToDelete, setStreamToDelete] = React.useState<Stream | null>(
    null
  );
  const [dateRange, setDateRange] = React.useState<{ from: Date; to: Date }>({
    from: new Date(),
    to: addWeeks(new Date(), 2),
  });
  const [sorting, setSorting] =
    React.useState<SortingState>(initialSortingState);

  // Hooks and API calls
  const sid = streamer.streamer_id;

  const { fetchStreamsArb, deleteStream, updateStream } = useStreams(
    guild,
    sid,
    apiBaseUrl
  );

  // Stream operations handlers
  const handleEdit = (stream: Stream) => {
    setEditingStream(stream);
  };

  const handleSaveEdit = async (updatedStream: Stream) => {
    setEditingStream(null);
    setIsLoading(true);
    setLoadingMessage("Updating stream...");
    try {
      setData((prevData) =>
        prevData.map((value) => {
          if (value.stream_id == updatedStream.stream_id) {
            return updatedStream;
          } else {
            return value;
          }
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadStreams = async (from: Date, to: Date) => {
    setIsLoading(true);
    setLoadingMessage("Loading streams...");
    try {
      const streams = await fetchStreamsArb(from, to);
      if (streams) {
        setData(streams);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!streamToDelete) return;

    setIsLoading(true);
    setLoadingMessage("Deleting stream...");
    try {
      const streamId = streamToDelete.stream_id.toString();
      const success = await deleteStreamAction(streamId, guild);
      if (success) {
        setData((prevData) =>
          prevData.filter((stream) => stream.stream_id.toString() !== streamId)
        );
      }
    } finally {
      setStreamToDelete(null);
      setIsLoading(false);
    }
  };

  // Load streams when date range changes
  React.useEffect(() => {
    loadStreams(dateRange.from, dateRange.to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, guild]);

  // Table setup
  const table = useReactTable({
    data,
    columns: columns({
      onDelete: (stream) => setStreamToDelete(stream),
      onEdit: setEditingStream,
      broadcasterId: twitchBroadcasterId,
      guild: guild,
      hasTwitchAuth: hasTwitchAuth,
      apiBaseUrl: apiBaseUrl,
      twitchName: streamer.streamer_name,
    }),
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <PageContainer maxWidth="full">
      {/* Modals */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 shadow-xl flex items-center gap-3">
            <LoadingIndicator text={loadingMessage} />
          </div>
        </div>
      )}

      <EditStreamModal
        isOpen={!!editingStream}
        onClose={() => setEditingStream(null)}
        stream={editingStream}
        onSave={handleSaveEdit}
        guildId={guild}
      />

      <DeleteConfirmationModal
        isOpen={!!streamToDelete}
        onClose={() => setStreamToDelete(null)}
        stream={streamToDelete}
        onConfirm={handleConfirmDelete}
      />

      {/* Main content */}
      <Card className="border-none shadow-md">
        <CardHeader className="pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-semibold">
            Stream Schedule
          </CardTitle>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={{
                  from: dateRange.from,
                  to: dateRange.to,
                }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setDateRange({ from: range.from, to: range.to });
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="bg-slate-50 dark:bg-slate-800/50"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="font-semibold text-slate-700 dark:text-slate-300"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                <AddRow
                  guild={guild}
                  onStreamAdded={(stream) =>
                    setData((prev) => [...prev, stream])
                  }
                  setIsLoading={(loading) => {
                    setLoadingMessage(loading ? "Adding stream..." : "");
                    setIsLoading(loading);
                  }}
                  streamer={streamer}
                  hasTwitchAuth={hasTwitchAuth}
                  apiBaseUrl={apiBaseUrl}
                  twitchName={streamer.streamer_name}
                />
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-slate-500"
                    >
                      No streams scheduled.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t border-border">
              <div>
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="h-8 w-8 p-0"
                  variant="outline"
                  size="sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="h-8 w-8 p-0"
                  variant="outline"
                  size="sm"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
