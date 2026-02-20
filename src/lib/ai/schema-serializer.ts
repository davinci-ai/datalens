import type { DataProfile } from "@/types/dataset";

export function serializeProfile(profile: DataProfile): string {
  const lines: string[] = [];

  lines.push(`## Dataset: ${profile.fileName}`);
  lines.push(`Rows: ${profile.rowCount.toLocaleString()} | Columns: ${profile.columnCount}`);
  lines.push("");

  // Column summary table
  lines.push("### Columns");
  lines.push(
    "| Column | Type | Unique | Null% | Min | Max | Mean | Top Values |"
  );
  lines.push(
    "|--------|------|--------|-------|-----|-----|------|------------|"
  );

  for (const col of profile.columns) {
    const s = col.stats;
    const topVals =
      s.topValues.length > 0
        ? s.topValues
            .slice(0, 3)
            .map((v) => `${v.value}(${v.count})`)
            .join(", ")
        : "-";

    lines.push(
      `| ${col.name} | ${col.type} | ${s.uniqueCount} | ${s.nullPercent.toFixed(1)}% | ${formatVal(s.min)} | ${formatVal(s.max)} | ${formatNum(s.mean)} | ${topVals} |`
    );
  }

  lines.push("");

  // Sample rows
  if (profile.sampleRows.length > 0) {
    lines.push("### Sample Rows (first 5)");
    const cols = profile.columns.map((c) => c.name);
    lines.push("| " + cols.join(" | ") + " |");
    lines.push("| " + cols.map(() => "---").join(" | ") + " |");

    for (const row of profile.sampleRows.slice(0, 5)) {
      lines.push(
        "| " + cols.map((c) => formatVal(row[c])).join(" | ") + " |"
      );
    }
  }

  return lines.join("\n");
}

function formatVal(v: unknown): string {
  if (v == null) return "-";
  const s = String(v);
  return s.length > 30 ? s.slice(0, 27) + "..." : s;
}

function formatNum(v: number | null): string {
  if (v == null) return "-";
  return Number.isInteger(v) ? v.toString() : v.toFixed(2);
}
