import { useEffect, useRef, useState } from "react";
import type { DetectedObject } from "../detector";
import { cropFromVideo } from "../vehicle/cropVehicle";
import { detectBadge } from "./badgeDetector";
import { readBadgeText } from "./badgeOCR";

export type BadgeResult = {
  brand?: string;
  model?: string;
  confidence: number;
};

const INTERVAL = 2500;

export function useVehicleBadgeRecognition(
  video?: HTMLVideoElement,
  vehicle?: DetectedObject
) {
  const [result, setResult] =
    useState<BadgeResult | null>(null);

  const lastRunRef = useRef(0);

  useEffect(() => {
    if (!video || !vehicle || vehicle.label !== "car") return;

    const now = Date.now();
    if (now - lastRunRef.current < INTERVAL) return;
    lastRunRef.current = now;

    let cancelled = false;

    const run = async () => {
      const vehicleCrop = cropFromVideo(
        video,
        vehicle.bbox
      );

      // 1️⃣ Detect logo
      const logos = await detectBadge(vehicleCrop);
      if (!logos.length) return;

      const logo = logos[0]; // highest confidence
      const brand = logo.class
        .replace("_logo", "")
        .toUpperCase();

      // 2️⃣ Crop logo area for OCR
      const badgeCrop = cropFromVideo(
        video,
        [
          vehicle.bbox[0] + logo.x - logo.width / 2,
          vehicle.bbox[1] + logo.y - logo.height / 2,
          logo.width,
          logo.height,
        ]
      );

      // 3️⃣ OCR
      const text = await readBadgeText(badgeCrop);

      if (cancelled) return;

      setResult({
        brand,
        model: text || undefined,
        confidence: 0.9,
      });
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [video, vehicle]);

  return result;
}
