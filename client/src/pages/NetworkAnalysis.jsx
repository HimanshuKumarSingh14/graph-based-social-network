import { useEffect, useState } from "react";
import { LuUsers, LuRoute } from "react-icons/lu";
import AnalyticsCard from "../components/AnalyticsCard";
import Loader from "../components/Loader";
import { useAuth } from "../context/useAuth";
import { getMyCentrality, getConnectionBreakdown } from "../services/analytics";
import { getAllUsers } from "../services/users";
import { getMutualFriends, getShortestPath } from "../services/graph";
import "./NetworkAnalysis.css";

function NetworkAnalysis() {
  const { user } = useAuth();
  const [centrality, setCentrality] = useState(null);
  const [connections, setConnections] = useState(null);
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [compareEmail, setCompareEmail] = useState("");
  const [mutual, setMutual] = useState(null);
  const [path, setPath] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [c, conn, u] = await Promise.all([
          getMyCentrality(),
          getConnectionBreakdown(),
          getAllUsers(),
        ]);
        setCentrality(c.data);
        setConnections(conn.data);
        setUsers(u.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const runComparison = async (email) => {
    setCompareEmail(email);
    if (!email) { setMutual(null); setPath(null); return; }
    setCompareLoading(true);
    try {
      const [m, p] = await Promise.all([
        getMutualFriends(user.email, email),
        getShortestPath(user.email, email),
      ]);
      setMutual(m.data);
      setPath(p.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCompareLoading(false);
    }
  };

  if (loading) return <Loader label="Crunching the network..." />;

  return (
    <div className="network-analysis">
      <div className="analytics-grid">
        <AnalyticsCard title="Degree Centrality" value={centrality.degreeCentrality} tone="blue" />
        <AnalyticsCard title="Betweenness Centrality" value={centrality.betweennessCentrality} tone="green" />
        <AnalyticsCard title="Closeness Centrality" value={centrality.closenessCentrality} tone="orange" />
        <AnalyticsCard title="Eigenvector Centrality" value={centrality.eigenvectorCentrality} tone="pink" />
      </div>

      <div className="na-row">
        <div className="card na-panel">
          <div className="section-header"><h2><LuUsers size={17} /> Mutual Friends</h2></div>
          <select className="input" value={compareEmail} onChange={(e) => runComparison(e.target.value)}>
            <option value="">Compare with someone...</option>
            {users.map((u) => (
              <option key={u.email} value={u.email}>{u.name}</option>
            ))}
          </select>

          {compareLoading ? (
            <Loader label="Comparing..." />
          ) : mutual ? (
            <div className="na-mutual-result">
              <p className="na-mutual-count">{mutual.count}</p>
              <span>Total mutual friends</span>
              {mutual.mutualFriends.length > 0 && (
                <ul className="na-mutual-list">
                  {mutual.mutualFriends.map((m) => <li key={m.email}>{m.name}</li>)}
                </ul>
              )}
            </div>
          ) : (
            <p className="na-hint">Pick someone to see how many friends you share.</p>
          )}
        </div>

        <div className="card na-panel">
          <div className="section-header"><h2><LuRoute size={17} /> Shortest Path</h2></div>
          {compareEmail === "" ? (
            <p className="na-hint">Pick someone above to trace the shortest path between you.</p>
          ) : path?.found ? (
            <>
              <p className="na-mutual-count">{path.length}</p>
              <span>Path length (hops)</span>
              <div className="na-path">
                {path.path.map((p, i) => (
                  <span key={p.email} className="na-path-node">
                    {p.name}
                    {i < path.path.length - 1 && <span className="na-path-arrow">→</span>}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="na-hint">No path found between you and this person.</p>
          )}
        </div>
      </div>

      <div className="card na-panel">
        <div className="section-header"><h2>Your Connections</h2></div>
        <div className="na-connections">
          <div>
            <p className="na-mutual-count">{connections.totalFriends}</p>
            <span>Direct friends</span>
          </div>
          <div>
            <p className="na-mutual-count">{connections.secondDegree}</p>
            <span>2nd degree connections</span>
          </div>
          <div>
            <p className="na-mutual-count">{connections.thirdDegree}</p>
            <span>3rd degree connections</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NetworkAnalysis;
