"use client";

import { create } from "zustand";
import type { ChartCard, ChartInstruction, ChartAction } from "@/types/chart";
import type { LayoutItem } from "react-grid-layout";

interface CanvasState {
  charts: ChartCard[];
  isGenerating: boolean;
  setCharts: (charts: ChartCard[]) => void;
  addChart: (instruction: ChartInstruction) => void;
  removeChart: (id: string) => void;
  updateChart: (id: string, instruction: ChartInstruction) => void;
  setChartError: (id: string, error: string) => void;
  clearChartError: (id: string) => void;
  updateLayouts: (layouts: LayoutItem[]) => void;
  applyActions: (actions: ChartAction[]) => void;
  setGenerating: (generating: boolean) => void;
  reset: () => void;
}

function assignLayout(index: number, total: number): ChartCard["layout"] {
  const cols = Math.min(total, 3);
  const w = Math.floor(12 / cols);
  const x = (index % cols) * w;
  const y = Math.floor(index / cols) * 4;
  return { x, y, w, h: 4 };
}

export const useCanvasStore = create<CanvasState>((set) => ({
  charts: [],
  isGenerating: false,

  setCharts: (charts) => set({ charts }),

  addChart: (instruction) =>
    set((state) => {
      const index = state.charts.length;
      const card: ChartCard = {
        id: instruction.id,
        instruction,
        layout: assignLayout(index, state.charts.length + 1),
      };
      return { charts: [...state.charts, card] };
    }),

  removeChart: (id) =>
    set((state) => ({
      charts: state.charts.filter((c) => c.id !== id),
    })),

  updateChart: (id, instruction) =>
    set((state) => ({
      charts: state.charts.map((c) =>
        c.id === id ? { ...c, instruction, error: undefined } : c
      ),
    })),

  setChartError: (id, error) =>
    set((state) => ({
      charts: state.charts.map((c) =>
        c.id === id ? { ...c, error } : c
      ),
    })),

  clearChartError: (id) =>
    set((state) => ({
      charts: state.charts.map((c) =>
        c.id === id ? { ...c, error: undefined } : c
      ),
    })),

  updateLayouts: (layouts) =>
    set((state) => ({
      charts: state.charts.map((chart) => {
        const l = layouts.find((lay) => lay.i === chart.id);
        if (!l) return chart;
        return { ...chart, layout: { x: l.x, y: l.y, w: l.w, h: l.h } };
      }),
    })),

  applyActions: (actions) =>
    set((state) => {
      let charts = [...state.charts];
      for (const action of actions) {
        switch (action.action) {
          case "add":
            if (action.instruction) {
              charts.push({
                id: action.instruction.id,
                instruction: action.instruction,
                layout: assignLayout(charts.length, charts.length + 1),
              });
            }
            break;
          case "modify":
            if (action.chartId && action.instruction) {
              charts = charts.map((c) =>
                c.id === action.chartId
                  ? { ...c, instruction: action.instruction!, error: undefined }
                  : c
              );
            }
            break;
          case "remove":
            if (action.chartId) {
              charts = charts.filter((c) => c.id !== action.chartId);
            }
            break;
        }
      }
      return { charts };
    }),

  setGenerating: (isGenerating) => set({ isGenerating }),
  reset: () => set({ charts: [], isGenerating: false }),
}));
