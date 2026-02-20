import type { ChartInstruction, ChartAction } from "@/types/chart";

export function parseChartInstructions(text: string): ChartInstruction[] {
  const cleaned = stripMarkdownFencing(text);

  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) {
      return parsed.filter(isValidChartInstruction).map(normalizeInstruction);
    }
    if (isValidChartInstruction(parsed)) {
      return [normalizeInstruction(parsed)];
    }
  } catch {
    // Try to extract JSON array from text
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        const arr = JSON.parse(match[0]);
        if (Array.isArray(arr)) {
          return arr.filter(isValidChartInstruction).map(normalizeInstruction);
        }
      } catch {
        // give up
      }
    }
  }

  return [];
}

export function parseChartActions(text: string): ChartAction[] {
  const cleaned = stripMarkdownFencing(text);

  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) {
      return parsed.filter(isValidChartAction);
    }
  } catch {
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        const arr = JSON.parse(match[0]);
        if (Array.isArray(arr)) {
          return arr.filter(isValidChartAction);
        }
      } catch {
        // give up
      }
    }
  }

  return [];
}

function stripMarkdownFencing(text: string): string {
  return text.replace(/^```(?:json)?\s*\n?/gm, "").replace(/\n?```\s*$/gm, "").trim();
}

function isValidChartInstruction(obj: unknown): obj is ChartInstruction {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.title === "string" &&
    typeof o.sql === "string" &&
    typeof o.chartType === "string" &&
    typeof o.encoding === "object" &&
    o.encoding !== null
  );
}

function isValidChartAction(obj: unknown): obj is ChartAction {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return typeof o.action === "string" && ["add", "modify", "remove"].includes(o.action);
}

function normalizeInstruction(instr: ChartInstruction): ChartInstruction {
  return {
    id: instr.id || `chart-${crypto.randomUUID().slice(0, 8)}`,
    title: instr.title,
    description: instr.description || "",
    sql: instr.sql,
    chartType: instr.chartType,
    encoding: instr.encoding || {},
  };
}
