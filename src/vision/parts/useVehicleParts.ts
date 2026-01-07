import { useEffect, useRef, useState } from "react";
import type { DetectedObject } from "../detector";
import { cropFromVideo } from "../vehicle/cropVehicle";
import { classifyVehicleParts } from "./partsClassifier";
import type { VehiclePart } from "./types";

/* ───────────── CONFIG ───────────── */

const PARTS_INTERVAL = 1500;       // ms between API calls
const PARTS_CONFIDENCE = 0.6;      // minimum confidence
const CACHE_TTL = 3000;            // ms
const MAX_PARTS = 4;               // render limit
const MOTION_THRESHOLD = 60;       // px movement tolerance
const LOCK_AFTER_STABLE = 2;       // consecutive stable frames

/* ───────────── HOOK ───────────── */

export function useVehicleParts(
  video?: HTMLVideoElement,
  vehicle?: DetectedObject
) {
  const [parts, setParts] = useState<VehiclePart[]>([]);

  const lastRunRef = useRef(0);
  const lastBBoxRef = useRef<[number, number] | null>(null);
  const stableCountRef = useRef(0);
  const lockedRef = useRef(false);

  const cacheRef = useRef<{
    parts: VehiclePart[];
    bbox: [number, number];
    time: number;
  } | null>(null);

  useEffect(() => {
    if (!video || !vehicle || vehicle.label !== "car") return;

    const now = Date.now();
    const [x, y] = vehicle.bbox;

    /* ── 1️⃣ Motion gating (skip if car moved a lot) ── */
    if (lastBBoxRef.current) {
      const [px, py] = lastBBoxRef.current;
      const moved =
        Math.abs(px - x) > MOTION_THRESHOLD ||
        Math.abs(py - y) > MOTION_THRESHOLD;

      if (moved) {
        stableCountRef.current = 0;
        lockedRef.current = false;
        lastBBoxRef.current = [x, y];
        return;
      }
    }

    lastBBoxRef.current = [x, y];

    /* ── 2️⃣ Cache reuse ── */
    if (
      cacheRef.current &&
      now - cacheRef.current.time < CACHE_TTL
    ) {
      setParts(cacheRef.current.parts);
      return;
    }

    /* ── 3️⃣ Stop calling API if locked ── */
    if (lockedRef.current) return;

    /* ── 4️⃣ Throttle API calls ── */
    if (now - lastRunRef.current < PARTS_INTERVAL) return;
    lastRunRef.current = now;

    let cancelled = false;

    const run = async () => {
      const crop = cropFromVideo(video, vehicle.bbox);
      const result = await classifyVehicleParts(crop);

      if (cancelled || !result?.length) return;

      /* ── 5️⃣ Confidence filtering + cap count ── */
      const filtered = result
        .filter((p :any)=> p.confidence >= PARTS_CONFIDENCE)
        .slice(0, MAX_PARTS);

      if (!filtered.length) return;

      setParts(filtered);

      cacheRef.current = {
        parts: filtered,
        bbox: [x, y],
        time: Date.now(),
      };

      /* ── 6️⃣ Stability lock (prevents flicker) ── */
      stableCountRef.current += 1;
      if (stableCountRef.current >= LOCK_AFTER_STABLE) {
        lockedRef.current = true;
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [video, vehicle]);

  return parts;
}
