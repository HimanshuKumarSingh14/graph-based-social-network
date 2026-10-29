function Loader({ label = "Loading..." }) {
  return (
    <div className="center-flex" style={{ flexDirection: "column", gap: 12, padding: "60px 0" }}>
      <div className="spinner" />
      <span style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>{label}</span>
    </div>
  );
}

export default Loader;
