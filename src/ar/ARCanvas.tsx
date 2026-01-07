import { Canvas } from "@react-three/fiber";
import { ARScene } from "./ARScene";
import type { DetectedObject } from "../vision/detector";
import type { VehicleInfo } from "../vision/vehicle/useVehicleRecognition";

type Props = {
  target?: DetectedObject;
  vehicle?: VehicleInfo | null;
};

export function ARCanvas({ target, vehicle }: Props) {
  return (
    <Canvas camera={{ position: [0, 0, 0] }}>
      <ARScene target={target} vehicle={vehicle} />
    </Canvas>
  );
}
