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

export function useVehicleRecognition(
  video?: HTMLVideoElement,
  object?: DetectedObject
) {
  const [vehicle, setVehicle] = useState<VehicleInfo | null>(null);

  // internal memory
  const lastRef = useRef<VehicleInfo | null>(null);
  const lastSeenRef = useRef<number>(0);

  useEffect(() => {
    if (!video || !object || object.label !== "car") return;

    let cancelled = false;

    const run = async () => {
      const crop = cropFromVideo(video, object.bbox);
      const result = await classifyVehicle(crop);

      const now = Date.now();

      if (cancelled) return;

      // If API gives nothing or very low confidence
      if (!result || result.confidence < MIN_ACCEPT_CONFIDENCE) {
        if (
          lastRef.current &&
          now - lastSeenRef.current < HOLD_TIME_MS
        ) {
          // keep last known vehicle
          setVehicle(lastRef.current);
        }
        return;
      }

      // First valid detection
      if (!lastRef.current) {
        lastRef.current = result;
        lastSeenRef.current = now;
        setVehicle(result);
        return;
      }

      // Same vehicle → smooth confidence
      if (
        result.brand === lastRef.current.brand &&
        result.model === lastRef.current.model
      ) {
        const smoothedConfidence =
          lastRef.current.confidence * (1 - CONFIDENCE_ALPHA) +
          result.confidence * CONFIDENCE_ALPHA;

        lastRef.current = {
          ...result,
          confidence: smoothedConfidence,
        };
      } else {
        // Different vehicle detected → switch only if strong
        if (result.confidence > lastRef.current.confidence + 0.15) {
          lastRef.current = result;
        }
      }

      lastSeenRef.current = now;
      setVehicle(lastRef.current);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [video, object]);

  return vehicle;
}
