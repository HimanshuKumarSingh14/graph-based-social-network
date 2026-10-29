const neo4j = require("neo4j-driver");
require("dotenv").config();

const URI = process.env.NEO4J_URI || "neo4j://127.0.0.1:7687";
const USER = process.env.NEO4J_USER || "neo4j";
const PASSWORD = process.env.NEO4J_PASSWORD || "neo4j";

const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD), {
  maxConnectionPoolSize: 50,
});

driver
  .verifyConnectivity()
  .then(() => console.log(`✅ Connected to Neo4j at ${URI}`))
  .catch((err) => {
    console.error("❌ Neo4j connection failed:", err.message);
    console.error(
      "Make sure Neo4j is running and NEO4J_URI / NEO4J_USER / NEO4J_PASSWORD in .env are correct."
    );
  });

module.exports = driver;
