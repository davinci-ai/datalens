"use client";

import { useCallback } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { SuggestionChips } from "./suggestion-chips";
import { useChatStore } from "@/stores/chat-store";
import { useDatasetStore } from "@/stores/dataset-store";
import { useCanvasStore } from "@/stores/canvas-store";
import { useSettingsStore } from "@/stores/settings-store";
import { serializeProfile } from "@/lib/ai/schema-serializer";
import { parseChartActions } from "@/lib/ai/response-parser";
import {
  REFINEMENT_SYSTEM_PROMPT,
  buildRefinementPrompt,
} from "@/lib/ai/prompts";
import { streamChat } from "@/lib/ai/client";
import { Sparkles } from "lucide-react";

interface AISidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contextChartId?: string;
}

export function AISidebar({ open, onOpenChange, contextChartId }: AISidebarProps) {
  const messages = useChatStore((s) => s.messages);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const addMessage = useChatStore((s) => s.addMessage);
  const setStreaming = useChatStore((s) => s.setStreaming);
  const updateLastAssistant = useChatStore((s) => s.updateLastAssistant);

  const profile = useDatasetStore((s) => s.profile);
  const charts = useCanvasStore((s) => s.charts);
  const applyActions = useCanvasStore((s) => s.applyActions);

  const settings = useSettingsStore();

  const handleSend = useCallback(
    async (text: string) => {
      if (!profile || !settings.isConfigured()) return;

      const userMsg = {
        id: crypto.randomUUID(),
        role: "user" as const,
        content: text,
        timestamp: Date.now(),
      };
      addMessage(userMsg);

      const assistantMsg = {
        id: crypto.randomUUID(),
        role: "assistant" as const,
        content: "",
        timestamp: Date.now(),
      };
      addMessage(assistantMsg);
      setStreaming(true);

      try {
        const schemaText = serializeProfile(profile);
        const currentChartsText = charts
          .map(
            (c) =>
              `- ${c.id}: "${c.instruction.title}" (${c.instruction.chartType}, SQL: ${c.instruction.sql})`
          )
          .join("\n");

        const contextPrefix = contextChartId
          ? `[Referring to chart: ${contextChartId}] `
          : "";

        const userPrompt = buildRefinementPrompt(
          schemaText,
          profile.tableName,
          currentChartsText,
          contextPrefix + text
        );

        const fullText = await streamChat(
          [{ role: "user", content: userPrompt }],
          REFINEMENT_SYSTEM_PROMPT,
          {
            baseUrl: settings.apiBaseUrl,
            token: settings.authToken,
            model: settings.modelName,
          },
          (chunk) => updateLastAssistant(chunk)
        );

        // Try to parse actions from the response
        const actions = parseChartActions(fullText);
        if (actions.length > 0) {
          applyActions(actions);
          updateLastAssistant(
            `Applied ${actions.length} chart update${actions.length !== 1 ? "s" : ""}: ${actions.map((a) => a.action).join(", ")}`
          );
        }
      } catch (e) {
        updateLastAssistant(
          `Error: ${e instanceof Error ? e.message : "Unknown error"}`
        );
      } finally {
        setStreaming(false);
      }
    },
    [
      profile,
      settings,
      charts,
      contextChartId,
      addMessage,
      setStreaming,
      updateLastAssistant,
      applyActions,
    ]
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[440px] flex flex-col p-0">
        <SheetHeader className="px-4 py-3 border-b">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4" />
            AI Assistant
          </SheetTitle>
        </SheetHeader>

        <ChatMessages messages={messages} />

        {profile && messages.length === 0 && (
          <SuggestionChips profile={profile} onSelect={handleSend} />
        )}

        <ChatInput onSend={handleSend} disabled={isStreaming || !settings.isConfigured()} />
      </SheetContent>
    </Sheet>
  );
}
