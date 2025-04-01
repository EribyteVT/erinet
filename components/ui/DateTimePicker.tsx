import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dayjs } from "dayjs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, Check } from "lucide-react";
import { format } from "date-fns";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimeField } from "@mui/x-date-pickers/TimeField";

export function DateTimePicker({
  date,
  setDate,
  time,
  setTime,
}: {
  date: Date;
  setDate: any;
  time: Dayjs;
  setTime: any;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") + "  " : <span>Pick a date</span>}

          {"  " + time ? (
            format(time.toDate(), "hh:mm aa")
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="grid grid-cols-3 items-center" align="start">
        {/* Calendar */}
        <div className="col-span-3">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => {
              setDate(newDate);
            }}
            initialFocus
          />
        </div>

        {/* Time Field and Button */}
        <div className="col-span-2 ">
          {/* Time Field */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimeField
              value={time}
              onChange={(newValue) => setTime(newValue)}
              className="flex-grow"
              sx={{
                "& .MuiInputBase-root": {
                  backgroundColor: "transparent",
                  color: "currentColor",
                  borderRadius: "0.375rem",
                  borderColor: "white",
                  borderWidth: "1px",
                },
                "& .MuiInputBase-input": {
                  color: "currentColor",
                  padding: "0.5rem",
                  borderColor: "white",
                },
              }}
              format="hh:mm a"
            />
          </LocalizationProvider>
        </div>

        {/* Confirm Button */}
        <div className="col-span-1">
          <Button
            onClick={() => setOpen(false)}
            className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            <Check></Check>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
