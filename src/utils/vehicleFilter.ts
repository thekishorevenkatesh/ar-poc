import type { DetectedObject } from "../vision/detector";

export const VEHICLE_LABELS = [
  "car",
  "truck",
  "bus",
  "motorcycle",
];

export function pickVehicle(
  objects: DetectedObject[]
): DetectedObject | undefined {
  return objects.find(obj =>
    VEHICLE_LABELS.includes(obj.label)
  );
}
