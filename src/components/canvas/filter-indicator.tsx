"use client";

import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { resetCrossfilter } from "@/lib/mosaic/selection-manager";

interface FilterIndicatorProps {
  activeFilters: number;
}

export function FilterIndicator({ activeFilters }: FilterIndicatorProps) {
  if (activeFilters === 0) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-md">
      <Filter className="h-3.5 w-3.5 text-muted-foreground" />
      <Badge variant="secondary" className="text-xs">
        {activeFilters} active filter{activeFilters !== 1 ? "s" : ""}
      </Badge>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-xs"
        onClick={() => {
          resetCrossfilter();
          window.location.reload();
        }}
      >
        <X className="h-3 w-3 mr-1" />
        Clear
      </Button>
    </div>
  );
}
