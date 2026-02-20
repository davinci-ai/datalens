"use client";

import type { DataProfile } from "@/types/dataset";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  Hash,
  Calendar,
  ToggleLeft,
  Type,
} from "lucide-react";

interface SchemaPanelProps {
  profile: DataProfile;
}

const typeIcon: Record<string, React.ReactNode> = {
  VARCHAR: <Type className="h-3.5 w-3.5" />,
  INTEGER: <Hash className="h-3.5 w-3.5" />,
  BIGINT: <Hash className="h-3.5 w-3.5" />,
  DOUBLE: <Hash className="h-3.5 w-3.5" />,
  FLOAT: <Hash className="h-3.5 w-3.5" />,
  BOOLEAN: <ToggleLeft className="h-3.5 w-3.5" />,
  DATE: <Calendar className="h-3.5 w-3.5" />,
  TIMESTAMP: <Calendar className="h-3.5 w-3.5" />,
};

function getTypeIcon(type: string) {
  for (const [key, icon] of Object.entries(typeIcon)) {
    if (type.toUpperCase().includes(key)) return icon;
  }
  return <Table className="h-3.5 w-3.5" />;
}

export function SchemaPanel({ profile }: SchemaPanelProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Schema</h3>
        <span className="text-xs text-muted-foreground">
          {profile.rowCount.toLocaleString()} rows &middot;{" "}
          {profile.columnCount} cols
        </span>
      </div>

      <ScrollArea className="h-[calc(100vh-20rem)]">
        <div className="space-y-1.5">
          {profile.columns.map((col) => (
            <div
              key={col.name}
              className="flex items-start gap-2 rounded-md border px-3 py-2 text-sm"
            >
              <span className="mt-0.5 text-muted-foreground">
                {getTypeIcon(col.type)}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{col.name}</span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                    {col.type}
                  </Badge>
                </div>

                <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                  <span>{col.stats.uniqueCount} unique</span>
                  {col.stats.nullPercent > 0 && (
                    <span>{col.stats.nullPercent.toFixed(1)}% null</span>
                  )}
                  {col.stats.mean != null && (
                    <span>
                      avg {col.stats.mean.toFixed(2)}
                    </span>
                  )}
                </div>

                {col.stats.topValues.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {col.stats.topValues.slice(0, 4).map((tv) => (
                      <Badge
                        key={tv.value}
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 font-normal"
                      >
                        {tv.value.length > 15
                          ? tv.value.slice(0, 12) + "..."
                          : tv.value}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
