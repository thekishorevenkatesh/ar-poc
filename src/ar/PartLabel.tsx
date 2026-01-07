import { memo } from "react";
import { Html } from "@react-three/drei";
import type { VehiclePart } from "../vision/parts/types";
import { usePartAnchor } from "./usePartAnchor";

type PartLabelProps = {
  part: VehiclePart;
  onSelect?: () => void;
};

function PartLabel({ part, onSelect }: PartLabelProps) {
  const partRef = usePartAnchor(part);

  return (
    <group ref={partRef}>
      <Html distanceFactor={10} transform>
        <div
          onClick={onSelect}
          style={{
            padding: "6px 8px",
            background: "rgba(20,20,20,0.95)",
            borderRadius: 6,
            fontSize: 11,
            color: "#00ffcc",
            cursor: "pointer",
            pointerEvents: "auto",   // ✅ important for clicks
            userSelect: "none",      // ✅ mobile friendly
            whiteSpace: "nowrap",
          }}
        >
          {part.name}
        </div>
      </Html>
    </group>
  );
}

/**
 * memo prevents unnecessary rerenders when other parts change
 * (important for mobile performance)
 */
export default memo(PartLabel);
