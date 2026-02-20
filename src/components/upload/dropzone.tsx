"use client";

import { useCallback, useState } from "react";
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropzoneProps {
  onFileAccepted: (file: File) => void;
  isLoading?: boolean;
}

const ACCEPTED_TYPES = [".csv", ".tsv", ".parquet"];

export function Dropzone({ onFileAccepted, isLoading }: DropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && isAcceptedFile(file)) {
        onFileAccepted(file);
      }
    },
    [onFileAccepted]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && isAcceptedFile(file)) {
        onFileAccepted(file);
      }
    },
    [onFileAccepted]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-all cursor-pointer",
        isDragOver
          ? "border-primary bg-primary/5 scale-[1.02]"
          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
        isLoading && "pointer-events-none opacity-60"
      )}
    >
      <input
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isLoading}
      />

      {isLoading ? (
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
      ) : isDragOver ? (
        <FileSpreadsheet className="h-12 w-12 text-primary mb-4" />
      ) : (
        <Upload className="h-12 w-12 text-muted-foreground mb-4" />
      )}

      <h3 className="text-lg font-semibold mb-1">
        {isLoading
          ? "Loading dataset..."
          : isDragOver
            ? "Drop your file here"
            : "Drop a dataset to explore"}
      </h3>
      <p className="text-sm text-muted-foreground">
        CSV, TSV, or Parquet files
      </p>
    </div>
  );
}

function isAcceptedFile(file: File): boolean {
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  return ACCEPTED_TYPES.includes(ext);
}
