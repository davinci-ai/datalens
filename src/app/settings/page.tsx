"use client";

import { useEffect } from "react";
import { ProviderForm } from "@/components/settings/provider-form";
import { useSettingsStore } from "@/stores/settings-store";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Database } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const loadFromStorage = useSettingsStore((s) => s.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Database className="h-4 w-4 text-primary" />
          <span className="font-semibold tracking-tight">DataLens</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm text-muted-foreground">Settings</span>
        </div>
      </header>

      <main className="flex-1 py-8">
        <div className="max-w-xl mx-auto px-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure your LLM provider for AI-powered chart generation.
            </p>
          </div>

          <ProviderForm />

          <div className="rounded-md border px-4 py-3 text-sm text-muted-foreground">
            <p>
              Your API credentials are stored in localStorage and sent
              per-request. They are never stored on any server.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
