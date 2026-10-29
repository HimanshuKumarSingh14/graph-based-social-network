import { NavLink, useNavigate } from "react-router-dom";
import {
  LuLayoutDashboard,
  LuUsers,
  LuUserRound,
  LuNetwork,
  LuUsersRound,
  LuMessageSquare,
  LuSettings,
  LuLogOut,
  LuShare2,
} from "react-icons/lu";
import { useAuth } from "../context/useAuth";
import "./Sidebar.css";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LuLayoutDashboard },
  { to: "/users", label: "Users", icon: LuUsers },
  { to: "/friends", label: "Friends", icon: LuUserRound },
  { to: "/network-analysis", label: "Network Analysis", icon: LuNetwork },
  { to: "/communities", label: "Communities", icon: LuUsersRound },
  { to: "/graph", label: "Graph View", icon: LuShare2 },
  { to: "/messages", label: "Messages", icon: LuMessageSquare },
  { to: "/profile", label: "Profile", icon: LuUserRound },
  { to: "/settings", label: "Settings", icon: LuSettings },
];

function Sidebar({ open, onNavigate }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <LuShare2 size={20} />
        </div>
        <span>GraphNet</span>
      </div>

      <nav className="sidebar-menu">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <button className="sidebar-logout" onClick={handleLogout}>
        <LuLogOut size={18} />
        <span>Logout</span>
      </button>
    </aside>
  );
}

export default Sidebar;
