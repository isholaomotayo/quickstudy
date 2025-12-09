"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { MeshGradient, DynamicShaderBackground } from "./mesh-gradient";
import { OptimizedDynamicBackground } from "./webgl-mesh-gradient";

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage?: number;
}

function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    frameTime: 0,
  });

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let startTime = lastTime;

    function measurePerformance() {
      const currentTime = performance.now();
      frameCount++;

      if (currentTime - startTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - startTime));
        const frameTime = currentTime - lastTime;

        setMetrics({
          fps,
          frameTime: Math.round(frameTime * 100) / 100,
          memoryUsage: (performance as any).memory?.usedJSHeapSize
            ? Math.round(
                (performance as any).memory.usedJSHeapSize / 1024 / 1024
              )
            : undefined,
        });

        frameCount = 0;
        startTime = currentTime;
      }

      lastTime = currentTime;
      requestAnimationFrame(measurePerformance);
    }

    const animationId = requestAnimationFrame(measurePerformance);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return metrics;
}

export function PerformanceDemo() {
  const [activeDemo, setActiveDemo] = useState<"svg" | "webgl">("webgl");
  const [showMetrics, setShowMetrics] = useState(true);
  const metrics = usePerformanceMonitor();

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Performance Metrics Overlay */}
      {showMetrics && (
        <div className="absolute top-4 left-4 z-[100] bg-black/80 text-white p-4 rounded-lg font-mono text-sm">
          <div className="flex items-center gap-4 mb-2">
            <span className="font-semibold">Performance Metrics</span>
            <button
              onClick={() => setShowMetrics(false)}
              className="text-gray-300 hover:text-white"
            >
              ×
            </button>
          </div>
          <div className="space-y-1">
            <div>
              FPS:{" "}
              <span
                className={cn(
                  "font-bold",
                  metrics.fps < 30
                    ? "text-red-400"
                    : metrics.fps < 50
                    ? "text-yellow-400"
                    : "text-green-400"
                )}
              >
                {metrics.fps}
              </span>
            </div>
            <div>Frame Time: {metrics.frameTime}ms</div>
            {metrics.memoryUsage && <div>Memory: {metrics.memoryUsage}MB</div>}
          </div>
        </div>
      )}

      {/* Demo Toggle Controls */}
      <div className="absolute top-4 right-4 z-[100] bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-gray-800">Demo Mode:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveDemo("svg")}
              className={cn(
                "px-4 py-2 rounded-md transition-all",
                activeDemo === "svg"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              )}
            >
              SVG (Original)
            </button>
            <button
              onClick={() => setActiveDemo("webgl")}
              className={cn(
                "px-4 py-2 rounded-md transition-all",
                activeDemo === "webgl"
                  ? "bg-green-500 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              )}
            >
              WebGL (Optimized)
            </button>
          </div>
          {!showMetrics && (
            <button
              onClick={() => setShowMetrics(true)}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Show Metrics
            </button>
          )}
        </div>
      </div>

      {/* Demo Content */}
      {activeDemo === "svg" ? (
        <DynamicShaderBackground className="w-full h-full">
          <div className="flex items-center justify-center h-full">
            {/* <div className="text-center max-w-2xl mx-auto p-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                SVG Implementation
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Original implementation using SVG animations with complex
                filters and multiple layers. This approach may cause performance
                issues on lower-end devices.
              </p>
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4">
                  Performance Characteristics
                </h2>
                <ul className="text-left space-y-2 text-gray-700">
                  <li>
                    • Multiple SVG filter operations (feTurbulence,
                    feDisplacementMap)
                  </li>
                  <li>• 4+ animated gradient layers</li>
                  <li>• Complex DOM manipulation</li>
                  <li>• CPU-intensive calculations</li>
                </ul>
              </div>
            </div> */}
          </div>
        </DynamicShaderBackground>
      ) : (
        <OptimizedDynamicBackground className="w-full h-full">
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-2xl mx-auto p-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                WebGL Implementation
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Optimized implementation using WebGL shaders for hardware
                acceleration. Provides smooth 60fps performance even on mobile
                devices.
              </p>
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4">
                  Optimization Benefits
                </h2>
                <ul className="text-left space-y-2 text-gray-700">
                  <li>• GPU-accelerated shader operations</li>
                  <li>• Single render pass for all effects</li>
                  <li>• Minimal DOM manipulation</li>
                  <li>• Frame rate limiting (60fps cap)</li>
                  <li>• Automatic fallback for unsupported browsers</li>
                </ul>
              </div>
            </div>
          </div>
        </OptimizedDynamicBackground>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[100] bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg text-center">
        <p className="text-sm text-gray-600">
          Switch between implementations to compare performance.
          <br />
          Move your mouse around to see interactive effects.
        </p>
      </div>
    </div>
  );
}

// Simple comparison component for side-by-side testing
export function SideBySideComparison() {
  return (
    <div className="w-full h-screen flex">
      {/* SVG Side */}
      <div className="relative w-1/2 h-full border-r-2 border-gray-300">
        <div className="absolute top-4 left-4 z-50 bg-red-500 text-white px-3 py-1 rounded text-sm font-semibold">
          SVG (Original)
        </div>
        <MeshGradient
          className="w-full h-full"
          colors={["#e0f2fe", "#bfdbfe", "#c7d2fe", "#ddd6fe", "#e9d5ff"]}
          speed={0.3}
          opacity={0.8}
          interactive={true}
        />
      </div>

      {/* WebGL Side */}
      <div className="relative w-1/2 h-full">
        <div className="absolute top-4 left-4 z-50 bg-green-500 text-white px-3 py-1 rounded text-sm font-semibold">
          WebGL (Optimized)
        </div>
        <OptimizedDynamicBackground className="w-full h-full">
          <div className="w-full h-full" />
        </OptimizedDynamicBackground>
      </div>
    </div>
  );
}
