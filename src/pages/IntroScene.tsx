type Props = {
  onStart: () => void;
};

export function IntroScene({ onStart }: Props) {
  return (
    <div
      style={{
        width: "100vw",
        height: "100svh", // mobile-safe viewport
        color: "#000",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily:"Open Sans, sans-serif",
        // Safe padding for all screens + notches
        padding: "max(16px, env(safe-area-inset-top)) 16px max(24px, env(safe-area-inset-bottom))",

        textAlign: "center",
        boxSizing: "border-box",
      }}
    >
      {/* Content wrapper to prevent stretching */}
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h1
          style={{
            marginBottom: 12,
            fontSize: "clamp(22px, 6vw, 28px)",
            lineHeight: 1.2,
          }}
        >
          Vehicle AR Scanner
        </h1>

        <p
          style={{
            opacity: 0.8,
            marginBottom: 6,
            fontSize: "clamp(14px, 4vw, 16px)",
          }}
        >
          • Point your camera at a vehicle
        </p>

        <p
          style={{
            opacity: 0.8,
            marginBottom: 6,
            fontSize: "clamp(14px, 4vw, 16px)",
          }}
        >
          • Move closer until detection locks
        </p>

        <p
          style={{
            opacity: 0.8,
            marginBottom: 20,
            fontSize: "clamp(14px, 4vw, 16px)",
          }}
        >
          • Tap parts to inspect details
        </p>

        <button
          onClick={onStart}
          style={{
            padding: "12px 22px",
            fontSize: "clamp(14px, 4vw, 16px)",
            borderRadius: 10,
            border: "none",
            background: "#1D3D9F",
            color: "#fdfdfdff",
            cursor: "pointer",
            minWidth: 160,
          }}
        >
          Start AR
        </button>

        <p
          style={{
            marginTop: 16,
            fontSize: "clamp(11px, 3.5vw, 13px)",
            opacity: 0.6,
            maxWidth: 280,
          }}
        >
          Camera access will be requested next
        </p>
      </div>
    </div>
  );
}
