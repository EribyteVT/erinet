import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Stream } from "../../types";
import dayjs from "dayjs";
import { DateTimePicker } from "../../../ui/DateTimePicker";
import { Calendar, Clock, AlertCircle } from "lucide-react";

interface EditStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  stream: Stream | null;
  onSave: (updatedStream: Stream) => void;
}

export function EditStreamModal({
  isOpen,
  onClose,
  stream,
  onSave,
}: EditStreamModalProps) {
  const [date, setDate] = React.useState(new Date(stream?.stream_date || ""));

  const [time, setTime] = React.useState(
    dayjs(parseInt(stream?.stream_date || "") * 1000)
  );
  const [name, setName] = React.useState(stream?.stream_name || "");
  const [duration, setDuration] = React.useState(stream?.duration || "");

  React.useEffect(() => {
    if (stream) {
      let streamDate = new Date(stream.stream_date);

      setDate(streamDate);
      setTime(dayjs(streamDate));
      setName(stream.stream_name);
      setDuration(stream.duration || "");
    }
  }, [stream]);

  const handleSave = () => {
    if (stream) {
      //date only uses date, there is probably a better type for this, fuck you.
      date.setHours(0);
      date.setMinutes(0);
      date.setSeconds(0);
      date.setMilliseconds(0);

      const fullTime =
        Math.floor(date.getTime() / 1000) +
        time.hour() * 3600 +
        time.minute() * 60;

      console.log(fullTime);

      const updatedStream: Stream = {
        ...stream,
        stream_date: fullTime.toString(),
        stream_name: name,
        duration: Number.parseInt(
          duration == undefined ? "" : duration.toString()
        ),
      };
      onSave(updatedStream);
      onClose();
    }
  };

  if (!stream) return null;

  const hasExternalServices = stream.event_id || stream.twitch_segment_id;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-visible">
        <DialogHeader>
          <DialogTitle>Edit Stream</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="font-medium text-sm">
              Title
            </label>
            <Input
              id="title"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="datetime" className="font-medium text-sm">
              Time
            </label>
            <DateTimePicker
              date={date}
              setDate={setDate}
              time={time}
              setTime={setTime}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="duration" className="font-medium text-sm">
              Duration (minutes)
            </label>
            <Input
              id="duration"
              value={duration}
              type="number"
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          {/* External Services Update Notice */}
          {hasExternalServices && (
            <div className="col-span-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-md p-3 my-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-300">
                    External services will be updated
                  </p>
                  <ul className="mt-2 text-sm space-y-1.5 text-blue-700 dark:text-blue-400">
                    {stream.event_id && (
                      <li className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> The associated Discord
                        event will be updated
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
                        The associated Twitch schedule segment will be updated
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
