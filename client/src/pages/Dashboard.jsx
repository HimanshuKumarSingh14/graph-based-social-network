import { useEffect, useState } from "react";
import { LuUsers, LuUserRound, LuUsersRound, LuActivity } from "react-icons/lu";
import StatsCard from "../components/StatsCard";
import GraphView from "../components/GraphView";
import FilterPanel from "../components/FilterPanel";
import Loader from "../components/Loader";
import { getDashboardStats, getRecentActivity } from "../services/dashboard";
import { getGraphData } from "../services/graph";
import "./Dashboard.css";

function initials(name = "") {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState("force");
  const [filters, setFilters] = useState({
    showFriends: true,
    showMutual: true,
    showCommunities: true,
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [statsRes, graphRes, recentRes] = await Promise.all([
          getDashboardStats(),
          getGraphData(),
          getRecentActivity(),
        ]);
        if (!mounted) return;
        setStats(statsRes.data);
        setGraphData(graphRes.data);
        setRecent(recentRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const toggleFilter = (key) => setFilters((f) => ({ ...f, [key]: !f[key] }));
  const resetFilters = () => {
    setFilters({ showFriends: true, showMutual: true, showCommunities: true });
    setLayout("force");
  };

  const visibleGraph = filters.showFriends ? graphData : { nodes: graphData.nodes, links: [] };

  if (loading) return <Loader label="Loading dashboard..." />;

  return (
    <div className="dashboard">
      <div className="stats-container">
        <StatsCard title="Total Users" value={stats.totalUsers} growth="Live count" icon={LuUsers} tone="blue" />
        <StatsCard title="Connections" value={stats.totalFriends} growth="Live count" icon={LuUserRound} tone="green" />
        <StatsCard title="Communities" value={stats.communities} growth="Detected now" icon={LuUsersRound} tone="orange" />
        <StatsCard title="Network Density" value={stats.networkDensity} growth="0 - 1 scale" icon={LuActivity} tone="pink" />
      </div>

      <div className="graph-layout">
        <div className="graph-card card">
          <div className="section-header">
            <h2>Social Network Graph</h2>
            <span className="section-hint">{graphData.nodes.length} people · {graphData.links.length} connections</span>
          </div>
          <GraphView graphData={visibleGraph} height={440} />
        </div>

        <FilterPanel
          filters={filters}
          onToggle={toggleFilter}
          onReset={resetFilters}
          layout={layout}
          onLayoutChange={setLayout}
        />
      </div>

      <div className="card recent-card">
        <div className="section-header">
          <h2>Newest Members</h2>
        </div>
        <ul className="recent-list">
          {recent.map((u) => (
            <li key={u.email}>
              <span className="avatar" style={{ width: 34, height: 34, background: "var(--accent)" }}>
                {initials(u.name)}
              </span>
              <div>
                <p className="recent-name">{u.name}</p>
                <p className="recent-email">{u.email}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
