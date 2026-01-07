import { useEffect, useState } from "react";
import type { DetectedObject } from "../detector";
import type { VehiclePart } from "./types";

export function useVehicleParts(
  _video?: HTMLVideoElement,
  vehicle?: DetectedObject
) {
  const [parts, setParts] = useState<VehiclePart[]>([]);

  const refresh = () => {
    if (!vehicle) return;

    setParts([
      {
        name: "Headlight",
        confidence: 0.9,
        bbox: [0, 0, 50, 50], // ✅ dummy bbox
      },
      {
        name: "Wheel",
        confidence: 0.85,
        bbox: [60, 60, 40, 40], // ✅ dummy bbox
      },
    ]);
  };

  useEffect(() => {
    if (!vehicle) {
      setParts([]);
      return;
    }
    refresh();
  }, [vehicle]);

  return { parts, refresh };
}
