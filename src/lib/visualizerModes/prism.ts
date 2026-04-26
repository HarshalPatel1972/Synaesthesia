import { AudioData, RenderFn } from "@/types/visualizer";

export const renderPrism: RenderFn = (
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  audio: AudioData,
  time: number
) => {
  ctx.fillStyle = "rgba(0, 0, 5, 0.2)";
  ctx.fillRect(0, 0, W, H);

  const cx = W / 2;
  const cy = H / 2;
  const SYMMETRY = 8; // 8-fold mirror
  const sliceAngle = (Math.PI * 2) / SYMMETRY;

  // Base radius driven by amplitude
  const baseR = Math.min(W, H) * 0.12 * (1 + audio.amplitude * 2);

  ctx.save();
  ctx.translate(cx, cy);

  // Draw SYMMETRY mirrored slices
  for (let s = 0; s < SYMMETRY; s++) {
    ctx.save();
    ctx.rotate(s * sliceAngle + time * 0.0003 * (1 + audio.mid * 3));

    // Draw frequency-responsive radial lines
    const binCount = 60;
    for (let i = 0; i < binCount; i++) {
      const binVal = audio.frequencyData[i * 8] / 255;
      const angle = (i / binCount) * sliceAngle;
      const r1 = baseR;
      const r2 = baseR + binVal * (Math.min(W, H) * 0.3) * (1 + audio.bass * 1.5);

      const hue = 260 + (i / binCount) * 120 + audio.mid * 60;
      const alpha = 0.4 + binVal * 0.5;

      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
      ctx.lineTo(Math.cos(angle) * r2, Math.sin(angle) * r2);
      ctx.strokeStyle = `hsla(${hue}, 90%, 70%, ${alpha})`;
      ctx.lineWidth = 1 + binVal * 2;
      ctx.stroke();
    }

    // Bass: outer polygon ring
    const sides = 6 + Math.floor(audio.bass * 6);
    const outerR = baseR + Math.min(W, H) * 0.2 * (1 + audio.bass);
    ctx.beginPath();
    for (let v = 0; v <= sides; v++) {
      const a = (v / sides) * Math.PI * 2;
      const r = outerR * (1 + 0.2 * Math.sin(time * 0.002 + v));
      if (v === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.strokeStyle = `hsla(${280 + audio.bass * 60}, 100%, 80%, ${0.3 + audio.bass * 0.5})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  // Center orb
  const orbRadius = baseR * 0.4;
  const orbGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, orbRadius);
  orbGrad.addColorStop(0, `hsla(${270 + audio.mid * 60}, 100%, 90%, 0.9)`);
  orbGrad.addColorStop(1, `hsla(${270 + audio.mid * 60}, 100%, 50%, 0)`);
  ctx.beginPath();
  ctx.arc(0, 0, orbRadius, 0, Math.PI * 2);
  ctx.fillStyle = orbGrad;
  ctx.fill();

  ctx.restore();

  // Chromatic aberration on bass spike
  if (audio.bass > 0.65) {
    const offset = (audio.bass - 0.65) * 20;
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = 0.15;
    ctx.translate(-offset, 0);
    ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
    ctx.fillRect(0, 0, W, H);
    ctx.translate(offset * 2, 0);
    ctx.fillStyle = "rgba(0, 0, 255, 0.3)";
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
};
