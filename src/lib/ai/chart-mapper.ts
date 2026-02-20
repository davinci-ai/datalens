"use client";

import * as vg from "@uwdata/vgplot";
import type { ChartInstruction } from "@/types/chart";
import type { Selection } from "@uwdata/vgplot";

export interface MosaicChartSpec {
  plot: unknown;
  error?: string;
}

export function buildMosaicPlot(
  instruction: ChartInstruction,
  crossfilter: Selection,
  container: HTMLElement
): MosaicChartSpec {
  try {
    const { chartType, encoding, sql } = instruction;

    const viewName = `__chart_${instruction.id.replace(/[^a-zA-Z0-9]/g, "_")}`;

    // Register the SQL view BEFORE building the plot so data is available
    vg.coordinator().exec(
      `CREATE OR REPLACE VIEW "${viewName}" AS ${sql}`
    );

    const mark = buildMark(chartType, encoding, viewName, crossfilter);
    const width = container.clientWidth - 32;
    const height = container.clientHeight - 60;

    // plot() takes only directive functions — marks, attributes, etc.
    // Do NOT pass vg.from() here; it's only for mark constructors.
    const plot = vg.plot(
      mark,
      vg.width(Math.max(200, width)),
      vg.height(Math.max(150, height)),
      vg.marginLeft(60),
      vg.marginBottom(40)
    );

    return { plot };
  } catch (e) {
    return { plot: null, error: String(e) };
  }
}

function buildMark(
  chartType: string,
  encoding: ChartInstruction["encoding"],
  viewName: string,
  crossfilter: Selection
): unknown {
  const source = vg.from(viewName, { filterBy: crossfilter });
  const opts: Record<string, unknown> = {};

  switch (chartType) {
    case "bar": {
      if (encoding.x) opts.x = vg.column(encoding.x);
      if (encoding.y) opts.y = vg.column(encoding.y);
      if (encoding.color) opts.fill = vg.column(encoding.color);
      return vg.barY(source, opts);
    }

    case "line": {
      if (encoding.x) opts.x = vg.column(encoding.x);
      if (encoding.y) opts.y = vg.column(encoding.y);
      if (encoding.color) opts.stroke = vg.column(encoding.color);
      return vg.lineY(source, opts);
    }

    case "scatter": {
      if (encoding.x) opts.x = vg.column(encoding.x);
      if (encoding.y) opts.y = vg.column(encoding.y);
      if (encoding.color) opts.fill = vg.column(encoding.color);
      if (encoding.size) opts.r = vg.column(encoding.size);
      return vg.dot(source, opts);
    }

    case "histogram": {
      const col = encoding.x || encoding.y;
      if (col) {
        return vg.rectY(source, {
          x: vg.bin(vg.column(col)),
          y: vg.count(),
          fill: "steelblue",
        });
      }
      return vg.rectY(source, {
        y: vg.count(),
        fill: "steelblue",
      });
    }

    case "area": {
      if (encoding.x) opts.x = vg.column(encoding.x);
      if (encoding.y) opts.y = vg.column(encoding.y);
      if (encoding.color) opts.fill = vg.column(encoding.color);
      return vg.areaY(source, opts);
    }

    case "heatmap": {
      if (encoding.x) opts.x = vg.column(encoding.x);
      if (encoding.y) opts.y = vg.column(encoding.y);
      return vg.rect(source, {
        ...opts,
        fill: vg.count(),
      });
    }

    case "boxplot": {
      if (encoding.x) opts.x = vg.column(encoding.x);
      if (encoding.y) opts.y = vg.column(encoding.y);
      return vg.dotY(source, opts);
    }

    default: {
      if (encoding.x) opts.x = vg.column(encoding.x);
      if (encoding.y) opts.y = vg.column(encoding.y);
      return vg.barY(source, opts);
    }
  }
}
