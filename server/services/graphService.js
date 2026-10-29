const driver = require("../config/neo4j");

/**
 * Fetch the full user graph (nodes + undirected FRIEND edges) once.
 * Reused by graph visualization, centrality, community detection & stats
 * so we don't need the Neo4j GDS/APOC plugins.
 */
async function fetchFullGraph() {
  const session = driver.session();
  try {
    const nodesResult = await session.run(
      "MATCH (u:User) RETURN u.email AS email, u.name AS name, u.avatarColor AS avatarColor"
    );

    const nodes = nodesResult.records.map((r) => ({
      id: r.get("email"),
      email: r.get("email"),
      name: r.get("name"),
      avatarColor: r.get("avatarColor") || "#6366f1",
    }));

    const edgesResult = await session.run(
      `
      MATCH (a:User)-[:FRIEND]->(b:User)
      WHERE a.email < b.email
      RETURN a.email AS source, b.email AS target
      `
    );

    const edges = edgesResult.records.map((r) => ({
      source: r.get("source"),
      target: r.get("target"),
    }));

    return { nodes, edges };
  } finally {
    await session.close();
  }
}

module.exports = { fetchFullGraph };
