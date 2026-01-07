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

  useEffect(() => {
    if (!video || !vehicle || vehicle.label !== "car") {
      setParts([]);
      hasRunOnceRef.current = false;
      return;
    }

    const now = Date.now();

    // 🔥 Allow FIRST run no matter what
    if (!hasRunOnceRef.current) {
      hasRunOnceRef.current = true;
    } else {
      // throttle only AFTER first run
      if (now - lastRunRef.current < PARTS_INTERVAL) return;
    }

    lastRunRef.current = now;
    let cancelled = false;

    const run = async () => {
      console.log("[PARTS] Running parts detection");

      const crop = cropFromVideo(video, vehicle.bbox);
      const result = await classifyVehicleParts(crop);

      if (cancelled) return;

      if (!result?.length) {
        console.log("[PARTS] No parts detected");
        setParts([]);
        return;
      }

      const filtered = result
        .filter((p:any) => p.confidence >= PARTS_CONFIDENCE)
        .slice(0, MAX_PARTS);

      console.log("[PARTS] Detected:", filtered);

      setParts(filtered);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [video, vehicle]);

  return parts;
}
