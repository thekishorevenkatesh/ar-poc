import { Html } from "@react-three/drei";
import { useARAnchor } from "./useARAnchor";
import { useEffect, useRef, useState } from "react";

import type { DetectedObject } from "../vision/detector/detector";
import type { VehiclePart } from "../vision/bike/types";
import { PartLabel } from "./PartLabel";

/* ───────────── Helpers ───────────── */

function getGuidance(
  target?: DetectedObject,
  lastCenter?: [number, number] | null
) {
  if (!target) return "Scanning for vehicle…";

  const [x, y, w, h] = target.bbox;
  const area = w * h;
  const center: [number, number] = [x + w / 2, y + h / 2];

  if (area < 30 * 30) return "Move closer to the vehicle";

  if (lastCenter) {
    const moved =
      Math.abs(lastCenter[0] - center[0]) > 40 ||
      Math.abs(lastCenter[1] - center[1]) > 40;

    if (moved) return "Hold steady";
  }

  return null;
}

function triggerHapticOnce() {
  try {
    if ("vibrate" in navigator) navigator.vibrate(30);
  } catch {
    /* ignore */
  }
}

/* ───────────── Types ───────────── */

type Props = {
  target?: DetectedObject;
  isApache?: boolean;
  parts?: VehiclePart[];
  onRefreshParts?: () => void;
};

/* ───────────── Component ───────────── */

export function ARScene({
  target,
  isApache = false,
  parts = [],
  onRefreshParts,
}: Props) {
  const anchorRef = useARAnchor(target);

  const lastCenterRef = useRef<[number, number] | null>(null);
  const [guidance, setGuidance] = useState<string | null>(null);
  const guidanceTimerRef = useRef<number | null>(null);
  const lockedRef = useRef(false);

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

  const isLocked = lockedRef.current && isApache;

  let vehicleLabel = "Scanning vehicle…";

  if (target?.label === "motorcycle") {
    vehicleLabel = isApache ? "TVS Apache RTR 200 4V" : "Motorcycle detected";
  }
  /* ───────────── Render ───────────── */

  return (
    <>
      <ambientLight intensity={0.8} />

      <group ref={anchorRef}>
        {/* 🔵 Lock ring */}
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

              {isApache && (
                <div style={{ fontSize: 11, opacity: 0.85 }}>Identified</div>
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

        {/* 🔧 Parts */}
        {parts.map((part, index) => (
          <PartLabel key={index} part={part} onSelect={onRefreshParts} />
        ))}
      </group>

      {/* Animation CSS */}
      <Html>
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
