export type ChartType =
  | "bar"
  | "line"
  | "scatter"
  | "histogram"
  | "area"
  | "heatmap"
  | "boxplot"
  | "pie";

export interface ChartEncoding {
  x?: string;
  y?: string;
  color?: string;
  size?: string;
  facet?: string;
  label?: string;
}

export interface ChartInstruction {
  id: string;
  title: string;
  description: string;
  sql: string;
  chartType: ChartType;
  encoding: ChartEncoding;
}

export interface ChartCard {
  id: string;
  instruction: ChartInstruction;
  layout: { x: number; y: number; w: number; h: number };
  error?: string;
}

export interface ChartAction {
  action: "add" | "modify" | "remove";
  chartId?: string;
  instruction?: ChartInstruction;
}
