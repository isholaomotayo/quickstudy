"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface MeshGradientProps {
  className?: string;
  colors: string[];
  speed?: number;
  opacity?: number;
  wireframe?: boolean;
  interactive?: boolean;
  id?: string;
}

// Static values to avoid hydration mismatches
const STATIC_POSITIONS = [
  { x: 50, y: 50, rx: 30, ry: 25, moveX: 8, moveY: -5 },
  { x: 35, y: 35, rx: 35, ry: 30, moveX: -6, moveY: 7 },
  { x: 65, y: 65, rx: 25, ry: 35, moveX: 4, moveY: -8 },
  { x: 20, y: 80, rx: 40, ry: 20, moveX: 10, moveY: -3 },
  { x: 80, y: 20, rx: 30, ry: 40, moveX: -7, moveY: 6 }
];

const FLOW_POSITIONS = [
  { x: 20, y: 20, r: 8, moveX: 25, moveY: 30 },
  { x: 50, y: 35, r: 11, moveX: -20, moveY: 25 },
  { x: 80, y: 50, r: 6, moveX: -30, moveY: -20 }
];

const ORBITAL_ELEMENTS = [
  { cx: 15, cy: 25, r: 3, orbitRadius: 15, speed: 20 },
  { cx: 85, cy: 75, r: 4, orbitRadius: 12, speed: 25 },
  { cx: 30, cy: 70, r: 2, orbitRadius: 18, speed: 18 },
  { cx: 70, cy: 30, r: 5, orbitRadius: 10, speed: 22 }
];

export function MeshGradient({
  className,
  colors,
  speed = 0.3,
  opacity = 1,
  wireframe = false,
  interactive = false,
  id = "mesh-gradient"
}: MeshGradientProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration issues by only running animations client-side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleMouseEnter = () => {
    if (interactive) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (interactive) setIsHovered(false);
  };

  return (
    <div
      className={cn("absolute inset-0", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ opacity }}
    >
      <svg
        ref={svgRef}
        className="w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Glass Distortion Filter */}
          <filter id={`${id}-glassDistortion`} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              baseFrequency="0.02 0.03"
              numOctaves="2"
              seed="2"
              stitchTiles="stitch"
            />
            <feDisplacementMap
              in="SourceGraphic"
              scale={isMounted && isHovered ? "8" : "4"}
            />
            <feGaussianBlur stdDeviation="0.5" />
          </filter>

          {/* Gooey Blur Filter */}
          <filter id={`${id}-gooeyBlur`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
            <feColorMatrix
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
            />
          </filter>

          {/* Static Radial Gradients */}
          {colors.map((color, index) => (
            <radialGradient
              key={`gradient-${index}`}
              id={`${id}-gradient-${index}`}
              cx="50%"
              cy="50%"
              r="60%"
            >
              <stop offset="0%" stopColor={color} stopOpacity={wireframe ? "0.3" : "0.8"} />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
              {isMounted && (
                <animateTransform
                  attributeName="gradientTransform"
                  type="rotate"
                  values={`${index * 72} 50 50;${index * 72 + 360} 50 50`}
                  dur={`${Math.round(20 / speed)}s`}
                  repeatCount="indefinite"
                />
              )}
            </radialGradient>
          ))}

          {/* Mesh Pattern for Wireframe */}
          {wireframe && (
            <pattern
              id={`${id}-mesh-pattern`}
              x="0"
              y="0"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 10 0 L 0 0 L 0 10"
                fill="none"
                stroke={colors[0] || "#000000"}
                strokeWidth="0.2"
                opacity="0.4"
              />
            </pattern>
          )}
        </defs>

        {/* Background */}
        <rect width="100" height="100" fill="transparent" />

        {/* Mesh Gradient Layers with enhanced motion */}
        {colors.map((_, index) => {
          const position = STATIC_POSITIONS[index % STATIC_POSITIONS.length];
          const delay = index * 0.5; // Stagger animations to prevent flickering
          return (
            <g key={`layer-${index}`}>
              <ellipse
                cx={position.x}
                cy={position.y}
                rx={position.rx}
                ry={position.ry}
                fill={`url(#${id}-gradient-${index})`}
                filter={`url(#${id}-glassDistortion)`}
                opacity={isMounted ? 1 : 0.8} // Prevent flickering during mount
              >
                {isMounted && (
                  <>
                    {/* Complex translation with figure-8 pattern */}
                    <animateTransform
                      attributeName="transform"
                      type="translate"
                      values={`0 0;${position.moveX} ${position.moveY};${-position.moveX/2} ${-position.moveY/2};${position.moveX/3} ${position.moveY/3};0 0`}
                      dur={`${Math.round((18 + index * 2) / speed)}s`}
                      repeatCount="indefinite"
                      begin={`${delay}s`}
                    />
                    {/* Breathing effect */}
                    <animate
                      attributeName="rx"
                      values={`${position.rx};${position.rx + 8};${position.rx - 3};${position.rx + 5};${position.rx}`}
                      dur={`${Math.round((14 + index) / speed)}s`}
                      repeatCount="indefinite"
                      begin={`${delay * 0.7}s`}
                    />
                    <animate
                      attributeName="ry"
                      values={`${position.ry};${position.ry - 4};${position.ry + 6};${position.ry - 2};${position.ry}`}
                      dur={`${Math.round((16 + index * 1.5) / speed)}s`}
                      repeatCount="indefinite"
                      begin={`${delay * 1.2}s`}
                    />
                    {/* Subtle opacity pulsing */}
                    <animate
                      attributeName="opacity"
                      values="0.7;1;0.8;0.9;0.7"
                      dur={`${Math.round((20 + index * 3) / speed)}s`}
                      repeatCount="indefinite"
                      begin={`${delay * 0.3}s`}
                    />
                  </>
                )}
              </ellipse>
            </g>
          );
        })}

        {/* Enhanced flowing elements with orbital motion */}
        <g filter={`url(#${id}-gooeyBlur)`}>
          {colors.slice(0, 3).map((color, index) => {
            const flowPos = FLOW_POSITIONS[index % FLOW_POSITIONS.length];
            const delay = index * 1.2;
            return (
              <circle
                key={`flow-${index}`}
                cx={flowPos.x}
                cy={flowPos.y}
                r={flowPos.r}
                fill={color}
                opacity={isMounted ? (wireframe ? "0.3" : "0.7") : "0.5"}
              >
                {isMounted && (
                  <>
                    {/* Smooth orbital motion */}
                    <animateTransform
                      attributeName="transform"
                      type="translate"
                      values={`0 0;${flowPos.moveX} ${flowPos.moveY};${flowPos.moveX * 1.5} ${-flowPos.moveY * 0.5};${-flowPos.moveX * 0.3} ${flowPos.moveY * 1.2};0 0`}
                      dur={`${Math.round((30 + index * 4) / speed)}s`}
                      repeatCount="indefinite"
                      begin={`${delay}s`}
                    />
                    {/* Size pulsing */}
                    <animate
                      attributeName="r"
                      values={`${flowPos.r};${flowPos.r + 6};${flowPos.r + 2};${flowPos.r + 8};${flowPos.r}`}
                      dur={`${Math.round((12 + index * 2) / speed)}s`}
                      repeatCount="indefinite"
                      begin={`${delay * 0.6}s`}
                    />
                  </>
                )}
              </circle>
            );
          })}
        </g>

        {/* New orbital elements for more dynamic motion */}
        {isMounted && (
          <g opacity="0.4">
            {ORBITAL_ELEMENTS.map((orbit, index) => (
              <circle
                key={`orbit-${index}`}
                cx={orbit.cx}
                cy={orbit.cy}
                r={orbit.r}
                fill={colors[index % colors.length]}
                opacity="0.6"
              >
                {/* Circular orbital motion */}
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values={`0 ${orbit.cx} ${orbit.cy};360 ${orbit.cx} ${orbit.cy}`}
                  dur={`${orbit.speed}s`}
                  repeatCount="indefinite"
                  begin={`${index * 2}s`}
                />
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values={`0 0;${orbit.orbitRadius} 0;0 ${orbit.orbitRadius};${-orbit.orbitRadius} 0;0 0`}
                  dur={`${orbit.speed * 1.3}s`}
                  repeatCount="indefinite"
                  begin={`${index * 1.5}s`}
                  additive="sum"
                />
                <animate
                  attributeName="r"
                  values={`${orbit.r};${orbit.r * 1.8};${orbit.r * 0.6};${orbit.r * 1.4};${orbit.r}`}
                  dur={`${orbit.speed * 0.7}s`}
                  repeatCount="indefinite"
                  begin={`${index * 0.8}s`}
                />
              </circle>
            ))}
          </g>
        )}

        {/* Wireframe Overlay */}
        {wireframe && (
          <rect
            width="100"
            height="100"
            fill={`url(#${id}-mesh-pattern)`}
            opacity="0.6"
          />
        )}

        {/* Interactive Enhancement */}
        {isMounted && interactive && isHovered && (
          <g>
            {colors.map((color, index) => (
              <circle
                key={`hover-${index}`}
                cx="50"
                cy="50"
                r="5"
                fill={color}
                opacity="0.8"
              >
                <animate
                  attributeName="r"
                  values="5;25;5"
                  dur="2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.8;0.2;0.8"
                  dur="2s"
                  repeatCount="indefinite"
                />
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values={`${index * 120} 50 50;${index * 120 + 360} 50 50`}
                  dur="3s"
                  repeatCount="indefinite"
                />
              </circle>
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}

export function DynamicShaderBackground({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div
      className={cn("relative min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 overflow-hidden", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      suppressHydrationWarning
    >
      {/* Base Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100"></div>

      {/* Primary Mesh Gradient Layer - Bright Natural Colors */}
      <MeshGradient
        id="primary-mesh"
        className="z-0"
        colors={["#e0f2fe", "#bfdbfe", "#c7d2fe", "#ddd6fe", "#e9d5ff"]} // Light blues and purples
        speed={0.3}
        opacity={0.9}
        interactive={true}
      />

      {/* Secondary Mesh Gradient Layer - Warm Accents */}
      <MeshGradient
        id="secondary-mesh"
        className="z-10"
        colors={["#fef3c7", "#fed7aa", "#fbb6ce"]} // Warm yellows, oranges, and pinks
        speed={0.25}
        opacity={0.5}
        wireframe={false}
        interactive={true}
      />

      {/* Tertiary Layer - Soft Greens for Natural Feel */}
      <MeshGradient
        id="tertiary-mesh"
        className="z-20"
        colors={["#dcfce7", "#bbf7d0", "#a7f3d0"]} // Soft greens
        speed={0.2}
        opacity={0.4}
        wireframe={true}
        interactive={true}
      />

      {/* Quaternary Layer - Additional Motion */}
      <MeshGradient
        id="quaternary-mesh"
        className="z-5"
        colors={["#fde68a", "#fbbf24", "#f59e0b"]} // Golden yellows
        speed={0.35}
        opacity={0.25}
        wireframe={false}
        interactive={true}
      />

      {/* Enhanced Animated Particle System */}
      {isMounted && (
        <>
          {/* Primary particle layer */}
          <div className="absolute inset-0 z-30 opacity-40">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.18) 0%, transparent 40%),
                  radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.15) 0%, transparent 35%),
                  radial-gradient(circle at 40% 80%, rgba(34, 197, 94, 0.12) 0%, transparent 45%),
                  radial-gradient(circle at 70% 70%, rgba(251, 146, 60, 0.1) 0%, transparent 30%),
                  radial-gradient(circle at 15% 85%, rgba(236, 72, 153, 0.12) 0%, transparent 40%)
                `,
                animation: 'gentleFloat 20s ease-in-out infinite',
              }}
            />
          </div>

          {/* Secondary particle layer with different timing */}
          <div className="absolute inset-0 z-25 opacity-25">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 60% 15%, rgba(168, 85, 247, 0.12) 0%, transparent 35%),
                  radial-gradient(circle at 25% 60%, rgba(34, 197, 94, 0.08) 0%, transparent 40%),
                  radial-gradient(circle at 85% 75%, rgba(59, 130, 246, 0.1) 0%, transparent 30%),
                  radial-gradient(circle at 10% 40%, rgba(249, 115, 22, 0.06) 0%, transparent 25%)
                `,
                animation: 'gentleFloat 30s ease-in-out infinite reverse',
              }}
            />
          </div>

          {/* Floating orbs */}
          <div className="absolute inset-0 z-35 opacity-20">
            <div
              className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full absolute"
              style={{
                top: '20%',
                left: '15%',
                animation: 'floatingOrb 18s ease-in-out infinite',
              }}
            />
            <div
              className="w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full absolute"
              style={{
                top: '70%',
                left: '80%',
                animation: 'floatingOrb 22s ease-in-out infinite 3s',
              }}
            />
            <div
              className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full absolute"
              style={{
                top: '45%',
                left: '70%',
                animation: 'floatingOrb 15s ease-in-out infinite 6s',
              }}
            />
            <div
              className="w-3 h-3 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full absolute"
              style={{
                top: '25%',
                left: '85%',
                animation: 'floatingOrb 25s ease-in-out infinite 9s',
              }}
            />
          </div>
        </>
      )}

      {/* Soft Overlay for Depth */}
      <div className="absolute inset-0 z-40 bg-gradient-to-t from-white/20 via-transparent to-blue-50/30"></div>

      {/* Content */}
      <div className="relative z-50">
        {children}
      </div>

      {/* Enhanced Global Animation Styles */}
      <style jsx>{`
        @keyframes gentleFloat {
          0%, 100% {
            transform: translateY(0px) translateX(0px) rotate(0deg) scale(1);
            opacity: 0.4;
          }
          20% {
            transform: translateY(-12px) translateX(8px) rotate(1deg) scale(1.03);
            opacity: 0.5;
          }
          40% {
            transform: translateY(-6px) translateX(-4px) rotate(-0.5deg) scale(0.97);
            opacity: 0.45;
          }
          60% {
            transform: translateY(8px) translateX(6px) rotate(0.8deg) scale(1.02);
            opacity: 0.48;
          }
          80% {
            transform: translateY(4px) translateX(-8px) rotate(-0.3deg) scale(0.99);
            opacity: 0.42;
          }
        }

        @keyframes floatingOrb {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
            opacity: 0.6;
          }
          25% {
            transform: translate(30px, -20px) scale(1.2);
            opacity: 0.8;
          }
          50% {
            transform: translate(-15px, -35px) scale(0.9);
            opacity: 0.7;
          }
          75% {
            transform: translate(-25px, 10px) scale(1.1);
            opacity: 0.9;
          }
        }

        @keyframes shimmer {
          0%, 100% {
            background-position: -200% center;
            transform: translateX(0px);
          }
          50% {
            background-position: 200% center;
            transform: translateX(10px);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}