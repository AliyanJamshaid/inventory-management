import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TimelineStep {
  label: string;
  status: "completed" | "current" | "upcoming";
  date?: string;
}

interface StatusTimelineProps {
  steps: TimelineStep[];
  className?: string;
}

export function StatusTimeline({ steps, className }: StatusTimelineProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {steps.map((step, index) => (
        <div key={index} className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2",
                step.status === "completed"
                  ? "border-green-500 bg-green-500 text-white"
                  : step.status === "current"
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-gray-300 bg-white text-gray-400"
              )}
            >
              {step.status === "completed" ? (
                <Check className="h-4 w-4" />
              ) : (
                <Circle className="h-3 w-3 fill-current" />
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "mt-1 h-12 w-0.5",
                  step.status === "completed" ? "bg-green-500" : "bg-gray-300"
                )}
              />
            )}
          </div>
          <div className="flex-1 pb-4">
            <p
              className={cn(
                "font-medium",
                step.status === "upcoming" ? "text-gray-500" : "text-gray-900"
              )}
            >
              {step.label}
            </p>
            {step.date && (
              <p className="text-sm text-gray-500">{step.date}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
