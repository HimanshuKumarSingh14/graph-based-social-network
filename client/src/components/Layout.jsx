import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./Layout.css";

function Layout({ title, subtitle }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="app-main">
        <Topbar title={title} subtitle={subtitle} onMenuClick={() => setSidebarOpen((o) => !o)} />
        <div className="app-content fade-in">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Layout;
