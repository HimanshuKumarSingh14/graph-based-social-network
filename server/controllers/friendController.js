const driver = require("../config/neo4j");

// Send Friend Request
const sendRequest = async (req, res) => {
  const session = driver.session();
  const { friendEmail } = req.body;

  try {
    if (friendEmail === req.user.email) {
      return res.status(400).json({ message: "You cannot friend yourself" });
    }

    await session.run(
      `
      MATCH (u:User {email:$user})
      MATCH (f:User {email:$friend})
      WHERE NOT (u)-[:FRIEND]-(f)
      MERGE (u)-[:REQUESTED]->(f)
      `,
      { user: req.user.email, friend: friendEmail }
    );
    res.json({ message: "Friend request sent" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Requests sent TO me, still pending
const getPendingRequests = async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (u:User)-[:REQUESTED]->(me:User {email:$email})
      RETURN u.name AS name, u.email AS email, u.avatarColor AS avatarColor
      `,
      { email: req.user.email }
    );

    const requests = result.records.map((r) => ({
      name: r.get("name"),
      email: r.get("email"),
      avatarColor: r.get("avatarColor") || "#6366f1",
    }));
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Requests I sent, still pending
const getSentRequests = async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (me:User {email:$email})-[:REQUESTED]->(u:User)
      RETURN u.name AS name, u.email AS email, u.avatarColor AS avatarColor
      `,
      { email: req.user.email }
    );

    const requests = result.records.map((r) => ({
      name: r.get("name"),
      email: r.get("email"),
      avatarColor: r.get("avatarColor") || "#6366f1",
    }));
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Accept Request
const acceptRequest = async (req, res) => {
  const session = driver.session();
  const { friendEmail } = req.body;

  try {
    await session.run(
      `
      MATCH (u:User {email:$friend})-[r:REQUESTED]->(me:User {email:$user})
      DELETE r
      MERGE (u)-[:FRIEND]->(me)
      MERGE (me)-[:FRIEND]->(u)
      `,
      { friend: friendEmail, user: req.user.email }
    );
    res.json({ message: "Friend request accepted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Reject Request
const rejectRequest = async (req, res) => {
  const session = driver.session();
  const { friendEmail } = req.body;

  try {
    await session.run(
      `
      MATCH (u:User {email:$friend})-[r:REQUESTED]->(me:User {email:$user})
      DELETE r
      `,
      { friend: friendEmail, user: req.user.email }
    );
    res.json({ message: "Friend request rejected" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

module.exports = {
  sendRequest,
  getPendingRequests,
  getSentRequests,
  acceptRequest,
  rejectRequest,
};
