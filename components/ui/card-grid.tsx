import { cn } from "@/lib/utils";

interface CardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export function CardGrid({
  children,
  columns = {
    default: 1,
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4,
  },
  className,
  ...props
}: CardGridProps) {
  const { default: defaultCols, sm, md, lg, xl } = columns;

  const gridClasses = [
    `grid-cols-${defaultCols || 1}`,
    sm && `sm:grid-cols-${sm}`,
    md && `md:grid-cols-${md}`,
    lg && `lg:grid-cols-${lg}`,
    xl && `xl:grid-cols-${xl}`,
  ].filter(Boolean);

  return (
    <div className={cn("grid gap-4", ...gridClasses, className)} {...props}>
      {children}
    </div>
  );
}
