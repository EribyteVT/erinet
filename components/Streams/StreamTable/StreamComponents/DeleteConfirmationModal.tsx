// components/Streams/StreamTable/StreamComponents/DeleteConfirmationModal.tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Stream } from "../../types";
import { Trash2, Calendar, AlertTriangle } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  stream: Stream | null;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  stream,
}: DeleteConfirmationModalProps) {
  if (!stream) return null;

  const hasExternalServices = stream.event_id || stream.twitch_segment_id;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" /> Delete Stream
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the stream &quot;
            {stream.stream_name}
            &quot;?
          </DialogDescription>
        </DialogHeader>

        {hasExternalServices && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-md p-3 my-2">
            <div className="flex items-start 1gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-300">
                  External services will be affected
                </p>
                <ul className="mt-2 text-sm space-y-1.5 text-amber-700 dark:text-amber-400">
                  {stream.event_id && (
                    <li className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> The associated Discord
                      event will be deleted
                    </li>
                  )}
                  {stream.twitch_segment_id && (
                    <li className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M11.64 5.93h1.43v4.28h-1.43m3.93-4.28H17v4.28h-1.43M7 2L3.43 5.57v12.86h4.28V22l3.58-3.57h2.85L20.57 12V2m-1.43 9.29l-2.85 2.85h-2.86l-2.5 2.5v-2.5H7.71V3.43h11.43Z" />
                      </svg>
                      The associated Twitch schedule segment will be deleted
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
