"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, MeshWobbleMaterial, Text, Billboard } from "@react-three/drei";
import * as THREE from "three";

interface FloatingCardProps {
  position: [number, number, number];
  color: string;
  title: string;
  price: number;
}

export function FloatingCard({
  position,
  color,
  title,
  price,
}: FloatingCardProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 0.5) * 0.3;
    groupRef.current.rotation.y += 0.003;
  });

  return (
    <group ref={groupRef} position={position}>
      <RoundedBox args={[2, 2.5, 0.2]} radius={0.1} ref={meshRef}>
        <MeshWobbleMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          speed={2}
          factor={0.4}
        />
      </RoundedBox>

      <Billboard position={[0, 0, 0.15]}>
        <group position={[0, 0.3, 0]}>
          <Text scale={0.3} color="#ffffff" anchorY="top">
            {title}
          </Text>
          <Text scale={0.25} color="#fbbf24" position={[0, -0.6, 0]}>
            ${price}
          </Text>
        </group>
      </Billboard>
    </group>
  );
}
