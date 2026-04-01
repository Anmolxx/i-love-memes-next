"use client";

import React, { useEffect, useState, useCallback } from "react";

interface StarryBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  height?: string | number;
  minHeight?: string | number;
}

export default function StarryBackground({
  className = "",
  children,
  height,
  minHeight,
}: StarryBackgroundProps) {
  const [stars, setStars] = useState<
    { cx: number; cy: number; r: number; opacity: number; delay: number }[]
  >([]);

  // Generate stars ON CLIENT ONLY
  useEffect(() => {
    const arr = [];
    for (let i = 0; i < 90; i++) {
      const cx = Math.random() * 120 - 10;
      const cy = Math.random() * 110 - 5;
      const r = Math.random() * 1.6 + 0.3;
      const opacity = 0.5 + Math.random() * 0.5;
      const delay = Math.random() * 6;
      arr.push({ cx, cy, r, opacity, delay });
    }
    setStars(arr);
  }, []);

  // Function to create a 5-point star path
  const starPath = useCallback((cx: number, cy: number, r: number) => {
    const rot = (Math.PI / 2) * 3;
    const step = Math.PI / 5;
    let p = "";
    let x = cx;
    let y = cy - r;
    p += `M ${x} ${y} `;
    for (let i = 0; i < 5; i++) {
      x = cx + Math.cos(rot + step * i * 2) * r;
      y = cy + Math.sin(rot + step * i * 2) * r;
      p += `L ${x} ${y} `;
      x = cx + Math.cos(rot + step * (i * 2 + 1)) * (r / 2.5);
      y = cy + Math.sin(rot + step * (i * 2 + 1)) * (r / 2.5);
      p += `L ${x} ${y} `;
    }
    p += "Z";
    return p;
  }, []);

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{
        height: height ? `${height}` : "auto",
        minHeight: minHeight || "auto",
      }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <linearGradient id="bgGradient" x1="1" x2="0" y1="0" y2="0">
            <stop offset="0%" stopColor="#E2E1FD" />
            <stop offset="100%" stopColor="#EFF2FC" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="100" height="100" fill="url(#bgGradient)" />

        {/* Render stars ONLY after client hydration */}
        {stars.map((s, i) => (
          <path
            key={i}
            d={starPath(s.cx, s.cy, s.r)}
            fill="#FFFFFF"
            opacity={s.opacity}
            style={{
              animation: `twinkle ${
                2.5 + (i % 7) * 0.35
              }s ease-in-out ${s.delay}s infinite, float ${
                5 + (i % 4)
              }s ease-in-out ${s.delay}s infinite`,
              transformOrigin: "center",
            }}
          />
        ))}
      </svg>

      <div className="relative z-10">{children}</div>

      <style>{`
        @keyframes twinkle {
          0% { opacity: 0.2; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.15); }
          100% { opacity: 0.25; transform: scale(0.95); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-1.5px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
}
