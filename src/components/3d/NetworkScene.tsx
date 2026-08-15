"use client";

import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Float,
  Line,
  Html,
  Environment,
  ContactShadows,
  MeshReflectorMaterial,
} from "@react-three/drei";
import * as THREE from "three";

/* ─────────────────── Realistic 3D Device Models ─────────────────── */

function RouterModel({ color, hovered }: { color: string; hovered: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef} scale={hovered ? 1.15 : 1}>
      {/* Router body — flat box with rounded look */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.6, 0.12, 0.4]} />
        <meshStandardMaterial
          color={color}
          metalness={0.7}
          roughness={0.2}
          emissive={color}
          emissiveIntensity={hovered ? 0.4 : 0.15}
        />
      </mesh>
      {/* Antennas */}
      {[-0.2, 0, 0.2].map((x, i) => (
        <group key={i} position={[x, 0.06, -0.12]}>
          <mesh>
            <cylinderGeometry args={[0.015, 0.015, 0.35, 8]} />
            <meshStandardMaterial color="#aaa" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Antenna tip glow */}
          <mesh position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshBasicMaterial color={hovered ? "#00ff88" : color} transparent opacity={0.9} />
          </mesh>
        </group>
      ))}
      {/* LED indicators */}
      {[-0.15, -0.05, 0.05, 0.15].map((x, i) => (
        <mesh key={`led-${i}`} position={[x, 0.065, 0.18]}>
          <sphereGeometry args={[0.015, 6, 6]} />
          <meshBasicMaterial
            color={i === 0 ? "#00ff44" : i === 1 ? "#00ff44" : i === 2 ? "#ffaa00" : "#0088ff"}
          />
        </mesh>
      ))}
    </group>
  );
}

function ServerModel({ color, hovered }: { color: string; hovered: boolean }) {
  return (
    <group scale={hovered ? 1.12 : 1}>
      {/* Server rack unit */}
      {[0, 1, 2].map((i) => (
        <group key={i} position={[0, i * 0.18 - 0.18, 0]}>
          <mesh>
            <boxGeometry args={[0.5, 0.15, 0.35]} />
            <meshStandardMaterial
              color={i === 1 ? color : "#1a1a2e"}
              metalness={0.8}
              roughness={0.15}
              emissive={color}
              emissiveIntensity={i === 1 && hovered ? 0.4 : 0.05}
            />
          </mesh>
          {/* Drive bays */}
          {[-0.15, -0.05, 0.05, 0.15].map((x, j) => (
            <mesh key={j} position={[x, 0, 0.176]}>
              <boxGeometry args={[0.06, 0.1, 0.005]} />
              <meshStandardMaterial color="#0d0d15" metalness={0.5} roughness={0.3} />
            </mesh>
          ))}
          {/* Status LED */}
          <mesh position={[0.22, 0.04, 0.176]}>
            <sphereGeometry args={[0.012, 6, 6]} />
            <meshBasicMaterial color={hovered ? "#00ff88" : "#004422"} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function WorkstationModel({ color, hovered }: { color: string; hovered: boolean }) {
  return (
    <group scale={hovered ? 1.12 : 1}>
      {/* Monitor */}
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[0.5, 0.35, 0.03]} />
        <meshStandardMaterial color="#111" metalness={0.3} roughness={0.4} />
      </mesh>
      {/* Screen */}
      <mesh position={[0, 0.19, 0.016]}>
        <planeGeometry args={[0.44, 0.28]} />
        <meshBasicMaterial color={hovered ? color : "#0a1628"}>
        </meshBasicMaterial>
      </mesh>
      {/* Screen glow overlay */}
      <mesh position={[0, 0.19, 0.017]}>
        <planeGeometry args={[0.44, 0.28]} />
        <meshBasicMaterial color={color} transparent opacity={hovered ? 0.3 : 0.08} />
      </mesh>
      {/* Monitor stand */}
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[0.02, 0.03, 0.1, 8]} />
        <meshStandardMaterial color="#333" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Base */}
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.02, 16]} />
        <meshStandardMaterial color="#222" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Keyboard */}
      <mesh position={[0, -0.08, 0.2]}>
        <boxGeometry args={[0.35, 0.015, 0.12]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.5} />
      </mesh>
    </group>
  );
}

function IoTModel({ color, hovered }: { color: string; hovered: boolean }) {
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 2;
    }
  });

  return (
    <group scale={hovered ? 1.15 : 1}>
      {/* Sensor body — compact cylinder */}
      <mesh castShadow>
        <cylinderGeometry args={[0.12, 0.14, 0.08, 16]} />
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
      {/* Sensor dome */}
      <mesh position={[0, 0.06, 0]}>
        <sphereGeometry args={[0.1, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color={color}
          metalness={0.4}
          roughness={0.2}
          transparent
          opacity={0.7}
          emissive={color}
          emissiveIntensity={hovered ? 0.5 : 0.2}
        />
      </mesh>
      {/* Signal ring */}
      <mesh ref={ringRef} position={[0, 0.12, 0]} rotation-x={Math.PI / 2}>
        <ringGeometry args={[0.15, 0.17, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.6 : 0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function FirewallModel({ color, hovered }: { color: string; hovered: boolean }) {
  const shieldRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (shieldRef.current) {
      shieldRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.15;
    }
  });

  return (
    <group ref={shieldRef} scale={hovered ? 1.15 : 1}>
      {/* Shield body */}
      <mesh castShadow>
        <boxGeometry args={[0.5, 0.6, 0.08]} />
        <meshStandardMaterial
          color={color}
          metalness={0.7}
          roughness={0.15}
          emissive={color}
          emissiveIntensity={hovered ? 0.5 : 0.15}
        />
      </mesh>
      {/* Shield emblem */}
      <mesh position={[0, 0.05, 0.042]}>
        <boxGeometry args={[0.2, 0.25, 0.005]} />
        <meshStandardMaterial
          color="#ff2222"
          emissive="#ff0000"
          emissiveIntensity={hovered ? 0.8 : 0.3}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      {/* Lock icon (cross) */}
      <mesh position={[0, 0.08, 0.046]}>
        <boxGeometry args={[0.12, 0.02, 0.002]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0.08, 0.046]}>
        <boxGeometry args={[0.02, 0.12, 0.002]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

/* ─────────────────── Network Node Wrapper ─────────────────── */

function NetworkNode({
  position,
  color,
  scale = 1,
  label,
  type,
}: {
  position: [number, number, number];
  color: string;
  scale?: number;
  label?: string;
  type?: string;
}) {
  const [hovered, setHovered] = useState(false);

  const DeviceComponent = useMemo(() => {
    switch (type) {
      case "gateway":
        return RouterModel;
      case "server":
        return ServerModel;
      case "client":
        return WorkstationModel;
      case "iot":
        return IoTModel;
      case "security":
        return FirewallModel;
      default:
        return RouterModel;
    }
  }, [type]);

  return (
    <group position={position}>
      <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.2}>
        <group
          scale={scale}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <DeviceComponent color={color} hovered={hovered} />
          {/* Point light glow per device */}
          <pointLight
            color={color}
            intensity={hovered ? 2 : 0.5}
            distance={3}
          />
        </group>
      </Float>
      {hovered && label && (
        <Html position={[0, 0.7 * scale, 0]} center className="pointer-events-none select-none">
          <div
            className="px-4 py-2 rounded-xl text-xs whitespace-nowrap font-medium shadow-2xl backdrop-blur-sm"
            style={{
              background: "rgba(5,5,20,0.9)",
              border: `1px solid ${color}`,
              color: "#fff",
              boxShadow: `0 0 20px ${color}40, 0 0 60px ${color}15`,
            }}
          >
            <p className="font-bold text-sm">{label}</p>
            {type && (
              <p className="opacity-60 text-[10px] capitalize mt-0.5">{type}</p>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

/* ─────────────────── Data Flow (Animated Tubes) ─────────────────── */

function DataPacket({
  start,
  end,
  color,
  speed = 0.4,
  offset = 0,
}: {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  speed?: number;
  offset?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      const t = ((state.clock.elapsedTime * speed + offset) % 1);
      ref.current.position.set(
        start[0] + (end[0] - start[0]) * t,
        start[1] + (end[1] - start[1]) * t,
        start[2] + (end[2] - start[2]) * t
      );
      const opacity = Math.sin(t * Math.PI);
      (ref.current.material as THREE.MeshBasicMaterial).opacity = opacity * 0.9;
    }
    if (trailRef.current) {
      const t = ((state.clock.elapsedTime * speed + offset) % 1);
      trailRef.current.position.set(
        start[0] + (end[0] - start[0]) * t,
        start[1] + (end[1] - start[1]) * t,
        start[2] + (end[2] - start[2]) * t
      );
      (trailRef.current.material as THREE.MeshBasicMaterial).opacity =
        Math.sin(t * Math.PI) * 0.3;
    }
  });

  return (
    <group>
      {/* Core packet */}
      <mesh ref={ref}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshBasicMaterial color={color} transparent />
      </mesh>
      {/* Glow trail */}
      <mesh ref={trailRef}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color={color} transparent />
      </mesh>
    </group>
  );
}

function NetworkLine({
  start,
  end,
  color,
}: {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
}) {
  const points = useMemo(() => [start, end], [start, end]);
  const midPoint = useMemo(
    () =>
      [
        (start[0] + end[0]) / 2,
        (start[1] + end[1]) / 2 + 0.3,
        (start[2] + end[2]) / 2,
      ] as [number, number, number],
    [start, end]
  );

  // Create curved path with 3 points
  const curvePoints = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...start),
      new THREE.Vector3(...midPoint),
      new THREE.Vector3(...end)
    );
    return curve.getPoints(20).map((p) => [p.x, p.y, p.z] as [number, number, number]);
  }, [start, midPoint, end]);

  return (
    <group>
      <Line
        points={curvePoints}
        color={color}
        lineWidth={1.8}
        transparent
        opacity={0.3}
      />
      {/* Dashed outer line */}
      <Line
        points={curvePoints}
        color={color}
        lineWidth={0.5}
        transparent
        opacity={0.1}
        dashed
        dashScale={5}
        dashSize={0.2}
        gapSize={0.1}
      />
      <DataPacket
        start={start}
        end={end}
        color={color}
        speed={0.25 + Math.random() * 0.2}
        offset={0}
      />
      <DataPacket
        start={start}
        end={end}
        color={color}
        speed={0.25 + Math.random() * 0.2}
        offset={0.5}
      />
    </group>
  );
}

/* ─────────────────── Particle Field ─────────────────── */

function Particles() {
  const ref = useRef<THREE.Points>(null);
  const count = 200;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 30;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.01;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.005) * 0.05;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#06d6a0"
        transparent
        opacity={0.4}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ─────────────────── Grid Floor ─────────────────── */

function GridFloor() {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -4.5, 0]}>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial
        color="#050a15"
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}

/* ─────────────────── Camera Rig ─────────────────── */

function CameraRig() {
  const { camera, pointer } = useThree();

  useFrame(() => {
    camera.position.x = THREE.MathUtils.lerp(
      camera.position.x,
      pointer.x * 2,
      0.02
    );
    camera.position.y = THREE.MathUtils.lerp(
      camera.position.y,
      1 + pointer.y * 1.5,
      0.02
    );
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/* ─────────────────── Main Scene ─────────────────── */

export default function NetworkScene3D() {
  const nodes = [
    {
      position: [0, 0, 0] as [number, number, number],
      color: "#06d6a0",
      scale: 1.8,
      label: "Main Gateway",
      type: "gateway",
    },
    {
      position: [-3.5, 2, -1] as [number, number, number],
      color: "#3b82f6",
      scale: 1.2,
      label: "DB Server",
      type: "server",
    },
    {
      position: [3.5, 1.5, 1] as [number, number, number],
      color: "#3b82f6",
      scale: 1.1,
      label: "App Server",
      type: "server",
    },
    {
      position: [-4.5, -2, 2] as [number, number, number],
      color: "#f59e0b",
      scale: 0.9,
      label: "Workstation A",
      type: "client",
    },
    {
      position: [2.5, -3, -1.5] as [number, number, number],
      color: "#f59e0b",
      scale: 0.9,
      label: "Workstation B",
      type: "client",
    },
    {
      position: [-1.5, -2.5, 3] as [number, number, number],
      color: "#8b5cf6",
      scale: 0.7,
      label: "IoT Sensor",
      type: "iot",
    },
    {
      position: [4.5, -1, 2] as [number, number, number],
      color: "#8b5cf6",
      scale: 0.6,
      label: "Camera 1",
      type: "iot",
    },
    {
      position: [0, 3.5, -2] as [number, number, number],
      color: "#ef4444",
      scale: 1.3,
      label: "Firewall",
      type: "security",
    },
  ];

  const lines = [
    { start: nodes[0].position, end: nodes[1].position, color: "#06d6a0" },
    { start: nodes[0].position, end: nodes[2].position, color: "#06d6a0" },
    { start: nodes[0].position, end: nodes[7].position, color: "#ef4444" },
    { start: nodes[1].position, end: nodes[3].position, color: "#3b82f6" },
    { start: nodes[2].position, end: nodes[4].position, color: "#3b82f6" },
    { start: nodes[3].position, end: nodes[5].position, color: "#f59e0b" },
    { start: nodes[4].position, end: nodes[6].position, color: "#f59e0b" },
    { start: nodes[2].position, end: nodes[6].position, color: "#8b5cf6" },
    { start: nodes[1].position, end: nodes[7].position, color: "#ef4444" },
  ];

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 2, 12], fov: 42 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "default",
          failIfMajorPerformanceCaveat: false,
        }}
        dpr={[1, 1.5]}
        onCreated={({ gl }) => {
          gl.setClearColor("#040810", 1);
          const canvas = gl.domElement;
          canvas.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            console.warn("WebGL context lost — will restore automatically");
          });
          canvas.addEventListener("webglcontextrestored", () => {
            console.log("WebGL context restored");
          });
        }}
      >
        <fog attach="fog" args={["#040810", 10, 28]} />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[8, 12, 8]}
          intensity={1.5}
          color="#ffffff"
        />
        <pointLight
          position={[6, 6, 6]}
          intensity={1}
          color="#06d6a0"
          distance={25}
        />
        <pointLight
          position={[-6, -4, -6]}
          intensity={0.6}
          color="#3b82f6"
          distance={25}
        />
        <pointLight
          position={[0, 8, 0]}
          intensity={0.4}
          color="#8b5cf6"
          distance={20}
        />

        {/* Devices and connections */}
        <group>
          {nodes.map((node, i) => (
            <NetworkNode key={`node-${i}`} {...node} />
          ))}
          {lines.map((line, i) => (
            <NetworkLine key={`line-${i}`} {...line} />
          ))}
        </group>

        {/* Environment */}
        <Particles />
        <GridFloor />
        
        <CameraRig />
      </Canvas>
    </div>
  );
}
