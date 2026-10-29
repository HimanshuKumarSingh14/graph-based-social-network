import "./CommunityCard.css";

function initials(name = "") {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function CommunityCard({ community }) {
  const { id, color, size, members } = community;

  return (
    <div className="community-card card fade-in">
      <div className="community-card-header">
        <span className="community-dot" style={{ background: color }} />
        <h3>Community {id}</h3>
        <span className="community-size-badge" style={{ background: `${color}22`, color }}>
          {size} members
        </span>
      </div>
      <ul className="community-members">
        {members.map((m) => (
          <li key={m.email}>
            <span className="avatar" style={{ width: 26, height: 26, fontSize: "0.65rem", background: m.avatarColor }}>
              {initials(m.name)}
            </span>
            {m.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CommunityCard;
