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

  if (area < 120 * 120) return "Move closer to the vehicle";

  if (lastCenter) {
    const moved =
      Math.abs(lastCenter[0] - center[0]) > 40 ||
      Math.abs(lastCenter[1] - center[1]) > 40;

    if (moved) return "Hold steady";
  }

  return null;
}

function partColor(conf: number) {
  if (conf >= 0.85) return "#00ffcc";
  if (conf >= 0.7) return "#ffd166";
  return "#ff6b6b";
}

function triggerHapticOnce() {
  try {
    if ("vibrate" in navigator) navigator.vibrate(30);
  } catch {}
}

/* ───────────── Types ───────────── */

type Props = {
  target?: DetectedObject;
  vehicle?: VehicleInfo | null;
  parts?: VehiclePart[];
  onRefreshParts?: () => void; // ✅ ADDED
};

/* ───────────── Component ───────────── */

export function ARScene({
  target,
  vehicle,
  parts = [],
  onRefreshParts, // ✅ ADDED
}: Props) {
  const anchorRef = useARAnchor(target);

  const lastCenterRef = useRef<[number, number] | null>(null);
  const [guidance, setGuidance] = useState<string | null>(null);
  const guidanceTimerRef = useRef<number | null>(null);
  const lockedRef = useRef(false);

  const [selectedPart, setSelectedPart] = useState<VehiclePart | null>(null);

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

    const newGuidance = getGuidance(target, lastCenterRef.current);

    lastCenterRef.current = center;

    if (newGuidance) {
      setGuidance(newGuidance);
      lockedRef.current = false;

      if (guidanceTimerRef.current) {
        clearTimeout(guidanceTimerRef.current);
        guidanceTimerRef.current = null;
      }
    } else if (!lockedRef.current) {
      lockedRef.current = true;
      triggerHapticOnce();
      guidanceTimerRef.current = window.setTimeout(
        () => setGuidance(null),
        800
      );
    }
  }, [target]);

  const isLocked = lockedRef.current && !!vehicle; // ✅ ADDED

  let vehicleLabel = "Scanning vehicle…";
  if (target && !vehicle) vehicleLabel = "Vehicle detected";
  if (vehicle) vehicleLabel = `${vehicle.brand} ${vehicle.model}`;

  /* ───────────── Render ───────────── */

  return (
    <>
      <ambientLight intensity={0.8} />

      <group ref={anchorRef}>
        {/* 🔵 VEHICLE LOCK RING — ADDED */}
        {isLocked && (
          <Html center distanceFactor={8}>
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: "50%",
                border: "2px solid rgba(0,255,204,0.9)",
                animation: "lockPulse 1.2s ease-out",
                pointerEvents: "none",
              }}
            />
          </Html>
        )}

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

          const prev = smoothConfRef.current.get(part.name) ?? part.confidence;

          const smoothed = prev * 0.7 + part.confidence * 0.3;

          smoothConfRef.current.set(part.name, smoothed);

          const isSelected = selectedPart === part;

          return (
            <group ref={partRef} key={index}>
              <Html distanceFactor={10}>
                <div
                  onClick={() => {
                    setSelectedPart(isSelected ? null : part);
                    onRefreshParts?.(); // 🔁 ADDED
                  }}
                  style={{
                    padding: "6px 8px",
                    background: "rgba(20,20,20,0.95)",
                    borderRadius: 6,
                    fontSize: 11,
                    color: partColor(smoothed),
                    cursor: "pointer",
                    border: isSelected
                      ? "1px solid #00ffcc"
                      : "1px solid transparent",
                  }}
                >
                  {part.name}
                </div>
              </Html>
            </group>
          );
        })}
      </group>
      <Html>
        {/* 🔵 Lock ring animation */}
        <style>
          {`
          @keyframes lockPulse {
            0% { transform: scale(0.7); opacity: 0.8; }
            100% { transform: scale(1.1); opacity: 0.2; }
          }
        `}
        </style>
      </Html>
    </>
  );
}
