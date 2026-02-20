"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { initMosaicCoordinator } from "@/lib/mosaic/coordinator";

interface MosaicContextValue {
  ready: boolean;
  error: string | null;
}

const MosaicContext = createContext<MosaicContextValue>({
  ready: false,
  error: null,
});

export function useMosaic() {
  return useContext(MosaicContext);
}

export function MosaicProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initMosaicCoordinator()
      .then(() => setReady(true))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  return (
    <MosaicContext.Provider value={{ ready, error }}>
      {children}
    </MosaicContext.Provider>
  );
}
