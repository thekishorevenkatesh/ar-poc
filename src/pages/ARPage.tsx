import { useState } from "react";
import { ARCanvas } from "../ar/ARCanvas";
import { StartARButton } from "../ar/StartARButton";
import { DebugPanel } from "../components/DebugPanel";
import { BoundingBoxOverlay } from "../components/BoundingBoxOverlay";

import { useCamera } from "../vision/useCamera";
import { useObjectDetection } from "../vision/useObjectDetection";
import { useVehicleRecognition } from "../vision/vehicle/useVehicleRecognition";
import { useVehicleParts } from "../vision/parts/useVehicleParts";
import { IntroScene } from "./IntroScene";

export function ARPage() {
  const [scene, setScene] = useState<"intro" | "ar">("intro");

  const { videoRef, ready, error, dimensions } = useCamera(scene==="ar");
  const [showParts, setShowParts] = useState(true);

  const objects = useObjectDetection(videoRef.current ?? undefined, ready);
  const vehicleObject = objects.find(o => o.label === "car");

  const vehicle = useVehicleRecognition(
    videoRef.current ?? undefined,
    vehicleObject
  );

  const { parts, refresh } = useVehicleParts(
    videoRef.current ?? undefined,
    vehicleObject
  );

  if (scene === "intro") {
    return <IntroScene onStart={() => setScene("ar")} />;
  }
  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <video
        ref={videoRef}
        playsInline
        muted
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      {!ready && <StartARButton />}

      <BoundingBoxOverlay
        objects={objects}
        videoWidth={dimensions.width}
        videoHeight={dimensions.height}
      />

      <div style={{ position: "absolute", inset: 0 }}>
        <ARCanvas
          target={vehicleObject}
          vehicle={vehicle}
          parts={showParts ? parts : []}
          onRefreshParts={refresh}
        />
      </div>

      <DebugPanel
        message={
          error
            ? error
            : vehicleObject
            ? vehicle
              ? `Detected ${vehicle.brand} ${vehicle.model}`
              : "Vehicle detected (brand not identified)"
            : ready
            ? "Scanning for vehicles…"
            : "Starting camera…"
        }
      />

      {ready && (
        <button
          onClick={() => setShowParts(v => !v)}
          style={{
            position: "absolute",
            bottom: 20,
            right: 20,
            padding: "8px 12px",
            borderRadius: 6,
            border: "none",
            background: "#00ffcc",
            fontSize: 13,
          }}
        >
          {showParts ? "Hide Parts" : "Show Parts"}
        </button>
      )}
    </div>
  );
}
