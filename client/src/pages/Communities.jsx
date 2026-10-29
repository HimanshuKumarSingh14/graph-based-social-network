import { useEffect, useState } from "react";
import { LuUsersRound } from "react-icons/lu";
import CommunityCard from "../components/CommunityCard";
import GraphView from "../components/GraphView";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import { getCommunities } from "../services/analytics";
import { getGraphData } from "../services/graph";
import "./Communities.css";

function Communities() {
  const [data, setData] = useState(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [c, g] = await Promise.all([getCommunities(), getGraphData()]);
        setData(c.data);

        const colorByEmail = new Map();
        c.data.communities.forEach((community) => {
          community.members.forEach((m) => colorByEmail.set(m.email, community.color));
        });

        setGraphData({
          nodes: g.data.nodes.map((n) => ({ ...n, avatarColor: colorByEmail.get(n.id) || n.avatarColor })),
          links: g.data.links,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loader label="Detecting communities..." />;
  if (!data || data.communities.length === 0) {
    return <EmptyState icon={LuUsersRound} title="No communities detected yet" description="Add more friendships to see clusters form." />;
  }

  return (
    <div className="communities-page">
      <div className="card communities-graph-card">
        <div className="section-header">
          <h2>Community Detection</h2>
          <span className="section-hint">{data.totalCommunities} communities found</span>
        </div>
        <GraphView graphData={graphData} height={420} />
      </div>

      <div className="communities-grid">
        {data.communities.map((c) => (
          <CommunityCard key={c.id} community={c} />
        ))}
      </div>
    </div>
  );
}

export default Communities;
