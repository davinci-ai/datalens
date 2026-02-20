export interface ColumnStats {
  min: string | number | null;
  max: string | number | null;
  mean: number | null;
  median: number | null;
  std: number | null;
  nullCount: number;
  nullPercent: number;
  uniqueCount: number;
  topValues: { value: string; count: number }[];
}

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  stats: ColumnStats;
}

export interface DataProfile {
  tableName: string;
  fileName: string;
  rowCount: number;
  columnCount: number;
  columns: ColumnInfo[];
  sampleRows: Record<string, unknown>[];
  fileSizeBytes: number;
}
