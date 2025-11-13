"use client";
import React, { useState, useMemo } from 'react';

// --- Type Definitions ---
interface ColorPalette {
  BACKGROUND_COLOR: string;
  LINE_OPACITY: number;
  LINE_COLOR_RGB: string; // NEW: Customizable RGB string for grid lines (e.g., '0, 0, 0' or '255, 255, 255')
  DOT_COLOR: string;
  GLOW_COLOR: string;
}

type Mode = 'dark' | 'light';

// --- Configuration Constants ---
const GRID_SIZE = 80;
const DIAMOND_SIZE = 10;
const GRID_ROWS = 10;
const GRID_COLS = 18; // Increased for full horizontal coverage
const TOTAL_CELLS = GRID_ROWS * GRID_COLS;

// --- Color Palettes (BACKGROUND_COLOR is for internal fade/cleanup use only) ---
const PALETTES: Record<Mode, ColorPalette> = {
  dark: {
    BACKGROUND_COLOR: 'var(--background)',
    LINE_COLOR_RGB: '255, 255, 255',
    LINE_OPACITY: 0.1,
    DOT_COLOR: 'rgba(255, 255, 255, 0.05)',
    GLOW_COLOR: 'rgba(180, 180, 180, 0.3)',
  },
  light: {
    BACKGROUND_COLOR: 'var(--background)',
    // Match grid lines to the diamond glow color and increase opacity for visibility
    LINE_COLOR_RGB: '200, 150, 180', // same hue as GLOW_COLOR's rgb
    LINE_OPACITY: 0.18, // increase so lines are visible on light backgrounds
    DOT_COLOR: 'rgba(200, 150, 180, 0.06)', // subtle matching dots
    GLOW_COLOR: 'rgba(200, 150, 180, 0.3)',
  },
};

const DiamondGridBackground: React.FC<{ initialMode?: Mode }> = ({ initialMode = 'dark' }) => {
  // Mode state is necessary for the component to respond to color scheme changes
  const [mode, setMode] = useState<Mode>(initialMode);
  const palette = PALETTES[mode];
  const { BACKGROUND_COLOR, LINE_OPACITY, LINE_COLOR_RGB, DOT_COLOR, GLOW_COLOR } = palette;

  const cells = useMemo(() => Array.from({ length: TOTAL_CELLS }), []);

  // Generate delays for consistency (we will emit CSS classes for these delays)
  const diamondDelays = useMemo(() => {
    return Array.from({ length: TOTAL_CELLS }).map(() => (Math.random() * 4).toFixed(2));
  }, []);

  // --- Custom Styles for Shapes and Animation ---
  const customStyles = useMemo(() => {
    // Build per-diamond delay CSS rules to avoid inline style props
    const delayStyles = diamondDelays
      .map((d, i) => `.diamond-delay-${i} { animation-delay: ${d}s; }`)
      .join('\n');

    // Compute grid template column value in vw (static based on GRID_COLS)
    const colUnit = `${100 / GRID_COLS}vw`;

    return `
      /* Keyframes for a gentle, persistent pulse */
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

      /* Grid container (moved inline styles into CSS) */
      .grid-container {
        display: grid;
        grid-template-columns: repeat(${GRID_COLS}, ${colUnit});
        grid-template-rows: repeat(${GRID_ROWS}, ${GRID_SIZE}px);
        transform: translate(-${GRID_SIZE / 2}px, -${GRID_SIZE / 2}px);
        width: calc(100% + ${GRID_SIZE}px);
        height: calc(100% + ${GRID_SIZE}px);
      }

      /* Base Grid Cell Styling for straight lines and background dots */
      .grid-cell {
        position: relative;
        /* Line styling uses color based on PALETTES */
        border-right: 1px solid rgba(${LINE_COLOR_RGB}, ${LINE_OPACITY});
        border-bottom: 1px solid rgba(${LINE_COLOR_RGB}, ${LINE_OPACITY});
        
        /* Tiny background dots/stars texture */
        background-image: radial-gradient(${DOT_COLOR} 1px, transparent 0);
        background-size: 8px 8px;
        transition: all 0.5s ease; /* Add transition for smooth color changes */
      }

      /* Opacity helper classes to replace inline opacity */
      .cell-opacity-100 { opacity: 1; }
      .cell-opacity-50  { opacity: 0.5; }
      .cell-opacity-0   { opacity: 0; }

      /* Diamond Glow Styling */
      .diamond-glow {
        position: absolute;
        top: 0;
        left: 0;
        
        width: ${DIAMOND_SIZE}px;
        height: ${DIAMOND_SIZE}px;
        background-color: ${GLOW_COLOR};
        
        /* Center and rotate to form diamond */
        transform: translate(-50%, -50%) rotate(45deg); 
        
        /* Animation ensures visibility but subtle pulsing */
        animation: persistent-glow 4s infinite ease-in-out alternate;
        border-radius: 1px;
      }

      /* Per-diamond animation-delay classes (generated) */
      ${delayStyles}

      /* Cleanup Gradient */
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
    // Outer div takes fixed/absolute positioning from parent. It must be full screen.
    <div className="absolute inset-0 z-0 font-[Inter] overflow-hidden bg-background">
      
      <style>{customStyles}</style>

      {/* Grid Background Layer: Uses VW units for full width spanning */}
      <div className="grid-container absolute inset-0 z-0">
        {cells.map((_, index) => {
          const row = Math.floor(index / GRID_COLS);
          const col = index % GRID_COLS;
          
          // --- 1. Grid Line Fade Logic (starts at row 4) ---
          let cellOpacity = 1;
          // Fade starts at row 4 (5th line) and completes by row 6
          if (row >= 4) {
              cellOpacity = 1 - (row - 4) * 0.5; 
          }
          cellOpacity = Math.max(0, cellOpacity);

          // map opacity to one of our helper classes
          const opacityClass = cellOpacity >= 1 ? 'cell-opacity-100' : cellOpacity >= 0.5 ? 'cell-opacity-50' : 'cell-opacity-0';

          // --- 2. Diamond Pattern Logic (High density in rows 0, 1, 2, 3) ---
          let shouldRenderDiamond = false;
          
          if (row < 4) { // High density in the first four rows (0, 1, 2, 3)
            // 55% probability check for high density
            if (Math.random() < 0.55) {
                 shouldRenderDiamond = true;
            }
          } 
          // Rows 4 (5th line) and beyond have no diamonds.

          return (
            <div 
              key={index} 
              className={`grid-cell ${opacityClass}`} 
            >
              {shouldRenderDiamond && (
                <div 
                  className={`diamond-glow diamond-delay-${index}`}
                ></div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Cleanup Gradient */}
      <div className="cleanup-gradient"></div>
      
    </div>
  );
};

export default DiamondGridBackground;