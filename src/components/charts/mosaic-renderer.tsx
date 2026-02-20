"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { ChartInstruction } from "@/types/chart";
import { buildMosaicPlot } from "@/lib/ai/chart-mapper";
import { getCrossfilterSelection } from "@/lib/mosaic/selection-manager";
import { ChartLoading } from "./chart-loading";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MosaicRendererProps {
  instruction: ChartInstruction;
  error?: string;
  onError?: (error: string) => void;
  onRetry?: () => void;
}

export function MosaicRenderer({
  instruction,
  error: externalError,
  onError,
  onRetry,
}: MosaicRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [renderError, setRenderError] = useState<string | null>(null);

  const displayError = externalError || renderError;

  const renderChart = useCallback(() => {
    if (!containerRef.current) return;

    setLoading(true);
    setRenderError(null);

    const container = containerRef.current;
    container.innerHTML = "";

    try {
      const crossfilter = getCrossfilterSelection();
      const { plot, error } = buildMosaicPlot(
        instruction,
        crossfilter,
        container
      );

      if (error) {
        setRenderError(error);
        onError?.(error);
        setLoading(false);
        return;
      }

      if (plot && plot instanceof Node) {
        container.appendChild(plot);
      }
      setLoading(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setRenderError(msg);
      onError?.(msg);
      setLoading(false);
    }
  }, [instruction, onError]);

  useEffect(() => {
    renderChart();
  }, [renderChart]);

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    let timeout: ReturnType<typeof setTimeout>;

    const observer = new ResizeObserver(() => {
      clearTimeout(timeout);
      timeout = setTimeout(renderChart, 150);
    });

    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [renderChart]);

  if (displayError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center space-y-3">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm text-destructive max-w-[250px] break-words">
          {displayError}
        </p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {loading && (
        <div className="absolute inset-0 z-10">
          <ChartLoading />
        </div>
      )}
      <div
        ref={containerRef}
        className="h-full w-full [&_svg]:max-w-full [&_svg]:h-auto"
      />
    </div>
  );
}
