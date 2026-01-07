import { ARCanvas } from "../ar/ARCanvas";
import { useCamera } from "../vision/useCamera";
import { useObjectDetection } from "../vision/useObjectDetection";
import { useVehicleRecognition } from "../vision/vehicle/useVehicleRecognition";
import { BoundingBoxOverlay } from "../components/BoundingBoxOverlay";
import { DebugPanel } from "../components/DebugPanel";

export function ARPage() {
  const { videoRef, ready, error, dimensions } = useCamera();
  const objects = useObjectDetection(videoRef.current ?? undefined, ready);

  const primary = objects.find(o => o.label === "car");
  const vehicle = useVehicleRecognition(
    videoRef.current ?? undefined,
    primary
  );

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <video
        ref={videoRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      <BoundingBoxOverlay
        objects={objects}
        videoWidth={dimensions.width}
        videoHeight={dimensions.height}
      />

      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <ARCanvas target={primary} vehicle={vehicle} />
      </div>

      <DebugPanel
        message={
          error
            ? error
            : vehicle
            ? `${vehicle.brand} ${vehicle.model}`
            : primary
            ? "Car detected"
            : ready
            ? "Scanning..."
            : "Starting camera..."
        }
      />
    </div>
  );
}
