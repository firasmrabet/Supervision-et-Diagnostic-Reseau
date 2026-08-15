"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere, Ring } from "@react-three/drei";
import * as THREE from "three";

function CoreSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.01;
      ringRef.current.rotation.x = Math.PI / 3;
    }
  });

  return (
    <group>
      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <meshStandardMaterial
          color="#06d6a0"
          emissive="#06d6a0"
          emissiveIntensity={0.3}
          roughness={0.1}
          metalness={0.9}
          wireframe
        />
      </Sphere>
      <Ring ref={ringRef} args={[1.5, 1.55, 64]}>
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.6} side={THREE.DoubleSide} />
      </Ring>
      <Ring args={[1.8, 1.83, 64]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.3} side={THREE.DoubleSide} />
      </Ring>
    </group>
  );
}

function OrbitingParticles() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.003;
    }
  });

  const particles = Array.from({ length: 30 }, (_, i) => ({
    angle: (i / 30) * Math.PI * 2,
    radius: 2 + Math.random() * 0.5,
    speed: 0.5 + Math.random() * 0.5,
    size: 0.03 + Math.random() * 0.03,
    color: ["#06d6a0", "#3b82f6", "#f59e0b", "#8b5cf6"][i % 4],
  }));

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <Float key={i} speed={p.speed} floatIntensity={0.2}>
          <Sphere
            args={[p.size, 8, 8]}
            position={[
              Math.cos(p.angle) * p.radius,
              Math.sin(p.angle * 0.5) * 0.5,
              Math.sin(p.angle) * p.radius,
            ]}
          >
            <meshBasicMaterial color={p.color} />
          </Sphere>
        </Float>
      ))}
    </group>
  );
}

export default function AICore3D() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} style={{ background: "transparent" }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#06d6a0" />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#3b82f6" />
        <CoreSphere />
        <OrbitingParticles />
      </Canvas>
    </div>
  );
}
