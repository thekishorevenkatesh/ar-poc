import { Canvas } from "@react-three/fiber";
import { ARScene } from "./ARScene";
import type { DetectedObject } from "../vision/detector/detector";
import type { VehiclePart } from "../vision/bike/types";

type Props = {
  target?: DetectedObject;
  parts?: VehiclePart[];
  onRefreshParts?: () => void;
};

export function ARCanvas({
  target,
  parts = [],
  onRefreshParts,
}: Props) {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ARScene
        target={target}
        parts={parts}
        onRefreshParts={onRefreshParts}
      />
    </Canvas>
  );
}
