const { fetchFullGraph } = require("../services/graphService");
const {
  buildAdjacency,
  degreeCentrality,
  betweennessCentrality,
  closenessCentrality,
  eigenvectorCentrality,
  detectCommunities,
  bfsFrom,
} = require("../utils/graphAlgorithms");

// Degree-1 / degree-2 / degree-3 connection counts for the logged-in user
exports.getConnectionBreakdown = async (req, res) => {
  try {
    const email = req.query.email || req.user.email;
    const { nodes, edges } = await fetchFullGraph();
    const adjacency = buildAdjacency(nodes, edges);

    const { dist } = bfsFrom(email, adjacency);
    let first = 0, second = 0, third = 0;
    dist.forEach((d) => {
      if (d === 1) first++;
      else if (d === 2) second++;
      else if (d === 3) third++;
    });

    res.json({
      totalFriends: first,
      secondDegree: second,
      thirdDegree: third,
      totalReachable: dist.size - 1,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Centrality measures for the logged-in user (or ?email=)
exports.getMyCentrality = async (req, res) => {
  try {
    const targetEmail = req.query.email || req.user.email;
    const { nodes, edges } = await fetchFullGraph();
    const adjacency = buildAdjacency(nodes, edges);

    const degree = degreeCentrality(adjacency);
    const betweenness = betweennessCentrality(adjacency);
    const closeness = closenessCentrality(adjacency);
    const eigenvector = eigenvectorCentrality(adjacency);

    const round = (v) => Math.round((v || 0) * 100) / 100;

    res.json({
      email: targetEmail,
      degreeCentrality: round(degree.get(targetEmail)),
      betweennessCentrality: round(betweenness.get(targetEmail)),
      closenessCentrality: round(closeness.get(targetEmail)),
      eigenvectorCentrality: round(eigenvector.get(targetEmail)),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Centrality leaderboard across the whole network
exports.getCentralityLeaderboard = async (req, res) => {
  try {
    const { nodes, edges } = await fetchFullGraph();
    const adjacency = buildAdjacency(nodes, edges);
    const nameByEmail = new Map(nodes.map((n) => [n.email, n.name]));

    const degree = degreeCentrality(adjacency);
    const betweenness = betweennessCentrality(adjacency);
    const closeness = closenessCentrality(adjacency);
    const eigenvector = eigenvectorCentrality(adjacency);

    const round = (v) => Math.round((v || 0) * 100) / 100;

    const leaderboard = nodes
      .map((n) => ({
        email: n.email,
        name: nameByEmail.get(n.email),
        degreeCentrality: round(degree.get(n.email)),
        betweennessCentrality: round(betweenness.get(n.email)),
        closenessCentrality: round(closeness.get(n.email)),
        eigenvectorCentrality: round(eigenvector.get(n.email)),
      }))
      .sort((a, b) => b.degreeCentrality - a.degreeCentrality)
      .slice(0, 20);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Community detection (label propagation) - grouped members + graph coloring
exports.getCommunities = async (req, res) => {
  try {
    const { nodes, edges } = await fetchFullGraph();
    const adjacency = buildAdjacency(nodes, edges);
    const nameByEmail = new Map(nodes.map((n) => [n.email, n.name]));
    const colorByEmail = new Map(nodes.map((n) => [n.email, n.avatarColor]));

    const { communities } = detectCommunities(adjacency);

    const palette = ["#3b82f6", "#22c55e", "#a855f7", "#ef4444", "#f97316", "#14b8a6", "#eab308", "#ec4899"];

    const formatted = communities
      .filter((members) => members.length > 0)
      .map((members, idx) => ({
        id: idx + 1,
        color: palette[idx % palette.length],
        size: members.length,
        members: members.map((email) => ({
          email,
          name: nameByEmail.get(email) || email,
          avatarColor: colorByEmail.get(email) || "#6366f1",
        })),
      }));

    res.json({
      totalCommunities: formatted.length,
      communities: formatted,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
