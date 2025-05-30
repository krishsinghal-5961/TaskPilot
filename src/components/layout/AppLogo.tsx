import type { SVGProps } from "react";
import { GanttChartSquare } from "lucide-react";

export function AppLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center gap-2" aria-label="TaskPilot Logo">
      <GanttChartSquare className="h-7 w-7 text-primary" />
      <span className="text-xl font-semibold text-foreground">
        TaskPilot
      </span>
    </div>
  );
}
