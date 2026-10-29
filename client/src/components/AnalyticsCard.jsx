import "./AnalyticsCard.css";

function AnalyticsCard({ title, value, tone = "blue" }) {
  return (
    <div className={`analytics-card tone-${tone}`}>
      <span className="analytics-card-title">{title}</span>
      <span className="analytics-card-value">{value}</span>
    </div>
  );
}

export default AnalyticsCard;
