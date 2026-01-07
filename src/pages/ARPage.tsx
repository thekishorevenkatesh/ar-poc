import { useState } from "react";

import { ARCanvas } from "../ar/ARCanvas";
import { StartARButton } from "../ar/StartARButton";
import { DebugPanel } from "../components/DebugPanel";
import { BoundingBoxOverlay } from "../components/BoundingBoxOverlay";
import { IntroScene } from "./IntroScene";

import { useCamera } from "../vision/useCamera";
import { useObjectDetection } from "../vision/useObjectDetection";
import { useVehicleRecognition } from "../vision/vehicle/useVehicleRecognition";
import { useVehicleParts } from "../vision/parts/useVehicleParts";
import { useVehicleBadgeRecognition } from "../vision/badge/useVehicleBadgeRecognition";
import { mergeVehicleResults } from "../vision/vehicle/mergeVehicleResults";

import { pickVehicle } from "../utils/vehicleFilter";

export function ARPage() {
  /* ───────── UI state ───────── */
  const [scene, setScene] = useState<"intro" | "ar">("intro");
  const [showParts, setShowParts] = useState(true);

  /* ───────── Camera (enabled only in AR) ───────── */
  const { videoRef, ready, error, dimensions } = useCamera(scene === "ar");

  /* ───────── Object detection ───────── */
  const objects = useObjectDetection(
    videoRef.current ?? undefined,
    ready && scene === "ar"
  );

  /* ✅ PICK ONLY VEHICLE */
  const vehicleObject = pickVehicle(objects);

  /* ───────── Vehicle recognition ───────── */
  const vehicle = useVehicleRecognition(
    videoRef.current ?? undefined,
    vehicleObject
  );

  const badge = useVehicleBadgeRecognition(
    videoRef.current ?? undefined,
    vehicleObject
  );

  const finalVehicle = mergeVehicleResults(vehicle, badge);

  /* ───────── Vehicle parts ───────── */
  const { parts, refresh } = useVehicleParts(
    videoRef.current ?? undefined,
    vehicleObject
  );

  /* ───────── Intro scene ───────── */
  if (scene === "intro") {
    return <IntroScene onStart={() => setScene("ar")} />;
  }

  /* ───────── AR scene ───────── */
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        background: "#000",
        overflow: "hidden",
      }}
    >
      {/* Camera */}
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

      {/* Debug boxes */}
      <BoundingBoxOverlay
        objects={objects}
        videoWidth={dimensions.width}
        videoHeight={dimensions.height}
      />

      {/* AR layer */}
      <div style={{ position: "absolute", inset: 0 }}>
        <ARCanvas
          target={vehicleObject}
          vehicle={finalVehicle}
          parts={showParts ? parts : []}
          onRefreshParts={refresh}
        />
      </div>

      {/* Toggle */}
      {ready && (
        <div
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            zIndex: 20,
          }}
        >
          <button
            onClick={() => setShowParts((v) => !v)}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              border: "none",
              background: showParts ? "#1D3D9F" : "#333",
              color: "#fff",
            }}
          >
            {showParts ? "Hide Parts" : "Show Parts"}
          </button>
        </div>
      )}

      {/* Status */}
      <DebugPanel
        message={
          error
            ? error
            : vehicleObject
            ? finalVehicle
              ? `Detected ${finalVehicle.brand} ${finalVehicle.model}`
              : "Identifying vehicle…"
            : ready
            ? objects.length > 0
              ? "Non-vehicle detected. Point camera at a vehicle."
              : "Scanning for vehicles…"
            : "Starting camera…"
        }
      />
    </div>
  );
}
