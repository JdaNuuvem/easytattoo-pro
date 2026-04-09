import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  loading?: boolean;
}

export function MetricCard({ title, value, icon: Icon, loading = false }: MetricCardProps) {
  return (
    <Card className="border-border hover:border-primary/30 hover:glow-magenta transition-all">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground normal-case tracking-normal">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">
          {loading ? (
            <span className="animate-pulse text-muted-foreground">--</span>
          ) : (
            value
          )}
        </div>
      </CardContent>
    </Card>
  );
}
