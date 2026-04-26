export function getBass(data: Uint8Array): number {
  // Bass: bins 0-10 (approx 20-250 Hz)
  const slice = data.slice(0, 10);
  return slice.reduce((a, b) => a + b, 0) / slice.length / 255;
}

export function getMid(data: Uint8Array): number {
  // Mid: bins 10-100 (approx 250Hz-2kHz)
  const slice = data.slice(10, 100);
  return slice.reduce((a, b) => a + b, 0) / slice.length / 255;
}

export function getTreble(data: Uint8Array): number {
  // Treble: bins 100-512 (approx 2kHz-20kHz)
  const slice = data.slice(100, 512);
  return slice.reduce((a, b) => a + b, 0) / slice.length / 255;
}

export function getAmplitude(data: Uint8Array): number {
  return data.reduce((a, b) => a + b, 0) / data.length / 255;
}

export function getRMS(waveData: Uint8Array): number {
  let sum = 0;
  for (let i = 0; i < waveData.length; i++) {
    const val = (waveData[i] - 128) / 128;
    sum += val * val;
  }
  return Math.sqrt(sum / waveData.length);
}
