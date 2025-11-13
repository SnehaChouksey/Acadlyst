"use client";
import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, animate as fmAnimate } from 'framer-motion';
import { Youtube, FileText, Text, Bot, List, HelpCircle } from "lucide-react";

const SVG_WIDTH = 1500;
const SVG_HEIGHT = 600;
const CENTER = { x: 750, y: 300 };

const PATHS = [
  { d: `M 100 100 L 500 100 L ${CENTER.x} ${CENTER.y}` },
  { d: `M 100 130 L 500 130 L ${CENTER.x} ${CENTER.y}` },
  { d: `M -50 300 L 200 300 L ${CENTER.x} ${CENTER.y}` },
  { d: `M 100 450 L 500 450 L ${CENTER.x} ${CENTER.y}` },
  { d: `M 100 470 L 500 470 L ${CENTER.x} ${CENTER.y}` },
  { d: `M 100 490 L 500 490 L ${CENTER.x} ${CENTER.y}` },
  { d: `M ${CENTER.x} ${CENTER.y} L 1000 100 L 1400 100` },
  { d: `M ${CENTER.x} ${CENTER.y} L 1000 130 L 1400 130` },
  { d: `M ${CENTER.x} ${CENTER.y} L 1250 300 L 1550 300` },
  { d: `M ${CENTER.x} ${CENTER.y} L 1000 450 L 1400 450` },
  { d: `M ${CENTER.x} ${CENTER.y} L 1000 470 L 1400 470` },
  { d: `M ${CENTER.x} ${CENTER.y} L 1000 490 L 1400 490` }
];

const DOTS = [
  { x: 100, y: 100 },
  { x: 100, y: 130 },
  { x: -50, y: 300 },
  { x: 100, y: 450 },
  { x: 100, y: 470 },
  { x: 100, y: 490 },
  { x: 1400, y: 100 },
  { x: 1400, y: 130 },
  { x: 1550, y: 300 },
  { x: 1400, y: 450 },
  { x: 1400, y: 470 },
  { x: 1400, y: 490 }
];

const ICONS = [
  {
    x: 410, y: 120,
    icon: <FileText color="#E23B6D" size={38} strokeWidth={2.0} />,
    label: "PDF",
  },
  {
    x: 340, y: 300,
    icon: <Youtube color="#E23B6D" size={38} strokeWidth={2.0} />,
    label: "YouTube"
  },
  {
    x: 410, y: 470,
    icon: <Text color="#E23B6D" size={38} strokeWidth={2.0} />,
    label: "Text"
  },
  {
    x: 1090, y: 120,
    icon: <List color="#E23B6D" size={38} strokeWidth={2.0} />,
    label: "Summary"
  },
  {
    x: 1160, y: 300,
    icon: <Bot color="#E23B6D" size={38} strokeWidth={2.0} />,
    label: "Chatbot"
  },
  {
    x: 1090, y: 470,
    icon: <HelpCircle color="#E23B6D" size={38} strokeWidth={2.0} />,
    label: "Quiz"
  }
];

const ANIMATION_DURATION = 6;

const lineCss = `.workflow-dot { fill: #ff7ca3; filter: drop-shadow(0 0 10px #ff7ca3); }`;

interface WorkflowProps {
  children?: React.ReactNode;
}

const WorkflowComponent: React.FC<WorkflowProps> = ({ children }) => {
  const dashOffsets = PATHS.map(() => useMotionValue(0));
  const pathRefs = useRef<Record<number, SVGPathElement | null>>({});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const cleanups: (() => void)[] = [];
    PATHS.forEach((_, i) => {
      const path = pathRefs.current[i];
      if (path) {
        const length = path.getTotalLength();
        path.style.strokeDasharray = `${50} ${length}`;
        dashOffsets[i].set(length);
        const controls = fmAnimate(dashOffsets[i], -length, {
          duration: ANIMATION_DURATION,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
          delay: i * 0.14
        });
        cleanups.push(() => controls.stop());
      }
    });
    setIsReady(true);
    return () => cleanups.forEach(f => f());
  }, [dashOffsets]);

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <style>{lineCss}</style>
      <svg 
        width={SVG_WIDTH} 
        height={SVG_HEIGHT} 
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="w-full h-auto max-h-full"
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block' }}
      >
        {PATHS.map((p, i) => (
          <g key={i}>
            <path d={p.d} stroke="#e23b6d" strokeWidth="5.0" opacity="0.50" fill="none" />
            <motion.path
              ref={el => { pathRefs.current[i] = el }}
              d={p.d}
              stroke="url(#mainGradient)"
              strokeWidth={i === 6 || i === 8 ? 4 : 3}
              opacity={1}
              fill="none"
              style={{ strokeDashoffset: dashOffsets[i] }}
            />
          </g>
        ))}
        {DOTS.map((e, i) => <circle key={i} className="workflow-dot" cx={e.x} cy={e.y} r="6" />)}
        <defs>
          <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E23B6D" stopOpacity="0.6" />
            <stop offset="60%" stopColor="#FF7CA3" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#E23B6D" stopOpacity="0.7" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute" style={{
        left: `${(CENTER.x / SVG_WIDTH) * 100}%`,
        top: `${(CENTER.y / SVG_HEIGHT) * 100}%`,
        transform: 'translate(-50%, -50%)',
        width: '8%',
        aspectRatio: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '30%',
        background: "radial-gradient(ellipse at center,#ff7ca355,#e23b6d22 88%,transparent 99%)",
        boxShadow: "0 0 39px 15px #FF7CA333",
        zIndex: 20
      }}>
        {children ? (
          <div className="w-full h-full flex items-center justify-center">
            {children}
          </div>
        ) : (
          <Image
            src="/acadlyst_logo.png"
            alt="Acadlyst Logo"
            width={100}
            height={95}
            className="object-contain rounded-3xl border-2 border-[#ff7ca3]"
            style={{
              filter: "drop-shadow(0 0 10px #e23b6d99)",
              backgroundColor: "background"
            }}
            priority
          />
        )}
      </div>

      {ICONS.map((iconObj) => (
        <div
          key={iconObj.label}
          className="absolute flex items-center justify-center rounded-2xl bg-background border-2 border-[#E23B6D] z-10"
          style={{
            left: `${(iconObj.x / SVG_WIDTH) * 100}%`,
            top: `${(iconObj.y / SVG_HEIGHT) * 100}%`,
            transform: 'translate(-50%, -50%)',
            width: '3.8%',
            aspectRatio: '1',
            boxShadow: "0 0 22px #e23b6d77",
          }}
          title={iconObj.label}
        >
          <div className="scale-75 md:scale-90 lg:scale-100">
            {iconObj.icon}
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorkflowComponent;
