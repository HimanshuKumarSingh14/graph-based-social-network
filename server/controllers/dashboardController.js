const driver = require("../config/neo4j");
const { fetchFullGraph } = require("../services/graphService");
const { buildAdjacency, detectCommunities, networkDensity } = require("../utils/graphAlgorithms");

exports.getDashboard = async (req, res) => {
  try {
    const { nodes, edges } = await fetchFullGraph();
    const adjacency = buildAdjacency(nodes, edges);
    const { communities } = detectCommunities(adjacency);

    res.json({
      totalUsers: nodes.length,
      totalFriends: edges.length,
      communities: communities.filter((m) => m.length > 0).length,
      networkDensity: Number(networkDensity(nodes.length, edges.length).toFixed(2)),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.getRecentActivity = async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (u:User)
      RETURN u.name AS name, u.email AS email, u.createdAt AS createdAt
      ORDER BY u.createdAt DESC
      LIMIT 5
      `
    );

    const recent = result.records.map((r) => ({
      name: r.get("name"),
      email: r.get("email"),
    }));

    res.json(recent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};
