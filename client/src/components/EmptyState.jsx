function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="empty-state">
      {Icon && <Icon size={34} style={{ color: "var(--text-muted)", marginBottom: 12 }} />}
      <h3 style={{ fontSize: "1rem", marginBottom: 6 }}>{title}</h3>
      {description && <p style={{ fontSize: "0.88rem" }}>{description}</p>}
    </div>
  );
}

export default EmptyState;
