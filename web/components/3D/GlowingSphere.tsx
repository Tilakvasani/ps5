"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

interface GlowingSphereProps {
  position: [number, number, number];
  color: string;
  size?: number;
  speed?: number;
  distort?: number;
}

export function GlowingSphere({
  position,
  color,
  size = 1,
  speed = 2,
  distort = 0.4,
}: GlowingSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += 0.001;
    meshRef.current.rotation.y += 0.002;
  });

  return (
    <Sphere ref={meshRef} position={position} args={[size, 32, 32]}>
      <MeshDistortMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1}
        speed={speed}
        distort={distort}
        roughness={0.2}
        metalness={0.8}
      />
    </Sphere>
  );
}
