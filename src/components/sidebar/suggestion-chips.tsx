"use client";

import { Badge } from "@/components/ui/badge";
import type { DataProfile } from "@/types/dataset";

interface SuggestionChipsProps {
  profile: DataProfile;
  onSelect: (suggestion: string) => void;
}

export function SuggestionChips({ profile, onSelect }: SuggestionChipsProps) {
  const suggestions = generateSuggestions(profile);

  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 px-3 py-2">
      {suggestions.map((s) => (
        <Badge
          key={s}
          variant="outline"
          className="cursor-pointer hover:bg-primary/10 transition-colors text-xs"
          onClick={() => onSelect(s)}
        >
          {s}
        </Badge>
      ))}
    </div>
  );
}

function generateSuggestions(profile: DataProfile): string[] {
  const suggestions: string[] = [];

  const dateCol = profile.columns.find((c) =>
    /DATE|TIMESTAMP/i.test(c.type)
  );
  const numericCols = profile.columns.filter((c) =>
    /INT|FLOAT|DOUBLE|DECIMAL|NUMERIC/i.test(c.type)
  );
  const catCols = profile.columns.filter(
    (c) => c.type === "VARCHAR" && c.stats.uniqueCount <= 20
  );

  if (dateCol) {
    suggestions.push(`Trend over time by ${dateCol.name}`);
  }

  if (catCols.length > 0 && numericCols.length > 0) {
    suggestions.push(`Compare ${numericCols[0].name} by ${catCols[0].name}`);
  }

  if (numericCols.length >= 2) {
    suggestions.push(
      `Scatter plot: ${numericCols[0].name} vs ${numericCols[1].name}`
    );
  }

  if (numericCols.length > 0) {
    suggestions.push(`Distribution of ${numericCols[0].name}`);
  }

  if (catCols.length > 0) {
    suggestions.push(`Top ${catCols[0].name} categories`);
  }

  suggestions.push("Show correlations");
  suggestions.push("Add summary statistics");

  return suggestions.slice(0, 6);
}
