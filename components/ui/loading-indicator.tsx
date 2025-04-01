import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function LoadingIndicator({
  size = "md",
  text,
  className,
  ...props
}: LoadingIndicatorProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 text-muted-foreground",
        className
      )}
      {...props}
    >
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      {text && <span className="text-sm">{text}</span>}
    </div>
  );
}
