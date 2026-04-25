"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Stars, Sparkles } from "@react-three/drei";
import { GlowingSphere } from "./3D/GlowingSphere";

interface ReusableBackgroundProps {
  sphereColors?: string[];
  sphereCount?: number;
  starCount?: number;
  sparkleCount?: number;
  ambientIntensity?: number;
  className?: string;
}

export function ReusableBackground({
  sphereColors = ["#ec4899", "#8b5cf6", "#0ea5e9"],
  sphereCount = 3,
  starCount = 200,
  sparkleCount = 20,
  ambientIntensity = 0.4,
  className = "absolute inset-0",
}: ReusableBackgroundProps) {
  return (
    <Canvas className={className} style={{ pointerEvents: "none" }}>
      <Suspense fallback={null}>
        <Environment preset="night" />
        <Stars radius={100} depth={50} count={starCount} factor={4} fade speed={0.3} />
        <Sparkles count={sparkleCount} scale={5} size={2} speed={0.5} />
        {sphereColors.slice(0, sphereCount).map((color, i) => (
          <GlowingSphere
            key={i}
            position={[
              (i - sphereCount / 2 + 0.5) * 4,
              ((i % 2 === 0 ? 1 : -1) * 2),
              -5,
            ]}
            color={color}
            size={1.5 - i * 0.2}
            speed={1 + i * 0.3}
          />
        ))}
        <ambientLight intensity={ambientIntensity} />
      </Suspense>
    </Canvas>
  );
}
