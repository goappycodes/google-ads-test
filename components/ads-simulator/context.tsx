"use client";

import React, { createContext, useContext } from "react";
import type { SimState, Campaign } from "./types";

export interface SimContextValue {
  state: SimState;
  setState: React.Dispatch<React.SetStateAction<SimState>>;
  patch: (partial: Partial<SimState>) => void;
  patchCampaign: (partial: Partial<Campaign>) => void;
  reset: () => void;
}

export const SimContext = createContext<SimContextValue | null>(null);

export function useSim(): SimContextValue {
  const ctx = useContext(SimContext);
  if (!ctx) throw new Error("useSim must be used inside <SimContext.Provider>");
  return ctx;
}
