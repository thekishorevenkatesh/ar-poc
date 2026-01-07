// src/ar/ARScene.tsx

import { Html } from "@react-three/drei";
import { useARAnchor } from "./useARAnchor";
import { usePartAnchor } from "./usePartAnchor";
import { useEffect, useRef, useState } from "react";

import type { DetectedObject } from "../vision/detector";
import type { VehicleInfo } from "../vision/vehicle/useVehicleRecognition";
import type { VehiclePart } from "../vision/parts/types";

/* ───────────── Helpers ───────────── */

function getGuidance(
  target?: DetectedObject,
  lastCenter?: [number, number] | null
) {
  if (!target) return "Scanning for vehicle…";

  const [x, y, w, h] = target.bbox;
  const area = w * h;
  const center: [number, number] = [x + w / 2, y + h / 2];

  if (area < 120 * 120) {
    return "Move closer to the vehicle";
  }

  if (lastCenter) {
    const moved =
      Math.abs(lastCenter[0] - center[0]) > 40 ||
      Math.abs(lastCenter[1] - center[1]) > 40;

    if (moved) {
      return "Hold steady";
    }
  }

  return null;
}

function partColor(conf: number) {
  if (conf >= 0.85) return "#00ffcc";
  if (conf >= 0.7) return "#ffd166";
  return "#ff6b6b";
}

/* ───────────── Types ───────────── */

type Props = {
  target?: DetectedObject;
  vehicle?: VehicleInfo | null;
  parts?: VehiclePart[];
};

/* ───────────── Component ───────────── */

export function ARScene({ target, vehicle, parts = [] }: Props) {
  const anchorRef = useARAnchor(target);

  // Motion tracking
  const lastCenterRef = useRef<[number, number] | null>(null);

  // Guidance state
  const [guidance, setGuidance] = useState<string | null>(null);
  const guidanceTimerRef = useRef<number | null>(null);

  // Lock + haptic
  const lockedRef = useRef(false);

  // Selected part (tap)
  const [selectedPart, setSelectedPart] =
    useState<VehiclePart | null>(null);

  // Confidence smoothing store
  const smoothConfRef = useRef<Map<string, number>>(new Map());

  /* ───────────── Guidance + Lock Logic ───────────── */

  useEffect(() => {
    if (!target) {
      setGuidance(null);
      lockedRef.current = false;
      return;
    }

    const [x, y, w, h] = target.bbox;
    const center: [number, number] = [x + w / 2, y + h / 2];

    const newGuidance = getGuidance(
      target,
      lastCenterRef.current
    );

    lastCenterRef.current = center;

    if (newGuidance) {
      setGuidance(newGuidance);
      lockedRef.current = false;

      if (guidanceTimerRef.current) {
        clearTimeout(guidanceTimerRef.current);
        guidanceTimerRef.current = null;
      }
    } else {
      // No guidance → stable
      if (!lockedRef.current) {
        lockedRef.current = true;

        // 📳 Haptic feedback (mobile)
        if ("vibrate" in navigator) {
          navigator.vibrate(30);
        }

        // Auto-hide guidance after short delay
        guidanceTimerRef.current = window.setTimeout(
          () => setGuidance(null),
          800
        );
      }
    }
  }, [target]);

  /* ───────────── Vehicle Label ───────────── */

  let vehicleLabel = "Scanning vehicle…";
  if (target && !vehicle) vehicleLabel = "Vehicle detected";
  if (vehicle) vehicleLabel = `${vehicle.brand} ${vehicle.model}`;

  /* ───────────── Render ───────────── */

  return (
    <>
      <ambientLight intensity={0.8} />

      {/* Invisible ground */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -1, -2]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial visible={false} />
      </mesh>

      <group ref={anchorRef}>
        {/* 🚗 Vehicle label */}
        {target && (
          <Html center distanceFactor={8}>
            <div
              style={{
                padding: "8px 12px",
                background: "rgba(0,0,0,0.85)",
                color: "#fff",
                borderRadius: 6,
                fontSize: 13,
                textAlign: "center",
                minWidth: 150,
              }}
            >
              <strong>{vehicleLabel}</strong>

              {vehicle && (
                <div style={{ fontSize: 11, opacity: 0.85 }}>
                  {Math.round(vehicle.confidence * 100)}%
                </div>
              )}

              {guidance && (
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 11,
                    color: "#ffd166",
                    opacity: 0.8,
                  }}
                >
                  {guidance}
                </div>
              )}
            </div>
          </Html>
        )}

        {/* 🔧 Vehicle parts */}
        {parts.map((part, index) => {
          const partRef = usePartAnchor(part);

          // 🔄 Confidence smoothing
          const key = part.name;
          const prev =
            smoothConfRef.current.get(key) ??
            part.confidence;

          const smoothed =
            prev * 0.7 + part.confidence * 0.3;

          smoothConfRef.current.set(key, smoothed);

          const isSelected = selectedPart === part;

          return (
            <group ref={partRef} key={index}>
              <Html distanceFactor={10}>
                <div
                  onClick={() =>
                    setSelectedPart(
                      isSelected ? null : part
                    )
                  }
                  style={{
                    padding: "6px 8px",
                    background: "rgba(20,20,20,0.95)",
                    borderRadius: 6,
                    fontSize: 11,
                    whiteSpace: "nowrap",
                    color: partColor(smoothed),
                    cursor: "pointer",
                    border: isSelected
                      ? "1px solid #00ffcc"
                      : "1px solid transparent",
                  }}
                >
                  {/* Part name */}
                  <div style={{ marginBottom: 4 }}>
                    {part.name}
                  </div>

                  {/* Confidence bar */}
                  <div
                    style={{
                      width: 60,
                      height: 4,
                      background: "#333",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.round(
                          smoothed * 100
                        )}%`,
                        height: "100%",
                        background: partColor(smoothed),
                      }}
                    />
                  </div>

                  {isSelected && (
                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 10,
                        opacity: 0.8,
                      }}
                    >
                      Confidence:{" "}
                      {Math.round(smoothed * 100)}%
                    </div>
                  )}
                </div>
              </Html>
            </group>
          );
        })}
      </group>
    </>
  );
}
