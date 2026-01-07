import { useEffect, useRef, useState } from "react";
import type { DetectedObject } from "../detector";
import { cropBadgeFromVehicle } from "./cropBadge";
import { readBadgeText } from "./badgeOCR";
import { matchBrandFromText } from "./matchBrand";

export type BadgeResult = {
  brand: string;
  confidence: number;
};

const OCR_INTERVAL = 2000;

export function useVehicleBadgeRecognition(
  video?: HTMLVideoElement,
  vehicle?: DetectedObject
) {
  const [badge, setBadge] = useState<BadgeResult | null>(null);
  const lastRunRef = useRef(0);

  useEffect(() => {
    if (!video || !vehicle || vehicle.label !== "car") {
      setBadge(null);
      return;
    }

    const now = Date.now();
    if (now - lastRunRef.current < OCR_INTERVAL) return;
    lastRunRef.current = now;

    let cancelled = false;

    const run = async () => {
      const crop = cropBadgeFromVehicle(video, vehicle.bbox);
      const text = await readBadgeText(crop);

      if (cancelled || !text) return;

      const brand = matchBrandFromText(text);
      if (!brand) return;

      setBadge({
        brand,
        confidence: 0.85, // OCR confidence heuristic
      });
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [video, vehicle]);

  return badge;
}
