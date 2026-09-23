import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { audioManager } from "../../audio/AudioManager";

export function LiveWave({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    let frame = 0;
    let running = true;

    const draw = () => {
      if (!running) return;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== Math.floor(width * ratio) || canvas.height !== Math.floor(height * ratio)) {
        canvas.width = Math.floor(width * ratio);
        canvas.height = Math.floor(height * ratio);
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      context.beginPath();
      context.strokeStyle = "#c6a36a";
      context.lineWidth = 1.25;
      const analyser = audioManager.getAnalyser();
      if (!analyser) {
        context.moveTo(0, height / 2);
        context.lineTo(width, height / 2);
      } else {
        const data = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(data);
        for (let i = 0; i < data.length; i++) {
          const x = (i / (data.length - 1)) * width;
          const y = (data[i] / 255) * height;
          if (i === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
      }
      context.stroke();
      if (!reduced) frame = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      running = false;
      cancelAnimationFrame(frame);
    };
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      className={`h-14 w-full ${className}`}
      aria-hidden="true"
    />
  );
}
