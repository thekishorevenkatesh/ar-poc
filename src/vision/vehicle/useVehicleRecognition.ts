import { useEffect, useRef, useState } from "react";
import type { DetectedObject } from "../detector";
import { cropFromVideo } from "./cropVehicle";
import { classifyVehicle } from "./vehicleClassifier";

export type VehicleInfo = {
  brand: string;
  model: string;
  confidence: number;
};

const RECOGNITION_INTERVAL = 1200;
const CACHE_TTL = 4000;
const LOCK_CONFIDENCE = 0.9;
const MOTION_THRESHOLD = 60;

type CacheEntry = VehicleInfo & {
  center: [number, number];
  lastSeen: number;
};

export function useVehicleRecognition(
  video?: HTMLVideoElement,
  object?: DetectedObject
) {
  const [vehicle, setVehicle] = useState<VehicleInfo | null>(null);

  const lastRunRef = useRef(0);
  const lockedRef = useRef(false);
  const lastCenterRef = useRef<[number, number] | null>(null);
  const cacheRef = useRef<CacheEntry[]>([]);

  useEffect(() => {
    if (!video || !object || object.label !== "car") {
      lockedRef.current = false;
      lastCenterRef.current = null;
      setVehicle(null);
      return;
    }

    const now = Date.now();
    const [x, y, w, h] = object.bbox;
    const center: [number, number] = [x + w / 2, y + h / 2];

    /* ── 1️⃣ Motion gating ── */
    if (lastCenterRef.current) {
      const [px, py] = lastCenterRef.current;
      const moved =
        Math.abs(px - center[0]) > MOTION_THRESHOLD ||
        Math.abs(py - center[1]) > MOTION_THRESHOLD;

      if (moved) {
        lockedRef.current = false;
        lastCenterRef.current = center;
        return;
      }
    }

    lastCenterRef.current = center;

    /* ── 2️⃣ Cache lookup ── */
    const cached = cacheRef.current.find(c => {
      const [cx, cy] = c.center;
      return (
        Math.abs(cx - center[0]) < 40 &&
        Math.abs(cy - center[1]) < 40 &&
        now - c.lastSeen < CACHE_TTL
      );
    });

    if (cached) {
      cached.lastSeen = now;
      setVehicle(cached);
      return;
    }

    /* ── 3️⃣ Stop API if locked ── */
    if (lockedRef.current) return;

    /* ── 4️⃣ Throttle API calls ── */
    if (now - lastRunRef.current < RECOGNITION_INTERVAL) return;
    lastRunRef.current = now;

    let cancelled = false;

    const run = async () => {
      const crop = cropFromVideo(video, object.bbox);
      const result = await classifyVehicle(crop);

      if (cancelled || !result) return;

      setVehicle(result);

      cacheRef.current.push({
        ...result,
        center,
        lastSeen: now,
      });

      if (cacheRef.current.length > 5) {
        cacheRef.current.shift();
      }

      /* ── 5️⃣ Lock on strong confidence ── */
      if (result.confidence >= LOCK_CONFIDENCE) {
        lockedRef.current = true;
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [video, object]);

  return vehicle;
}
