"use client";

import * as duckdb from "@duckdb/duckdb-wasm";
import { getDB, getConnection } from "./connection";

export async function loadFile(
  file: File,
  tableName: string
): Promise<void> {
  const db = await getDB();
  const conn = await getConnection();

  try {
    await db.registerFileHandle(
      file.name,
      file,
      duckdb.DuckDBDataProtocol.BROWSER_FILEREADER,
      true
    );

    const ext = file.name.split(".").pop()?.toLowerCase();

    if (ext === "parquet") {
      await conn.query(
        `CREATE OR REPLACE TABLE "${tableName}" AS SELECT * FROM read_parquet('${file.name}')`
      );
    } else if (ext === "tsv") {
      await conn.query(
        `CREATE OR REPLACE TABLE "${tableName}" AS SELECT * FROM read_csv_auto('${file.name}', delim='\t')`
      );
    } else {
      await conn.query(
        `CREATE OR REPLACE TABLE "${tableName}" AS SELECT * FROM read_csv_auto('${file.name}')`
      );
    }
  } finally {
    await conn.close();
  }
}

export async function runQuery(sql: string): Promise<Record<string, unknown>[]> {
  const conn = await getConnection();
  try {
    const result = await conn.query(sql);
    return result.toArray().map((row: Record<string, unknown>) => {
      const obj: Record<string, unknown> = {};
      for (const key of Object.keys(row)) {
        obj[key] = row[key];
      }
      return obj;
    });
  } finally {
    await conn.close();
  }
}

export async function getRowCount(tableName: string): Promise<number> {
  const rows = await runQuery(`SELECT COUNT(*) as cnt FROM "${tableName}"`);
  return Number(rows[0]?.cnt ?? 0);
}
