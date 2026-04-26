import { VisualizerMode } from "@/types/visualizer";
import { renderVoid } from "./void";
import { renderAurora } from "./aurora";
import { renderPrism } from "./prism";
import { renderEcho } from "./echo";
import { renderNebula } from "./nebula";

export const VISUALIZER_MODES: VisualizerMode[] = [
  {
    id: "VOID",
    label: "Void",
    render: renderVoid,
  },
  {
    id: "AURORA",
    label: "Aurora",
    render: renderAurora,
  },
  {
    id: "PRISM",
    label: "Prism",
    render: renderPrism,
  },
  {
    id: "ECHO",
    label: "Echo",
    render: renderEcho,
  },
  {
    id: "NEBULA",
    label: "Nebula",
    render: renderNebula,
  },
];

export const DEFAULT_MODE = VISUALIZER_MODES[0];
