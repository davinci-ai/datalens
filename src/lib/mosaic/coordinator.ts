"use client";

import { coordinator, wasmConnector } from "@uwdata/vgplot";
import { getDB } from "@/lib/duckdb/connection";

let initialized = false;

export async function initMosaicCoordinator(): Promise<void> {
  if (initialized) return;

  const db = await getDB();
  const conn = await db.connect();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wasm = wasmConnector({ connection: conn as any });
  coordinator().databaseConnector(wasm);
  initialized = true;
}

export function getMosaicCoordinator() {
  return coordinator();
}
