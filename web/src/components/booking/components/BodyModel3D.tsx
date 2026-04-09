"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { Suspense, useMemo, useState } from "react";
import * as THREE from "three";

export interface BodyPart3DDef {
  id: string;
  label: string;
  // geometry: capsule | sphere | box
  shape: "capsule" | "sphere" | "box";
  // dimensions
  size: [number, number, number]; // capsule: [radius, length, _]; sphere: [radius,_,_]; box: [w,h,d]
  position: [number, number, number];
  rotation?: [number, number, number];
}

// Centered around y=0 (waist), units arbitrary
// A simple but anatomically recognizable humanoid composed of separated parts
export const BODY_PARTS: BodyPart3DDef[] = [
  // Head
  { id: "head", label: "Cabeca", shape: "sphere", size: [0.32, 0, 0], position: [0, 2.55, 0] },
  { id: "face", label: "Rosto", shape: "sphere", size: [0.28, 0, 0], position: [0, 2.5, 0.08] },
  // Neck
  { id: "neck", label: "Pescoco", shape: "capsule", size: [0.13, 0.18, 0], position: [0, 2.15, 0] },
  // Torso
  { id: "chest", label: "Peito", shape: "box", size: [0.95, 0.55, 0.45], position: [0, 1.7, 0.02] },
  { id: "stomach", label: "Barriga", shape: "box", size: [0.75, 0.45, 0.42], position: [0, 1.15, 0.02] },
  { id: "intimate", label: "Quadril", shape: "box", size: [0.85, 0.35, 0.45], position: [0, 0.7, 0] },
  // Back (behind torso)
  { id: "back-cervical", label: "Cervical", shape: "box", size: [0.9, 0.25, 0.18], position: [0, 1.85, -0.22] },
  { id: "back-thoracic", label: "Toracica", shape: "box", size: [0.9, 0.4, 0.18], position: [0, 1.5, -0.22] },
  { id: "back-lumbar", label: "Lombar", shape: "box", size: [0.85, 0.35, 0.18], position: [0, 1.1, -0.22] },
  // Arms - left
  { id: "arm-l", label: "Braco E.", shape: "capsule", size: [0.13, 0.6, 0], position: [-0.62, 1.65, 0], rotation: [0, 0, 0.1] },
  { id: "elbow-l", label: "Cotovelo E.", shape: "sphere", size: [0.13, 0, 0], position: [-0.7, 1.05, 0] },
  { id: "forearm-l", label: "Antebraco E.", shape: "capsule", size: [0.11, 0.55, 0], position: [-0.74, 0.5, 0], rotation: [0, 0, 0.05] },
  { id: "hand-l", label: "Mao E.", shape: "box", size: [0.16, 0.22, 0.08], position: [-0.78, 0.05, 0] },
  // Arms - right
  { id: "arm-r", label: "Braco D.", shape: "capsule", size: [0.13, 0.6, 0], position: [0.62, 1.65, 0], rotation: [0, 0, -0.1] },
  { id: "elbow-r", label: "Cotovelo D.", shape: "sphere", size: [0.13, 0, 0], position: [0.7, 1.05, 0] },
  { id: "forearm-r", label: "Antebraco D.", shape: "capsule", size: [0.11, 0.55, 0], position: [0.74, 0.5, 0], rotation: [0, 0, -0.05] },
  { id: "hand-r", label: "Mao D.", shape: "box", size: [0.16, 0.22, 0.08], position: [0.78, 0.05, 0] },
  // Legs - left
  { id: "leg-l", label: "Coxa E.", shape: "capsule", size: [0.18, 0.7, 0], position: [-0.22, 0.05, 0] },
  { id: "knee-l", label: "Joelho E.", shape: "sphere", size: [0.16, 0, 0], position: [-0.22, -0.62, 0] },
  { id: "shin-l", label: "Canela E.", shape: "capsule", size: [0.14, 0.7, 0], position: [-0.22, -1.3, 0] },
  { id: "foot-l", label: "Pe E.", shape: "box", size: [0.2, 0.12, 0.4], position: [-0.22, -2.0, 0.1] },
  // Legs - right
  { id: "leg-r", label: "Coxa D.", shape: "capsule", size: [0.18, 0.7, 0], position: [0.22, 0.05, 0] },
  { id: "knee-r", label: "Joelho D.", shape: "sphere", size: [0.16, 0, 0], position: [0.22, -0.62, 0] },
  { id: "shin-r", label: "Canela D.", shape: "capsule", size: [0.14, 0.7, 0], position: [0.22, -1.3, 0] },
  { id: "foot-r", label: "Pe D.", shape: "box", size: [0.2, 0.12, 0.4], position: [0.22, -2.0, 0.1] },
];

interface BodyPartMeshProps {
  part: BodyPart3DDef;
  color: string;
  selected: boolean;
  hovered: boolean;
  onClick: () => void;
  onHover: (h: boolean) => void;
}

function BodyPartMesh({ part, color, selected, hovered, onClick, onHover }: BodyPartMeshProps) {
  const emissive = useMemo(
    () => new THREE.Color(selected ? "#ff2da8" : hovered ? color : "#000000"),
    [selected, hovered, color]
  );

  const material = (
    <meshStandardMaterial
      color={selected ? "#ff2da8" : color}
      emissive={emissive}
      emissiveIntensity={selected ? 0.6 : hovered ? 0.35 : 0.05}
      roughness={0.55}
      metalness={0.1}
      transparent
      opacity={selected ? 0.95 : hovered ? 0.9 : 0.78}
    />
  );

  const handlers = {
    onClick: (e: any) => {
      e.stopPropagation();
      onClick();
    },
    onPointerOver: (e: any) => {
      e.stopPropagation();
      onHover(true);
      document.body.style.cursor = "pointer";
    },
    onPointerOut: () => {
      onHover(false);
      document.body.style.cursor = "auto";
    },
  };

  if (part.shape === "sphere") {
    return (
      <mesh position={part.position} rotation={part.rotation} {...handlers}>
        <sphereGeometry args={[part.size[0], 24, 24]} />
        {material}
      </mesh>
    );
  }
  if (part.shape === "box") {
    return (
      <mesh position={part.position} rotation={part.rotation} {...handlers}>
        <boxGeometry args={[part.size[0], part.size[1], part.size[2]]} />
        {material}
      </mesh>
    );
  }
  // capsule
  return (
    <mesh position={part.position} rotation={part.rotation} {...handlers}>
      <capsuleGeometry args={[part.size[0], part.size[1], 8, 16]} />
      {material}
    </mesh>
  );
}

interface BodyModel3DProps {
  /** map BodyPart3DDef.id -> color (pain/price color) */
  partColors: Record<string, string>;
  selectedId: string | null;
  /** parts whose id matches the selectedId OR whose id is the parent of selectedId */
  isSelected: (partId: string) => boolean;
  onSelect: (partId: string, label: string) => void;
}

export function BodyModel3D({ partColors, isSelected, onSelect }: BodyModel3DProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const hoveredPart = BODY_PARTS.find((p) => p.id === hoveredId);

  return (
    <div className="w-full h-[480px] rounded-xl bg-gradient-to-b from-card/40 to-background border border-border overflow-hidden relative">
      <Canvas camera={{ position: [0, 0.5, 5.2], fov: 45 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.55} />
          <directionalLight position={[5, 6, 5]} intensity={0.9} castShadow />
          <directionalLight position={[-5, 3, -4]} intensity={0.4} color="#ff66cc" />
          <pointLight position={[0, 3, 4]} intensity={0.4} color="#66ccff" />

          <group position={[0, -0.2, 0]}>
            {BODY_PARTS.map((part) => (
              <BodyPartMesh
                key={part.id}
                part={part}
                color={partColors[part.id] ?? "hsl(180,70%,50%)"}
                selected={isSelected(part.id)}
                hovered={hoveredId === part.id}
                onClick={() => onSelect(part.id, part.label)}
                onHover={(h) => setHoveredId(h ? part.id : null)}
              />
            ))}
          </group>

          <OrbitControls
            enablePan={false}
            minDistance={3.5}
            maxDistance={8}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={(Math.PI * 5) / 6}
            target={[0, 0.3, 0]}
          />
        </Suspense>
      </Canvas>

      {/* Floating label */}
      {hoveredPart && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-md bg-background/90 border border-primary/40 text-xs font-mono uppercase tracking-wider text-foreground pointer-events-none">
          {hoveredPart.label}
        </div>
      )}

      {/* Hint */}
      <div className="absolute bottom-2 right-3 text-[10px] font-mono text-muted-foreground/70 pointer-events-none">
        arraste para girar o modelo
      </div>
    </div>
  );
}
