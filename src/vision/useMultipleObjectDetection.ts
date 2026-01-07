import { useEffect, useRef, useState } from "react";
import { detectObjects } from "./detector";
import type { DetectedObject } from "./detector";

const CONFIDENCE_THRESHOLD = 0.7;
const LOCK_TIMEOUT_MS = 1500;
const MAX_OBJECTS = 3;

type LockedObject = DetectedObject & {
  lastSeen: number;
};

export function useMultipleObjectDetection(
  video?: HTMLVideoElement,
  enabled = true
) {
  const [objects, setObjects] = useState<DetectedObject[]>([]);
  const lockedRef = useRef<Map<string, LockedObject>>(new Map());
  const runningRef = useRef(false);

  useEffect(() => {
    if (!video || !enabled) return;

    runningRef.current = true;

    const run = async () => {
      if (!runningRef.current) return;

      const detections = await detectObjects(video);
      const now = Date.now();

      // Update or add strong detections
      detections.forEach(obj => {
        if (obj.score >= CONFIDENCE_THRESHOLD) {
          const key = `${obj.label}-${Math.round(obj.bbox[0])}-${Math.round(
            obj.bbox[1]
          )}`;

          lockedRef.current.set(key, {
            ...obj,
            lastSeen: now,
          });
        }
      });

      // Remove stale objects
      for (const [key, value] of lockedRef.current) {
        if (now - value.lastSeen > LOCK_TIMEOUT_MS) {
          lockedRef.current.delete(key);
        }
      }

      // Limit count to avoid clutter
      const activeObjects = Array.from(lockedRef.current.values())
        .slice(0, MAX_OBJECTS)
        .map(({ lastSeen, ...obj }) => obj);

      setObjects(activeObjects);

      setTimeout(run, 200);
    };

    run();

    return () => {
      runningRef.current = false;
    };
  }, [video, enabled]);

  return objects;
}
