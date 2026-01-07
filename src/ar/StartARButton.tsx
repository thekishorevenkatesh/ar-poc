export function StartARButton() {
  const startAR = async () => {
    if (!navigator.xr) {
      alert("WebXR not supported on this device");
      return;
    }

    const supported = await navigator.xr.isSessionSupported("immersive-ar");
    if (!supported) {
      alert("Immersive AR not supported");
      return;
    }

    await navigator.xr.requestSession("immersive-ar", {
      requiredFeatures: ["local"],
    });
  };

  return (
    <button
      onClick={startAR}
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        padding: "10px 14px",
        background: "#1e6bff",
        color: "#fff",
        border: "none",
        borderRadius: 6,
        fontSize: 14,
        zIndex: 10,
      }}
    >
      Start AR
    </button>
  );
}
