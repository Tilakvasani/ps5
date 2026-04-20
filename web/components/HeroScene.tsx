"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Sphere, Cylinder } from "@react-three/drei";
import { useMemo, useRef } from "react";
import type { Mesh } from "three";

function Fruit({ color, position }: { color: string; position: [number, number, number] }) {
  const ref = useRef<Mesh>(null);
  const speed = useMemo(() => Math.random() * 0.4 + 0.6, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y += 0.01 * speed;
    ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * speed) * 0.2;
  });

  return (
    <Sphere ref={ref} args={[0.55, 32, 32]} position={position}>
      <meshStandardMaterial color={color} roughness={0.25} metalness={0.1} />
    </Sphere>
  );
}

export default function HeroScene() {
  return (
    <div className="h-[60vh] w-full rounded-3xl border border-white/10 bg-black/25">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 4, 3]} intensity={1.5} />
        <Float speed={1.4} rotationIntensity={0.5}>
          <Fruit color="#ff4d77" position={[-1.5, 0.2, 0]} />
          <Fruit color="#ffd74a" position={[1.5, -0.2, 0]} />
          <Cylinder args={[0.42, 0.42, 1.5, 32]} position={[0, -1.4, 0]}>
            <meshStandardMaterial color="#f2f2f2" metalness={0.3} roughness={0.2} />
          </Cylinder>
        </Float>
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
