import type { ElementType } from "react";

export interface SummaryCardProps {
  title: string;
  value: string;
  Icon: ElementType;
  alert?: boolean;
  statusDot?: boolean;
  statusColor?: string;
}

export function SummaryCard({
  title,
  value,
  Icon,
  alert = false,
  statusDot = false,
  statusColor = "bg-green-500",
}: SummaryCardProps) {
  return (
    <div
      className={`flex flex-col rounded-xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${alert ? "border-destructive/20" : ""}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
        <div
          className={`relative rounded-full p-2 ${alert ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}
        >
          <Icon className="h-4 w-4" />
          {statusDot ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${statusColor}`}
              />
              <span
                className={`relative inline-flex h-2.5 w-2.5 rounded-full ${statusColor}`}
              />
            </span>
          ) : null}
        </div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
