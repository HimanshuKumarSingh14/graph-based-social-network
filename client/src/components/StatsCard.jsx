import "./StatsCard.css";

function StatsCard({ title, value, growth, icon: Icon, tone = "blue" }) {
  return (
    <div className={`stat-card card tone-${tone}`}>
      <div className="stat-card-top">
        <span className="stat-card-title">{title}</span>
        {Icon && (
          <span className="stat-card-icon">
            <Icon size={18} />
          </span>
        )}
      </div>
      <div className="stat-card-value">{value}</div>
      {growth && <div className="stat-card-growth">{growth}</div>}
    </div>
  );
}

export default StatsCard;
