import { useEffect, useState } from "react";
import GraphView from "../components/GraphView";
import FilterPanel from "../components/FilterPanel";
import Loader from "../components/Loader";
import { useAuth } from "../context/useAuth";
import { getGraphData } from "../services/graph";
import "./Graph.css";

function Graph() {
  const { user } = useAuth();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState("force");
  const [filters, setFilters] = useState({
    showFriends: true,
    showMutual: true,
    showCommunities: true,
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await getGraphData();
        setGraphData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleFilter = (key) => setFilters((f) => ({ ...f, [key]: !f[key] }));
  const resetFilters = () => {
    setFilters({ showFriends: true, showMutual: true, showCommunities: true });
    setLayout("force");
  };

  if (loading) return <Loader label="Rendering the network..." />;

  return (
    <div className="graph-page">
      <div className="card graph-page-card">
        <div className="section-header">
          <h2>Social Network Graph</h2>
          <span className="section-hint">{graphData.nodes.length} users · {graphData.links.length} connections</span>
        </div>
        <GraphView graphData={graphData} height={560} highlightEmail={user?.email} />
      </div>

      <FilterPanel
        filters={filters}
        onToggle={toggleFilter}
        onReset={resetFilters}
        layout={layout}
        onLayoutChange={setLayout}
      />
    </div>
  );
}

export default Graph;
