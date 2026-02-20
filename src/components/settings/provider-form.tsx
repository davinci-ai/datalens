"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useSettingsStore } from "@/stores/settings-store";
import { CheckCircle2, XCircle, Loader2, Globe, Key, Cpu } from "lucide-react";

export function ProviderForm() {
  const {
    apiBaseUrl,
    authToken,
    modelName,
    setApiBaseUrl,
    setAuthToken,
    setModelName,
  } = useSettingsStore();

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    models?: string[];
  } | null>(null);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const url = apiBaseUrl.replace(/\/$/, "") + "/models";
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        setTestResult({
          success: false,
          message: `HTTP ${res.status}: ${res.statusText}`,
        });
        return;
      }

      const data = await res.json();
      const models: string[] = (data.data || data)
        .map((m: { id?: string; name?: string }) => m.id || m.name)
        .filter(Boolean);

      setTestResult({
        success: true,
        message: `Connected! Found ${models.length} model${models.length !== 1 ? "s" : ""}.`,
        models,
      });
    } catch (e) {
      setTestResult({
        success: false,
        message: e instanceof Error ? e.message : "Connection failed",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>LLM Provider</CardTitle>
        <CardDescription>
          Connect to an OpenAI-compatible API endpoint (OpenWebUI, OpenAI, etc.)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="base-url" className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5" />
            API Base URL
          </Label>
          <Input
            id="base-url"
            value={apiBaseUrl}
            onChange={(e) => setApiBaseUrl(e.target.value)}
            placeholder="https://your-openwebui.example.com/api/v1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="auth-token" className="flex items-center gap-2">
            <Key className="h-3.5 w-3.5" />
            Auth Token
          </Label>
          <Input
            id="auth-token"
            type="password"
            value={authToken}
            onChange={(e) => setAuthToken(e.target.value)}
            placeholder="JWT or API key"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="model-name" className="flex items-center gap-2">
            <Cpu className="h-3.5 w-3.5" />
            Model Name
          </Label>
          {testResult?.models && testResult.models.length > 0 ? (
            <select
              id="model-name"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Select a model...</option>
              {testResult.models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          ) : (
            <Input
              id="model-name"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="gpt-4o, llama3, etc."
            />
          )}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button
            onClick={handleTestConnection}
            disabled={testing || !apiBaseUrl || !authToken}
            variant="outline"
          >
            {testing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Test Connection
          </Button>

          {testResult && (
            <div className="flex items-center gap-1.5 text-sm">
              {testResult.success ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive" />
              )}
              <span
                className={
                  testResult.success ? "text-green-500" : "text-destructive"
                }
              >
                {testResult.message}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
