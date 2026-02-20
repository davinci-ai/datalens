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
    const { chartType, encoding, sql, title } = instruction;

    const from = `__chart_${instruction.id.replace(/[^a-zA-Z0-9]/g, "_")}`;

    const mark = buildMark(chartType, encoding, from, crossfilter);
    const width = container.clientWidth - 32;
    const height = container.clientHeight - 60;

    const plot = vg.plot(
      mark,
      vg.from(from, { filterBy: crossfilter }),
      vg.width(Math.max(200, width)),
      vg.height(Math.max(150, height)),
      vg.marginLeft(60),
      vg.marginBottom(40),
      ...(title ? [] : [])
    );

    // Register the SQL as a virtual table via the coordinator
    vg.coordinator().exec([
      `CREATE OR REPLACE VIEW "${from}" AS ${sql}`,
    ]);

    return { plot };
  } catch (e) {
    return { plot: null, error: String(e) };
  }
}

function buildMark(
  chartType: string,
  encoding: ChartInstruction["encoding"],
  from: string,
  crossfilter: Selection
): unknown {
  const opts: Record<string, unknown> = {};

  switch (chartType) {
    case "bar": {
      if (encoding.x && encoding.y) {
        opts.x = vg.column(encoding.x);
        opts.y = vg.column(encoding.y);
      }
      if (encoding.color) opts.fill = vg.column(encoding.color);
      return vg.barY(vg.from(from, { filterBy: crossfilter }), {
        ...opts,
        channels: encoding.x
          ? { select: vg.nearestX({ as: crossfilter }) }
          : undefined,
      });
    }

    case "line": {
      if (encoding.x) opts.x = vg.column(encoding.x);
      if (encoding.y) opts.y = vg.column(encoding.y);
      if (encoding.color) opts.stroke = vg.column(encoding.color);
      return vg.lineY(vg.from(from, { filterBy: crossfilter }), opts);
    }

    case "scatter": {
      if (encoding.x) opts.x = vg.column(encoding.x);
      if (encoding.y) opts.y = vg.column(encoding.y);
      if (encoding.color) opts.fill = vg.column(encoding.color);
      if (encoding.size) opts.r = vg.column(encoding.size);
      return vg.dot(vg.from(from, { filterBy: crossfilter }), opts);
    }

    case "histogram": {
      const col = encoding.x || encoding.y;
      if (col) {
        return vg.rectY(
          vg.from(from, { filterBy: crossfilter }),
          { x: vg.bin(vg.column(col)), y: vg.count(), fill: "steelblue" }
        );
      }
      return vg.rectY(vg.from(from, { filterBy: crossfilter }), {
        y: vg.count(),
        fill: "steelblue",
      });
    }

    case "area": {
      if (encoding.x) opts.x = vg.column(encoding.x);
      if (encoding.y) opts.y = vg.column(encoding.y);
      if (encoding.color) opts.fill = vg.column(encoding.color);
      return vg.areaY(vg.from(from, { filterBy: crossfilter }), opts);
    }

    case "heatmap": {
      if (encoding.x) opts.x = vg.column(encoding.x);
      if (encoding.y) opts.y = vg.column(encoding.y);
      return vg.rect(vg.from(from, { filterBy: crossfilter }), {
        ...opts,
        fill: vg.count(),
      });
    }

    case "boxplot": {
      // vgplot has no boxY — fall back to dotY for distribution view
      if (encoding.x) opts.x = vg.column(encoding.x);
      if (encoding.y) opts.y = vg.column(encoding.y);
      return vg.dotY(vg.from(from, { filterBy: crossfilter }), opts);
    }

    default: {
      // Fallback to bar
      if (encoding.x) opts.x = vg.column(encoding.x);
      if (encoding.y) opts.y = vg.column(encoding.y);
      return vg.barY(vg.from(from, { filterBy: crossfilter }), opts);
    }
  }
}
