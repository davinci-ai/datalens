"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Dropzone } from "@/components/upload/dropzone";
import { useDatasetStore } from "@/stores/dataset-store";
import { useCanvasStore } from "@/stores/canvas-store";
import { useChatStore } from "@/stores/chat-store";
import { loadFile } from "@/lib/duckdb/queries";
import { profileTable } from "@/lib/duckdb/profiler";
import { Database, Sparkles, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const { isLoading, error, setProfile, setLoading, setError } =
    useDatasetStore();

  const handleFile = useCallback(
    async (file: File) => {
      setLoading(true);
      setError(null);

      // Reset other stores
      useCanvasStore.getState().reset();
      useChatStore.getState().reset();

      try {
        const tableName = file.name
          .replace(/\.[^.]+$/, "")
          .replace(/[^a-zA-Z0-9_]/g, "_");

        await loadFile(file, tableName);
        const profile = await profileTable(tableName, file.name, file.size);
        setProfile(profile);
        router.push("/explore");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load file");
      }
    },
    [setProfile, setLoading, setError, router]
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Database className="h-5 w-5 text-primary" />
            <span className="font-semibold text-lg tracking-tight">
              DataLens
            </span>
          </div>
          <Link href="/settings">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-1.5" />
              Settings
            </Button>
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-xl w-full space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Explore your data visually
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Drop a dataset and let AI generate insightful visualizations
              instantly. Refine with natural language.
            </p>
          </div>

          <Dropzone onFileAccepted={handleFile} isLoading={isLoading} />

          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <p className="text-xs text-center text-muted-foreground">
            All data stays in your browser. Nothing is uploaded to a server.
          </p>
        </div>
      </main>
    </div>
  );
}
