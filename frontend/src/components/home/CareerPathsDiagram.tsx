"use client";

import { memo, useCallback, useMemo, useState } from "react";
import Image from "next/image";
import logo from "@/assets/logo.png";

// Types
interface CareerPath {
  id: number;
  label: string;
}

interface CareerNodeProps {
  children: React.ReactNode;
  className?: string;
  isHovered?: boolean;
  animationDelay?: number;
}

interface ConnectionLineProps {
  index: number;
  isHovered: boolean;
  svgCenter: number;
  centralIconRadius: number;
  radius: number;
  outerNodeRadius: number;
}

// Constants
const DIAGRAM_CONFIG = {
  radius: 180,
  centralIconRadius: 60,
  outerNodeRadius: 40,
  svgSize: 450,
  startAngle: -120,
  angleStep: 60,
} as const;

const CAREER_PATHS: readonly CareerPath[] = [
  { id: 1, label: "On The Field Staff" },
  { id: 2, label: "Player" },
  { id: 3, label: "Club" },
  { id: 4, label: "Office Staff" },
  { id: 5, label: "College & University" },
  { id: 6, label: "Agent" },
] as const;

// Career Node Component
const CareerNode = memo<CareerNodeProps>(
  ({ children, className = "", isHovered = false, animationDelay = 0 }) => (
    <div
      className={`
        backdrop-blur-sm rounded-full flex items-center gap-2 justify-center 
        transition-all duration-300 px-4 py-2 border
        ${
          isHovered
            ? "bg-yellow-100 border-yellow-400 scale-110 shadow-yellow-400/40 shadow-xl"
            : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-md animate-float"
        }
        ${className}
      `}
      style={{ animationDelay: `${animationDelay}s` }}
    >
      <span className="text-sm md:text-base font-medium text-gray-700 whitespace-nowrap">
        {children}
      </span>
    </div>
  )
);

CareerNode.displayName = "CareerNode";

// Connection Line Component
const ConnectionLine = memo<ConnectionLineProps>(
  ({
    index,
    isHovered,
    svgCenter,
    centralIconRadius,
    radius,
    outerNodeRadius,
  }) => {
    const angleInDegrees =
      DIAGRAM_CONFIG.startAngle + index * DIAGRAM_CONFIG.angleStep;
    const angleInRadians = (angleInDegrees * Math.PI) / 180;

    const startX = svgCenter + centralIconRadius * Math.cos(angleInRadians);
    const startY = svgCenter + centralIconRadius * Math.sin(angleInRadians);
    const endX =
      svgCenter + (radius - outerNodeRadius) * Math.cos(angleInRadians);
    const endY =
      svgCenter + (radius - outerNodeRadius) * Math.sin(angleInRadians);

    return (
      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        stroke={isHovered ? "#F59E0B" : "#9CA3AF"}
        strokeWidth="2"
        strokeDasharray="5,5"
        className="transition-all duration-300"
        style={{ opacity: isHovered ? 1 : 0.8 }}
      />
    );
  }
);

ConnectionLine.displayName = "ConnectionLine";

// Central Logo Component
const CentralLogo = memo(() => (
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
    <div className="relative w-32 h-32 animate-breathing-glow rounded-full">
      {/* Outer decorative rings */}
      <div className="absolute inset-0 rounded-full border border-gray-200 opacity-30 animate-pulse" />
      <div className="absolute inset-2 rounded-full border border-gray-300 opacity-40" />

      {/* Main circle with logo */}
      <div className="absolute inset-4 rounded-full flex items-center justify-center border border-gray-400">
        <Image src={logo} alt="JS Logo" width={80} height={80} priority />
      </div>
    </div>
  </div>
));

CentralLogo.displayName = "CentralLogo";

// Main Career Paths Diagram Component
export const CareerPathsDiagram = memo(() => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const handleMouseEnter = useCallback((id: number) => {
    setHoveredId(id);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredId(null);
  }, []);

  const { svgCenter } = useMemo(
    () => ({
      svgCenter: DIAGRAM_CONFIG.svgSize / 2,
    }),
    []
  );

  return (
    <div className="relative w-[300px] h-[300px]  md:w-[450px] md:h-[450px] scale-75 md:scale-90 lg:scale-100">
      {/* SVG for connecting lines */}
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${DIAGRAM_CONFIG.svgSize} ${DIAGRAM_CONFIG.svgSize}`}
        className="absolute top-0 left-0"
        aria-hidden="true"
      >
        <g>
          {CAREER_PATHS.map((path, i) => (
            <ConnectionLine
              key={`line-${path.id}`}
              index={i}
              isHovered={hoveredId === path.id}
              svgCenter={svgCenter}
              centralIconRadius={DIAGRAM_CONFIG.centralIconRadius}
              radius={DIAGRAM_CONFIG.radius}
              outerNodeRadius={DIAGRAM_CONFIG.outerNodeRadius}
            />
          ))}
        </g>
      </svg>

      {/* Center Logo */}
      <CentralLogo />

      {/* Career Path Nodes */}
      <div className="absolute top-1/2 left-1/2">
        {CAREER_PATHS.map((path, i) => {
          const angleInDegrees =
            DIAGRAM_CONFIG.startAngle + i * DIAGRAM_CONFIG.angleStep;
          const angleInRadians = (angleInDegrees * Math.PI) / 180;
          const x = DIAGRAM_CONFIG.radius * Math.cos(angleInRadians);
          const y = DIAGRAM_CONFIG.radius * Math.sin(angleInRadians);

          return (
            <div
              key={path.id}
              className="absolute z-10"
              style={{
                transform: `translate(${x}px, ${y}px)`,
              }}
              onMouseEnter={() => handleMouseEnter(path.id)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="-translate-x-1/2 -translate-y-1/2">
                <CareerNode
                  isHovered={hoveredId === path.id}
                  animationDelay={i * 0.2}
                >
                  {path.label}
                </CareerNode>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

CareerPathsDiagram.displayName = "CareerPathsDiagram";
