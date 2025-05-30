import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  footerText?: string;
  change?: string; // e.g., "+5.2%"
  changeType?: "positive" | "negative";
}

export function SummaryCard({ title, value, icon: Icon, footerText, change, changeType }: SummaryCardProps) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{value}</div>
        {(footerText || change) && (
          <p className="text-xs text-muted-foreground mt-1">
            {footerText}
            {change && (
              <span className={`ml-1 ${changeType === 'positive' ? 'text-green-600' : changeType === 'negative' ? 'text-red-600' : ''}`}>
                {change}
              </span>
            )}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
