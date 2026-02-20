"use client";

import { Selection } from "@uwdata/vgplot";

let crossfilterSelection: Selection | null = null;

export function getCrossfilterSelection(): Selection {
  if (!crossfilterSelection) {
    crossfilterSelection = Selection.crossfilter();
  }
  return crossfilterSelection;
}

export function resetCrossfilter(): void {
  if (crossfilterSelection) {
    crossfilterSelection = Selection.crossfilter();
  }
}
