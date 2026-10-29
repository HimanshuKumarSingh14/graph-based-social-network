import { LuMenu, LuBell } from "react-icons/lu";
import { useAuth } from "../context/useAuth";
import "./Topbar.css";

function initials(name = "") {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Topbar({ title, subtitle, onMenuClick }) {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <button className="topbar-menu-btn" onClick={onMenuClick} aria-label="Open menu">
        <LuMenu size={22} />
      </button>

      <div className="topbar-titles">
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>

      <div className="topbar-actions">
        <button className="topbar-icon-btn" aria-label="Notifications">
          <LuBell size={19} />
          <span className="topbar-dot" />
        </button>

        <div className="topbar-user">
          <div
            className="avatar"
            style={{ width: 38, height: 38, background: user?.avatarColor || "var(--accent)" }}
          >
            {initials(user?.name || "U")}
          </div>
          <div className="topbar-user-info">
            <span className="topbar-user-name">{user?.name || "User"}</span>
            <span className="topbar-user-email">{user?.email || ""}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
