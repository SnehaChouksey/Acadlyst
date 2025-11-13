"use client";
import React, { useState, useEffect, useMemo } from "react";

// --- Type Definitions ---
interface ColorPalette {
  BACKGROUND_COLOR: string;
  LINE_OPACITY: number;
  LINE_COLOR_RGB: string; // Customizable RGB string (e.g., '255, 255, 255')
  DOT_COLOR: string;
  GLOW_COLOR: string;
}

type Mode = "dark" | "light";

// --- Configuration Constants ---
const GRID_SIZE = 80;
const DIAMOND_SIZE = 10;
const GRID_ROWS = 10;
const GRID_COLS = 18; // Increased for full horizontal coverage
const TOTAL_CELLS = GRID_ROWS * GRID_COLS;

// --- Color Palettes ---
const PALETTES: Record<Mode, ColorPalette> = {
  dark: {
    BACKGROUND_COLOR: "var(--background)",
    LINE_COLOR_RGB: "255, 255, 255",
    LINE_OPACITY: 0.1,
    DOT_COLOR: "rgba(255, 255, 255, 0.05)",
    GLOW_COLOR: "rgba(180, 180, 180, 0.3)",
  },
  light: {
    BACKGROUND_COLOR: "var(--background)",
    LINE_COLOR_RGB: "200, 150, 180",
    LINE_OPACITY: 0.18,
    DOT_COLOR: "rgba(200, 150, 180, 0.06)",
    GLOW_COLOR: "rgba(200, 150, 180, 0.3)",
  },
};

const DiamondGridBackground: React.FC<{ initialMode?: Mode }> = ({ initialMode = "dark" }) => {
  const [mode] = useState<Mode>(initialMode);
  const palette = PALETTES[mode];
  const { BACKGROUND_COLOR, LINE_OPACITY, LINE_COLOR_RGB, DOT_COLOR, GLOW_COLOR } = palette;
  const cells = useMemo(() => Array.from({ length: TOTAL_CELLS }), []);

  // --- SSR-safe defaults: no random diamonds, 0s delays ---
  const [diamondRenderFlags, setDiamondRenderFlags] = useState<boolean[]>(() => Array(TOTAL_CELLS).fill(false));
  const [diamondDelays, setDiamondDelays] = useState<string[]>(() => Array(TOTAL_CELLS).fill("0"));

  // --- On client, set random values after hydrate ---
  useEffect(() => {
    setDiamondRenderFlags(
      Array.from({ length: TOTAL_CELLS }).map((_, index) => {
        const row = Math.floor(index / GRID_COLS);
        if (row < 4) {
          // Randomly show diamonds in top 4 rows
          return Math.random() < 0.55;
        }
        return false;
      })
    );
    setDiamondDelays(
      Array.from({ length: TOTAL_CELLS }).map(() => (Math.random() * 4).toFixed(2))
    );
  }, []);

  // --- Custom Styles for Shapes and Animation ---
  const customStyles = useMemo(() => {
    const delayStyles = diamondDelays
      .map((d, i) => `.diamond-delay-${i} { animation-delay: ${d}s; }`)
      .join("\n");
    const colUnit = `${100 / GRID_COLS}vw`;
    return `
      @keyframes persistent-glow {
        0%, 100% {
          opacity: 0.5;
          box-shadow: 0 0 1px 0px ${GLOW_COLOR};
        }
        50% {
          opacity: 1;
          box-shadow: 0 0 4px 1px ${GLOW_COLOR}, 0 0 10px 4px ${GLOW_COLOR}30;
        }
      }
      .grid-container {
        display: grid;
        grid-template-columns: repeat(${GRID_COLS}, ${colUnit});
        grid-template-rows: repeat(${GRID_ROWS}, ${GRID_SIZE}px);
        transform: translate(-${GRID_SIZE / 2}px, -${GRID_SIZE / 2}px);
        width: calc(100% + ${GRID_SIZE}px);
        height: calc(100% + ${GRID_SIZE}px);
      }
      .grid-cell {
        position: relative;
        border-right: 1px solid rgba(${LINE_COLOR_RGB}, ${LINE_OPACITY});
        border-bottom: 1px solid rgba(${LINE_COLOR_RGB}, ${LINE_OPACITY});
        background-image: radial-gradient(${DOT_COLOR} 1px, transparent 0);
        background-size: 8px 8px;
        transition: all 0.5s ease;
      }
      .cell-opacity-100 { opacity: 1; }
      .cell-opacity-50  { opacity: 0.5; }
      .cell-opacity-0   { opacity: 0; }
      .diamond-glow {
        position: absolute;
        top: 0;
        left: 0;
        width: ${DIAMOND_SIZE}px;
        height: ${DIAMOND_SIZE}px;
        background-color: ${GLOW_COLOR};
        transform: translate(-50%, -50%) rotate(45deg);
        animation: persistent-glow 4s infinite ease-in-out alternate;
        border-radius: 1px;
      }
      ${delayStyles}
      .cleanup-gradient {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 40vh;
        background: linear-gradient(to top, var(--background) 0%, transparent 80%);
        pointer-events: none;
        z-index: 5;
      }
    `;
  }, [LINE_OPACITY, LINE_COLOR_RGB, DOT_COLOR, GLOW_COLOR, diamondDelays]);

  return (
    <div className="absolute inset-0 z-0 font-[Inter] overflow-hidden bg-background">
      <style>{customStyles}</style>
      <div className="grid-container absolute inset-0 z-0">
        {cells.map((_, index) => {
          const row = Math.floor(index / GRID_COLS);
          let cellOpacity = 1;
          if (row >= 4) {
            cellOpacity = 1 - (row - 4) * 0.5;
          }
          cellOpacity = Math.max(0, cellOpacity);
          const opacityClass = cellOpacity >= 1 ? 'cell-opacity-100' : cellOpacity >= 0.5 ? 'cell-opacity-50' : 'cell-opacity-0';
          const shouldRenderDiamond = diamondRenderFlags[index];
          return (
            <div key={index} className={`grid-cell ${opacityClass}`}>
              {shouldRenderDiamond && (
                <div className={`diamond-glow diamond-delay-${index}`}></div>
              )}
            </div>
          );
        })}
      </div>
      <div className="cleanup-gradient"></div>
    </div>
  );
};

export default DiamondGridBackground;
