import { useEffect, useRef, useState } from "react";
import type { DetectedObject } from "../detector";
import { cropFromVideo } from "./cropVehicle";
import { classifyVehicle } from "./vehicleClassifier";

export type VehicleInfo = {
  brand: string;
  model: string;
  confidence: number;
};

const CONFIDENCE_ALPHA = 0.3;      // smoothing factor
const MIN_ACCEPT_CONFIDENCE = 0.6; // ignore weak predictions
const HOLD_TIME_MS = 2000;         // keep label alive if detection drops
const RECOGNITION_INTERVAL = 1200; // ms (API throttle)

export function useVehicleRecognition(
  video?: HTMLVideoElement,
  object?: DetectedObject
) {
  const [vehicle, setVehicle] = useState<VehicleInfo | null>(null);

  // internal memory
  const lastRef = useRef<VehicleInfo | null>(null);
  const lastSeenRef = useRef<number>(0);
  const lastRunRef = useRef<number>(0);

  useEffect(() => {
    if (!video || !object || object.label !== "car") return;

    const now = Date.now();

    // 🔒 Rate limit API calls
    if (now - lastRunRef.current < RECOGNITION_INTERVAL) {
      return;
    }

    lastRunRef.current = now;

    let cancelled = false;

    const run = async () => {
      const crop = cropFromVideo(video, object.bbox);
      const result = await classifyVehicle(crop);

      if (cancelled) return;

      const timestamp = Date.now();

      // ❌ No or weak prediction
      if (!result || result.confidence < MIN_ACCEPT_CONFIDENCE) {
        if (
          lastRef.current &&
          timestamp - lastSeenRef.current < HOLD_TIME_MS
        ) {
          setVehicle(lastRef.current);
        }
        return;
      }

      // ✅ First valid detection
      if (!lastRef.current) {
        lastRef.current = result;
        lastSeenRef.current = timestamp;
        setVehicle(result);
        return;
      }

      // 🔁 Same vehicle → smooth confidence
      if (
        result.brand === lastRef.current.brand &&
        result.model === lastRef.current.model
      ) {
        lastRef.current = {
          ...result,
          confidence:
            lastRef.current.confidence * (1 - CONFIDENCE_ALPHA) +
            result.confidence * CONFIDENCE_ALPHA,
        };
      } else {
        // 🔄 Switch vehicle only if clearly stronger
        if (result.confidence > lastRef.current.confidence + 0.15) {
          lastRef.current = result;
        }
      }

      lastSeenRef.current = timestamp;
      setVehicle(lastRef.current);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [video, object]);

  return vehicle;
}
