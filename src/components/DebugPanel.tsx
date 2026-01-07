type Props = {
  message: string;
};

export function DebugPanel({ message }: Props) {
  return (
    <div
      style={{
        position: "fixed",
        top: 12,
        left: 12,
        padding: "8px 12px",
        background: "rgba(0,0,0,0.7)",
        color: "#fff",
        fontSize: 12,
        borderRadius: 4,
      }}
    >
      {message}
    </div>
  );
}
