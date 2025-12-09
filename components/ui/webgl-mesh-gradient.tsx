"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import type { Mesh, ShaderMaterial } from "three";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import * as THREE from "three";

/**
 * Configuration interface for WebGL blob effects
 */
export interface BlobEffectConfig {
  /** Number of blobs to render (1-20, default: 6) */
  blobCount?: number;
  /** Base scale multiplier for all blobs (0.1-5.0, default: 1.0) */
  scaleMultiplier?: number;
  /** Global speed multiplier for animations (0.1-3.0, default: 1.0) */
  speedMultiplier?: number;
  /** Floating movement amplitude (0.1-5.0, default: 2.0) */
  movementAmplitude?: number;
  /** Rotation intensity (0.0-1.0, default: 0.1) */
  rotationIntensity?: number;
  /** Scale pulsing intensity (0.0-0.5, default: 0.1) */
  pulseIntensity?: number;
  /** Base opacity for all blobs (0.1-1.0, default: 0.6) */
  opacity?: number;
  /** Camera field of view (30-120, default: 60) */
  cameraFov?: number;
  /** Camera Z position (5-20, default: 10) */
  cameraDistance?: number;
  /** Ambient light intensity (0.1-2.0, default: 0.8) */
  ambientLight?: number;
  /** Directional light intensity (0.0-1.0, default: 0.3) */
  directionalLight?: number;
  /** Enable automatic color rotation (default: false) */
  colorRotation?: boolean;
  /** Deformation intensity for blob morphing (0.0-2.0, default: 0.5) */
  deformationIntensity?: number;
  /** Deformation speed for blob morphing (0.1-3.0, default: 1.0) */
  deformationSpeed?: number;
}

/**
 * Preset configurations for different visual styles
 */
export const BlobPresets: Record<string, BlobEffectConfig> = {
  subtle: {
    blobCount: 4,
    scaleMultiplier: 0.8,
    speedMultiplier: 0.5,
    movementAmplitude: 1.5,
    opacity: 0.4,
    pulseIntensity: 0.05,
    deformationIntensity: 0.3,
    deformationSpeed: 0.8,
  },
  default: {
    blobCount: 6,
    scaleMultiplier: 1.0,
    speedMultiplier: 1.0,
    movementAmplitude: 2.0,
    opacity: 0.6,
    pulseIntensity: 0.1,
    deformationIntensity: 0.6,
    deformationSpeed: 1.0,
  },
  dramatic: {
    blobCount: 8,
    scaleMultiplier: 1.5,
    speedMultiplier: 1.8,
    movementAmplitude: 3.0,
    opacity: 0.8,
    pulseIntensity: 0.2,
    deformationIntensity: 1.2,
    deformationSpeed: 1.5,
  },
  minimal: {
    blobCount: 3,
    scaleMultiplier: 1.2,
    speedMultiplier: 0.3,
    movementAmplitude: 1.0,
    opacity: 0.3,
    pulseIntensity: 0.03,
    deformationIntensity: 0.2,
    deformationSpeed: 0.5,
  },
  organic: {
    blobCount: 5,
    scaleMultiplier: 1.3,
    speedMultiplier: 0.8,
    movementAmplitude: 2.5,
    opacity: 0.7,
    pulseIntensity: 0.15,
    deformationIntensity: 1.0,
    deformationSpeed: 1.2,
  },
  lavaLamp: {
    blobCount: 5,
    scaleMultiplier: 1.4,
    speedMultiplier: 0.7,
    movementAmplitude: 2.0,
    opacity: 0.75,
    pulseIntensity: 0.12,
    deformationIntensity: 0.8,
    deformationSpeed: 0.9,
  },
};

// Custom shader material for blob deformation
const BlobDeformationMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uDeformationIntensity: { value: 0.5 },
    uDeformationSpeed: { value: 1.0 },
    uColor: { value: new THREE.Color(1, 1, 1) },
    uOpacity: { value: 0.6 },
  },
  vertexShader: `
    uniform float uTime;
    uniform float uDeformationIntensity;
    uniform float uDeformationSpeed;
    
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    
    // Noise function for organic deformation
    float noise(vec3 p) {
      return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
    }
    
    // Smooth noise
    float smoothNoise(vec3 p) {
      vec3 i = floor(p);
      vec3 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      
      float a = noise(i);
      float b = noise(i + vec3(1.0, 0.0, 0.0));
      float c = noise(i + vec3(0.0, 1.0, 0.0));
      float d = noise(i + vec3(1.0, 1.0, 0.0));
      
      float e = noise(i + vec3(0.0, 0.0, 1.0));
      float f1 = noise(i + vec3(1.0, 0.0, 1.0));
      float g = noise(i + vec3(0.0, 1.0, 1.0));
      float h = noise(i + vec3(1.0, 1.0, 1.0));
      
      float ab = mix(a, b, f.x);
      float cd = mix(c, d, f.x);
      float ef = mix(e, f1, f.x);
      float gh = mix(g, h, f.x);
      
      float abcd = mix(ab, cd, f.y);
      float efgh = mix(ef, gh, f.y);
      
      return mix(abcd, efgh, f.z);
    }
    
    // Fractal noise for more complex deformation
    float fractalNoise(vec3 p) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;
      
      for (int i = 0; i < 4; i++) {
        value += amplitude * smoothNoise(p * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
      }
      
      return value;
    }
    
    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normal;
      
      vec3 pos = position;
      float time = uTime * uDeformationSpeed;
      
      // Create lava lamp-like flowing distortions
      // Multiple layers of noise at different scales and speeds
      
      // Primary flow - large, slow movements
      float flow1 = fractalNoise(pos * 0.5 + time * 0.1) * uDeformationIntensity;
      
      // Secondary flow - medium scale ripples
      float flow2 = fractalNoise(pos * 1.2 + time * 0.2) * uDeformationIntensity * 0.6;
      
      // Tertiary flow - fine surface details
      float flow3 = fractalNoise(pos * 2.5 + time * 0.4) * uDeformationIntensity * 0.3;
      
      // Combine all flows
      float totalFlow = flow1 + flow2 + flow3;
      
      // Apply distortion along normal direction to maintain round shape
      pos += normal * totalFlow;
      
      // Add gentle pulsing/bouncing effect
      float bounce = sin(time * 1.5 + length(pos) * 2.0) * 0.1 * uDeformationIntensity;
      pos += normalize(pos) * bounce;
      
      // Add subtle vertical flow (like rising bubbles in lava lamp)
      float verticalFlow = sin(pos.y * 3.0 + time * 0.8) * 0.05 * uDeformationIntensity;
      pos.x += verticalFlow;
      pos.z += verticalFlow * 0.7;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform float uOpacity;
    
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    
    void main() {
      // Create subtle color variation based on position
      vec3 color = uColor;
      
      // Add some rim lighting effect
      float fresnel = 1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)));
      fresnel = pow(fresnel, 2.0);
      
      // Mix with fresnel for subtle rim effect
      color = mix(color, color * 1.2, fresnel * 0.3);
      
      gl_FragColor = vec4(color, uOpacity);
    }
  `,
};

function FloatingBlob({
  position,
  scale,
  color,
  speed,
  config,
}: {
  position: [number, number, number];
  scale: number;
  color: string;
  speed: number;
  config: Required<BlobEffectConfig>;
}) {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const initialPosition = useMemo(() => [...position], [position]);

  // Create shader material instance
  const shaderMaterial = useMemo(() => {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uDeformationIntensity: { value: config.deformationIntensity },
        uDeformationSpeed: { value: config.deformationSpeed },
        uColor: { value: new THREE.Color(color) },
        uOpacity: { value: config.opacity },
      },
      vertexShader: BlobDeformationMaterial.vertexShader,
      fragmentShader: BlobDeformationMaterial.fragmentShader,
      transparent: true,
    });
    return material;
  }, [
    color,
    config.deformationIntensity,
    config.deformationSpeed,
    config.opacity,
  ]);

  useFrame((state) => {
    if (meshRef.current && materialRef.current) {
      const time = state.clock.elapsedTime * speed * config.speedMultiplier;

      // Update shader uniforms
      materialRef.current.uniforms.uTime.value = time;

      // Configurable floating motion
      meshRef.current.position.x =
        initialPosition[0] + Math.sin(time * 0.5) * config.movementAmplitude;
      meshRef.current.position.y =
        initialPosition[1] +
        Math.cos(time * 0.3) * (config.movementAmplitude * 0.75);
      meshRef.current.position.z =
        initialPosition[2] +
        Math.sin(time * 0.4) * (config.movementAmplitude * 0.5);

      // Configurable rotation
      meshRef.current.rotation.x =
        Math.sin(time * 0.2) * config.rotationIntensity;
      meshRef.current.rotation.y =
        Math.cos(time * 0.15) * config.rotationIntensity;

      // Configurable scale pulsing
      const pulseScale = 1 + Math.sin(time * 0.8) * config.pulseIntensity;
      meshRef.current.scale.setScalar(
        scale * config.scaleMultiplier * pulseScale
      );
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial ref={materialRef} {...shaderMaterial} />
    </mesh>
  );
}

function FloatingBlobsScene({
  config,
}: {
  config: Required<BlobEffectConfig>;
}) {
  const allBlobs = useMemo(
    () => [
      // SMALL BLOBS (4 total) - Very small, delicate blobs
      {
        position: [4, 1, -7] as [number, number, number],
        scale: 0.4,
        color: "#bbf7d0",
        speed: 0.22,
      },
      {
        position: [-3, 0, -2] as [number, number, number],
        scale: 0.3,
        color: "#fde68a",
        speed: 0.24,
      },
      {
        position: [-8, 2, -3] as [number, number, number],
        scale: 0.5,
        color: "#fbb6ce",
        speed: 0.21,
      },
      {
        position: [2, -4, -5] as [number, number, number],
        scale: 0.35,
        color: "#e0f2fe",
        speed: 0.23,
      },

      // MEDIUM BLOBS (4 total) - Balanced mid-size blobs
      {
        position: [6, 5, -3] as [number, number, number],
        scale: 1.6,
        color: "#c7d2fe",
        speed: 0.18,
      },
      {
        position: [-7, -3, -5] as [number, number, number],
        scale: 1.4,
        color: "#fed7aa",
        speed: 0.2,
      },
      {
        position: [2, -6, -8] as [number, number, number],
        scale: 1.5,
        color: "#ddd6fe",
        speed: 0.19,
      },
      {
        position: [-5, 4, -7] as [number, number, number],
        scale: 1.3,
        color: "#bfdbfe",
        speed: 0.17,
      },

      // Additional blobs for higher counts
      {
        position: [5, -2, -4] as [number, number, number],
        scale: 1.2,
        color: "#e9d5ff",
        speed: 0.16,
      },
      {
        position: [-1, 3, -6] as [number, number, number],
        scale: 0.45,
        color: "#fef3c7",
        speed: 0.25,
      },
    ],
    []
  );

  // Use only the number of blobs specified in config
  const activeBlobs = allBlobs.slice(0, config.blobCount);

  return (
    <>
      {activeBlobs.map((blob, index) => (
        <FloatingBlob
          key={index}
          position={blob.position}
          scale={blob.scale}
          color={blob.color}
          speed={blob.speed}
          config={config}
        />
      ))}
    </>
  );
}

export function FloatingBlobsWebGL({
  config = BlobPresets.default,
  preset,
}: {
  config?: Partial<BlobEffectConfig>;
  preset?: keyof typeof BlobPresets;
}) {
  // Merge config with defaults and preset if provided
  const finalConfig: Required<BlobEffectConfig> = {
    blobCount: 6,
    scaleMultiplier: 1.0,
    speedMultiplier: 1.0,
    movementAmplitude: 2.0,
    rotationIntensity: 0.1,
    pulseIntensity: 0.1,
    opacity: 0.6,
    cameraFov: 60,
    cameraDistance: 10,
    ambientLight: 0.8,
    directionalLight: 0.3,
    colorRotation: false,
    deformationIntensity: 0.5,
    deformationSpeed: 1.0,
    ...BlobPresets.default,
    ...(preset ? BlobPresets[preset] : {}),
    ...config,
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100">
      <Canvas
        camera={{
          position: [0, 0, finalConfig.cameraDistance],
          fov: finalConfig.cameraFov,
        }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={finalConfig.ambientLight} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={finalConfig.directionalLight}
        />
        <FloatingBlobsScene config={finalConfig} />
      </Canvas>
    </div>
  );
}

// Drop-in replacement for DynamicShaderBackground - WebGL optimized but visually identical
export function OptimizedDynamicBackground({
  children,
  className,
  blobConfig,
  preset = "default",
}: {
  children: React.ReactNode;
  className?: string;
  blobConfig?: Partial<BlobEffectConfig>;
  preset?: keyof typeof BlobPresets;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div
        className={cn(
          "relative min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100",
          className
        )}
      >
        <div className="relative z-50">{children}</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 overflow-hidden",
        className
      )}
      suppressHydrationWarning
    >
      {/* WebGL Floating Blobs Background */}
      <div className="absolute inset-0 z-0">
        <FloatingBlobsWebGL config={blobConfig} preset={preset} />
      </div>

      {/* Soft Overlay for Depth */}
      <div className="absolute inset-0 z-40 bg-gradient-to-t from-white/20 via-transparent to-blue-50/30"></div>

      {/* Content */}
      <div className="relative z-50">{children}</div>
    </div>
  );
}
