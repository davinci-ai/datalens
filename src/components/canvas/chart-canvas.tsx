"use client";

import { useCallback } from "react";
import { GridLayout, type Layout, type LayoutItem } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import { useCanvasStore } from "@/stores/canvas-store";
import { ChartCardComponent } from "./chart-card";
import { ChartLoading } from "@/components/charts/chart-loading";
import { Card } from "@/components/ui/card";

interface ChartCanvasProps {
  onRefineChart?: (chartId: string) => void;
}

export function ChartCanvas({ onRefineChart }: ChartCanvasProps) {
  const charts = useCanvasStore((s) => s.charts);
  const isGenerating = useCanvasStore((s) => s.isGenerating);
  const updateLayouts = useCanvasStore((s) => s.updateLayouts);

  const layouts: LayoutItem[] = charts.map((c) => ({
    i: c.id,
    x: c.layout.x,
    y: c.layout.y,
    w: c.layout.w,
    h: c.layout.h,
    minW: 2,
    minH: 2,
  }));

  const handleLayoutChange = useCallback(
    (newLayout: Layout) => {
      updateLayouts([...newLayout]);
    },
    [updateLayouts]
  );

  if (charts.length === 0 && !isGenerating) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p className="text-sm">Charts will appear here after AI analysis</p>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-full">
      <GridLayout
        width={1200}
        layout={layouts}
        gridConfig={{ cols: 12, rowHeight: 80 }}
        dragConfig={{ handle: ".drag-handle" }}
        onLayoutChange={handleLayoutChange}
        compactor={undefined}
        autoSize
      >
        {charts.map((chart) => (
          <div key={chart.id}>
            <ChartCardComponent chart={chart} onRefine={onRefineChart} />
          </div>
        ))}
      </GridLayout>

      {isGenerating && (
        <div className="grid grid-cols-3 gap-4 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={`skeleton-${i}`} className="h-[320px]">
              <ChartLoading />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
