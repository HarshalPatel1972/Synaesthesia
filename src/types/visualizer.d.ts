export interface AudioData {
  frequencyData: Uint8Array;
  waveformData: Uint8Array;
  bass: number;
  mid: number;
  treble: number;
  amplitude: number;
  isActive: boolean;
}

export type RenderFn = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  audio: AudioData,
  time: number,
  frame: number
) => void;

export type VisualizerModeId = "VOID" | "AURORA" | "PRISM" | "ECHO" | "NEBULA";

export interface VisualizerMode {
  id: VisualizerModeId;
  label: string;
  render: RenderFn;
}
