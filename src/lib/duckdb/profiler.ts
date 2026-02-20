"use client";

import type { DataProfile, ColumnInfo, ColumnStats } from "@/types/dataset";
import { runQuery } from "./queries";

export async function profileTable(
  tableName: string,
  fileName: string,
  fileSizeBytes: number
): Promise<DataProfile> {
  const describeRows = await runQuery(`DESCRIBE "${tableName}"`);

  const countRows = await runQuery(
    `SELECT COUNT(*) as cnt FROM "${tableName}"`
  );
  const rowCount = Number(countRows[0]?.cnt ?? 0);

  const sampleRows = await runQuery(
    `SELECT * FROM "${tableName}" USING SAMPLE 5`
  );

  const columns: ColumnInfo[] = await Promise.all(
    describeRows.map(async (row) => {
      const colName = String(row.column_name);
      const colType = String(row.column_type);
      const nullable = row.null !== "NO";

      const stats = await getColumnStats(tableName, colName, colType, rowCount);

      return {
        name: colName,
        type: colType,
        nullable,
        stats,
      };
    })
  );

  return {
    tableName,
    fileName,
    rowCount,
    columnCount: columns.length,
    columns,
    sampleRows,
    fileSizeBytes,
  };
}

async function getColumnStats(
  tableName: string,
  colName: string,
  colType: string,
  totalRows: number
): Promise<ColumnStats> {
  const escapedCol = `"${colName}"`;
  const isNumeric = /INT|FLOAT|DOUBLE|DECIMAL|NUMERIC|BIGINT|SMALLINT|TINYINT|REAL|HUGEINT/i.test(
    colType
  );

  let min: string | number | null = null;
  let max: string | number | null = null;
  let mean: number | null = null;
  let median: number | null = null;
  let std: number | null = null;

  if (isNumeric) {
    try {
      const statsRows = await runQuery(
        `SELECT
          MIN(${escapedCol}) as min_val,
          MAX(${escapedCol}) as max_val,
          AVG(${escapedCol})::DOUBLE as mean_val,
          MEDIAN(${escapedCol})::DOUBLE as median_val,
          STDDEV(${escapedCol})::DOUBLE as std_val
        FROM "${tableName}"`
      );
      const s = statsRows[0];
      min = s?.min_val != null ? Number(s.min_val) : null;
      max = s?.max_val != null ? Number(s.max_val) : null;
      mean = s?.mean_val != null ? Number(s.mean_val) : null;
      median = s?.median_val != null ? Number(s.median_val) : null;
      std = s?.std_val != null ? Number(s.std_val) : null;
    } catch {
      // stats unavailable
    }
  } else {
    try {
      const minMaxRows = await runQuery(
        `SELECT MIN(${escapedCol})::VARCHAR as min_val, MAX(${escapedCol})::VARCHAR as max_val FROM "${tableName}"`
      );
      min = minMaxRows[0]?.min_val as string | null;
      max = minMaxRows[0]?.max_val as string | null;
    } catch {
      // stats unavailable
    }
  }

  let nullCount = 0;
  try {
    const nullRows = await runQuery(
      `SELECT COUNT(*) as cnt FROM "${tableName}" WHERE ${escapedCol} IS NULL`
    );
    nullCount = Number(nullRows[0]?.cnt ?? 0);
  } catch {
    // ignore
  }

  let uniqueCount = 0;
  try {
    const uniqueRows = await runQuery(
      `SELECT COUNT(DISTINCT ${escapedCol}) as cnt FROM "${tableName}"`
    );
    uniqueCount = Number(uniqueRows[0]?.cnt ?? 0);
  } catch {
    // ignore
  }

  let topValues: { value: string; count: number }[] = [];
  if (uniqueCount <= 50 || !isNumeric) {
    try {
      const topRows = await runQuery(
        `SELECT ${escapedCol}::VARCHAR as val, COUNT(*) as cnt
         FROM "${tableName}"
         WHERE ${escapedCol} IS NOT NULL
         GROUP BY ${escapedCol}
         ORDER BY cnt DESC
         LIMIT 10`
      );
      topValues = topRows.map((r) => ({
        value: String(r.val),
        count: Number(r.cnt),
      }));
    } catch {
      // ignore
    }
  }

  return {
    min,
    max,
    mean,
    median,
    std,
    nullCount,
    nullPercent: totalRows > 0 ? (nullCount / totalRows) * 100 : 0,
    uniqueCount,
    topValues,
  };
}
