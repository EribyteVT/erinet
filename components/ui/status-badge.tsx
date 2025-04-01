import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle, XCircle, Clock } from "lucide-react";

type StatusType = "success" | "warning" | "error" | "pending" | "info";

interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: StatusType;
  text?: string;
  showIcon?: boolean;
}

export function StatusBadge({
  status,
  text,
  showIcon = true,
  className,
  ...props
}: StatusBadgeProps) {
  const statusConfig = {
    success: {
      icon: CheckCircle,
      className:
        "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
    },
    warning: {
      icon: AlertCircle,
      className:
        "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
    },
    error: {
      icon: XCircle,
      className: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
    },
    pending: {
      icon: Clock,
      className:
        "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
    },
    info: {
      icon: AlertCircle,
      className:
        "bg-slate-50 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400",
    },
  };

  const { icon: Icon, className: statusClassName } = statusConfig[status];

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        statusClassName,
        className
      )}
      {...props}
    >
      {showIcon && <Icon className="mr-1 h-3.5 w-3.5" />}
      {text}
    </div>
  );
}
