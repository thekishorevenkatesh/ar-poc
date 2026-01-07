// src/ar/ARCanvas.tsx

import { Canvas } from "@react-three/fiber";
import { ARScene } from "./ARScene";

import type { DetectedObject } from "../vision/detector";
import type { VehicleInfo } from "../vision/vehicle/useVehicleRecognition";
import type { VehiclePart } from "../vision/parts/types";

type Props = {
  target?: DetectedObject;
  vehicle?: VehicleInfo | null;
  parts?: VehiclePart[];
  onRefreshParts?: () => void; // ✅ ADD THIS
};

export function ARCanvas({
  target,
  vehicle,
  parts = [],
  onRefreshParts,
}: Props) {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ARScene
        target={target}
        vehicle={vehicle}
        parts={parts}
        onRefreshParts={onRefreshParts} // ✅ FORWARD
      />
    </Canvas>
  );
}
