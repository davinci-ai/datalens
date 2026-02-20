"use client";

import type { ChartCard as ChartCardType } from "@/types/chart";
import { Card } from "@/components/ui/card";
import { ChartCardHeader } from "./chart-card-header";
import { MosaicRenderer } from "@/components/charts/mosaic-renderer";
import { useCanvasStore } from "@/stores/canvas-store";

interface ChartCardProps {
  chart: ChartCardType;
  onRefine?: (chartId: string) => void;
}

export function ChartCardComponent({ chart, onRefine }: ChartCardProps) {
  const removeChart = useCanvasStore((s) => s.removeChart);
  const setChartError = useCanvasStore((s) => s.setChartError);

  const handleExport = () => {
    const card = document.getElementById(`chart-${chart.id}`);
    const svg = card?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const link = document.createElement("a");
      link.download = `${chart.instruction.title || "chart"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  return (
    <Card
      id={`chart-${chart.id}`}
      className="h-full flex flex-col overflow-hidden"
    >
      <ChartCardHeader
        title={chart.instruction.title}
        description={chart.instruction.description}
        onRefine={() => onRefine?.(chart.id)}
        onExport={handleExport}
        onDelete={() => removeChart(chart.id)}
      />
      <div className="flex-1 min-h-0 p-1">
        <MosaicRenderer
          instruction={chart.instruction}
          error={chart.error}
          onError={(err) => setChartError(chart.id, err)}
          onRetry={() => {
            useCanvasStore.getState().clearChartError(chart.id);
          }}
        />
      </div>
    </Card>
  );
}
