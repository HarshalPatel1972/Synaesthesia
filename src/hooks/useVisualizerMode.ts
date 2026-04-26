"use client";

import { useState, useCallback } from "react";
import { VISUALIZER_MODES, DEFAULT_MODE } from "@/lib/visualizerModes";
import { VisualizerModeId } from "@/types/visualizer";

export function useVisualizerMode() {
  const [activeModeId, setActiveModeId] = useState<VisualizerModeId>(DEFAULT_MODE.id);

  const activeMode = VISUALIZER_MODES.find(m => m.id === activeModeId) || DEFAULT_MODE;

  const setMode = useCallback((id: VisualizerModeId) => {
    setActiveModeId(id);
  }, []);

  return { activeMode, setMode, modes: VISUALIZER_MODES };
}
