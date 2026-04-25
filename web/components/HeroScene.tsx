"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, Sphere, MeshDistortMaterial, Stars, Sparkles } from "@react-three/drei";
import { Suspense, useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useSnapshot } from "valtio";
import { store } from "@/lib/store";

function FloatingOrbs() {
  const snap = useSnapshot(store);
  const orbs = useMemo(() => {
    return Array.from({ length: 15 }, () => ({
      position: [
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
      ] as [number, number, number],
      speed: Math.random() * 0.5 + 0.2,
      size: Math.random() * 0.3 + 0.1,
    }));
  }, []);

  return (
    <>
      {orbs.map((orb, i) => (
        <Float key={i} speed={orb.speed} rotationIntensity={2} floatIntensity={2}>
          <Sphere position={orb.position} args={[orb.size, 16, 16]}>
            <meshStandardMaterial
              color={snap.themeColor}
              emissive={snap.themeColor}
              emissiveIntensity={2}
              roughness={0}
            />
          </Sphere>
        </Float>
      ))}
    </>
  );
}

function MainHero() {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.Mesh>(null);
  const snap = useSnapshot(store);
  const { mouse } = useThree();
  
  useFrame((state) => {
    if (!meshRef.current || !wireframeRef.current) return;
    
    // Rotation
    meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    wireframeRef.current.rotation.y = -state.clock.getElapsedTime() * 0.1;

    // Mouse Parallax
    const targetX = mouse.x * 0.5;
    const targetY = mouse.y * 0.5;
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.1);
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.1);
    wireframeRef.current.position.copy(meshRef.current.position);

    // Scroll Reaction (Distortion & Scale)
    const distortTarget = 0.4 + snap.scrollProgress * 0.6;
    const scaleTarget = 1 + snap.scrollProgress * 0.5;
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, scaleTarget, 0.1));
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <Sphere ref={meshRef} args={[1.5, 64, 64]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color={snap.themeColor}
          speed={3}
          distort={0.4}
          radius={1}
          emissive={snap.themeColor}
          emissiveIntensity={0.5}
        />
      </Sphere>
      <Sphere ref={wireframeRef} args={[1.6, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color={snap.themeColor}
          wireframe
          transparent
          opacity={0.1 + snap.scrollProgress * 0.2}
        />
      </Sphere>
    </Float>
  );
}

export default function HeroScene() {
  const snap = useSnapshot(store);

  return (
    <div className="fixed inset-0 -z-10 bg-[#050505]">
      <Suspense fallback={null}>
        <Canvas
          shadows
          camera={{ position: [0, 0, 8], fov: 45 }}
          gl={{ antialias: true }}
          dpr={[1, 2]}
        >
          <color attach="background" args={["#050505"]} />
          <fog attach="fog" args={["#050505", 5, 25]} />
          
          <ambientLight intensity={0.2} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <pointLight position={[-10, -10, -10]} color={snap.themeColor} intensity={2} />
          <pointLight position={[10, 10, 10]} color="#ffffff" intensity={1} />

          <MainHero />
          <FloatingOrbs />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <Sparkles count={200} scale={[20, 20, 20]} size={2} speed={0.5} color={snap.themeColor} />

          <Environment preset="city" />
        </Canvas>
      </Suspense>
    </div>
  );
}
