const driver = require("../config/neo4j");
const { fetchFullGraph } = require("../services/graphService");
const { buildAdjacency, shortestPathBFS } = require("../utils/graphAlgorithms");

// Mutual Friends between two users
exports.getMutualFriends = async (req, res) => {
  const session = driver.session();
  const { email1, email2 } = req.params;

  try {
    const result = await session.run(
      `
      MATCH (u1:User {email:$email1})-[:FRIEND]->(m:User)<-[:FRIEND]-(u2:User {email:$email2})
      RETURN m.name AS name, m.email AS email, m.avatarColor AS avatarColor
      `,
      { email1, email2 }
    );

    const mutualFriends = result.records.map((r) => ({
      name: r.get("name"),
      email: r.get("email"),
      avatarColor: r.get("avatarColor") || "#6366f1",
    }));

    res.json({ count: mutualFriends.length, mutualFriends });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Friend Suggestions (friends-of-friends not already connected)
exports.getSuggestions = async (req, res) => {
  const session = driver.session();
  const { email } = req.params;

  try {
    const result = await session.run(
      `
      MATCH (u:User {email:$email})-[:FRIEND]->()-[:FRIEND]->(s:User)
      WHERE s.email <> $email AND NOT (u)-[:FRIEND]->(s)
      RETURN DISTINCT s.name AS name, s.email AS email, s.avatarColor AS avatarColor,
             count(*) AS mutualCount
      ORDER BY mutualCount DESC
      LIMIT 10
      `,
      { email }
    );

    const suggestions = result.records.map((r) => ({
      name: r.get("name"),
      email: r.get("email"),
      avatarColor: r.get("avatarColor") || "#6366f1",
      mutualCount: r.get("mutualCount").toNumber ? r.get("mutualCount").toNumber() : r.get("mutualCount"),
    }));

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Shortest Path between two users (computed in JS via BFS over the full graph)
exports.shortestPath = async (req, res) => {
  const { email1, email2 } = req.params;

  try {
    const { nodes, edges } = await fetchFullGraph();
    const adjacency = buildAdjacency(nodes, edges);
    const nameByEmail = new Map(nodes.map((n) => [n.email, n.name]));

    const path = shortestPathBFS(email1, email2, adjacency);

    if (!path) {
      return res.json({ found: false, path: [], length: 0 });
    }

    res.json({
      found: true,
      length: path.length - 1,
      path: path.map((email) => ({ email, name: nameByEmail.get(email) || email })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Network-wide statistics
exports.networkStats = async (req, res) => {
  try {
    const { nodes, edges } = await fetchFullGraph();
    const density = nodes.length > 1 ? (2 * edges.length) / (nodes.length * (nodes.length - 1)) : 0;

    res.json({
      totalUsers: nodes.length,
      totalConnections: edges.length,
      networkDensity: Number(density.toFixed(2)),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Most Connected User
exports.mostConnectedUser = async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (u:User)-[:FRIEND]->(f)
      RETURN u.name AS name, u.email AS email, count(f) AS connections
      ORDER BY connections DESC
      LIMIT 1
      `
    );

    if (result.records.length === 0) {
      return res.json({ name: null, email: null, connections: 0 });
    }

    const record = result.records[0];
    res.json({
      name: record.get("name"),
      email: record.get("email"),
      connections: record.get("connections").toNumber
        ? record.get("connections").toNumber()
        : record.get("connections"),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Full graph visualization data (nodes + links) for force-directed graph view
exports.getGraphData = async (req, res) => {
  try {
    const { nodes, edges } = await fetchFullGraph();
    res.json({
      nodes: nodes.map((n) => ({ id: n.email, name: n.name, avatarColor: n.avatarColor })),
      links: edges.map((e) => ({ source: e.source, target: e.target })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
