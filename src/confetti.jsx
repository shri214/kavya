// src/Confetti.jsx
import { useEffect, useRef } from "react";

export default function Confetti() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = Array.from({ length: 120 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      r: 6 + Math.random() * 8,
      color: ["#ff6b9d", "#ffd700", "#ff4081", "#7c4dff", "#00e5ff", "#ff6d00"][
        Math.floor(Math.random() * 6)
      ],
      speed: 2 + Math.random() * 4,
      swing: Math.random() * 2 - 1,
      angle: Math.random() * 360,
      spin: Math.random() * 4 - 2,
    }));

    let running = true;
    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 2);
        ctx.restore();
        p.y += p.speed;
        p.x += p.swing * 0.5;
        p.angle += p.spin;
        if (p.y > canvas.height) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
      });
      requestAnimationFrame(draw);
    }
    draw();
    return () => { running = false; };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 999,
      }}
    />
  );
}