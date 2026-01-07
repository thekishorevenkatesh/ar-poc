type Props = {
  onStart: () => void;
};

export function IntroScene({ onStart }: Props) {
  return (
    <div
      style={{
        width: "100vw",
        height: "100svh",
        background: "#fff",
        color: "#000",
        fontFamily: "Open Sans, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding:
          "max(16px, env(safe-area-inset-top)) 16px max(16px, env(safe-area-inset-bottom))",
        boxSizing: "border-box",
        textAlign: "center",
      }}
    >
      {/* Main content */}
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flexGrow: 1,
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

        <p style={styles.text}>• Point your camera at a vehicle</p>
        <p style={styles.text}>• Move closer until detection locks</p>
        <p style={{ ...styles.text, marginBottom: 20 }}>
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
            color: "#fff",
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

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          opacity: 0.75,
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <span style={{ fontSize: 10, color: "#666" }}>Powered by</span>
        <img
          src="/logo-exathought.png"
          alt="ExaThought"
          style={{ height: 22 }}
        />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  text: {
    opacity: 0.8,
    marginBottom: 6,
    fontSize: "clamp(14px, 4vw, 16px)",
  },
};
