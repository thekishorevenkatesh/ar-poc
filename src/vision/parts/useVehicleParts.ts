import { useEffect, useRef, useState } from "react";
import type { DetectedObject } from "../detector";
import { cropFromVideo } from "../vehicle/cropVehicle";
import { classifyVehicleParts } from "./partsClassifier";
import type { VehiclePart } from "./types";

const PARTS_INTERVAL = 1500;
const PARTS_CONFIDENCE = 0.6;
const MAX_PARTS = 4;

export function useVehicleParts(
  video?: HTMLVideoElement,
  vehicle?: DetectedObject
) {
  const [parts, setParts] = useState<VehiclePart[]>([]);
  const lastRunRef = useRef(0);
  const hasRunOnceRef = useRef(false);
  const forceRunRef = useRef(0);

  const refresh = () => {
    forceRunRef.current = Date.now();
  };

  useEffect(() => {
    if (!video || !vehicle || vehicle.label !== "car") {
      setParts([]);
      hasRunOnceRef.current = false;
      return;
    }

    const now = Date.now();

    if (
      hasRunOnceRef.current &&
      now - lastRunRef.current < PARTS_INTERVAL &&
      now - forceRunRef.current > 300
    ) {
      return;
    }

    hasRunOnceRef.current = true; // ✅ MISSING LINE
    lastRunRef.current = now;

    let cancelled = false;

    const run = async () => {
      const crop = cropFromVideo(video, vehicle.bbox);
      const result = await classifyVehicleParts(crop);

      if (cancelled) return;

      const filtered =
        result?.filter(
          (p: any) => p.confidence >= PARTS_CONFIDENCE
        ) ?? [];

      setParts(filtered.slice(0, MAX_PARTS));
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [video, vehicle]);

  return { parts, refresh };
}
