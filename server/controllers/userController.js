const driver = require("../config/neo4j");

// Get logged-in user's profile
exports.getProfile = async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run("MATCH (u:User {email:$email}) RETURN u", {
      email: req.user.email,
    });

    if (result.records.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...user } = result.records[0].get("u").properties;
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Update profile (name / bio)
exports.updateProfile = async (req, res) => {
  const { name, bio } = req.body;
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (u:User {email:$email})
      SET u.name = coalesce($name, u.name),
          u.bio = coalesce($bio, u.bio)
      RETURN u
      `,
      { email: req.user.email, name, bio }
    );

    const { password, ...user } = result.records[0].get("u").properties;
    res.json({ message: "Profile updated", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Get all users (for the Users directory page) with search + friend/pending status
exports.getAllUsers = async (req, res) => {
  const session = driver.session();
  const search = (req.query.search || "").trim();
  const me = req.user.email;

  try {
    const result = await session.run(
      `
      MATCH (u:User)
      WHERE u.email <> $me
        AND (toLower(u.name) CONTAINS toLower($search) OR toLower(u.email) CONTAINS toLower($search))
      RETURN u.name AS name, u.email AS email, u.bio AS bio, u.avatarColor AS avatarColor,
             exists((:User {email:$me})-[:FRIEND]->(u)) AS isFriend,
             exists((:User {email:$me})-[:REQUESTED]->(u)) AS requestSent,
             exists((u)-[:REQUESTED]->(:User {email:$me})) AS requestReceived
      ORDER BY u.name
      LIMIT 200
      `,
      { me, search }
    );

    const users = result.records.map((r) => ({
      name: r.get("name"),
      email: r.get("email"),
      bio: r.get("bio") || "",
      avatarColor: r.get("avatarColor") || "#6366f1",
      isFriend: r.get("isFriend"),
      requestSent: r.get("requestSent"),
      requestReceived: r.get("requestReceived"),
    }));

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Directly add a friend connection (mutual)
exports.addFriend = async (req, res) => {
  const session = driver.session();
  const { friendEmail } = req.body;

  try {
    await session.run(
      `
      MATCH (a:User {email:$user})
      MATCH (b:User {email:$friend})
      MERGE (a)-[:FRIEND]->(b)
      MERGE (b)-[:FRIEND]->(a)
      WITH a, b
      MATCH (a)-[r:REQUESTED]->(b)
      DELETE r
      `,
      { user: req.user.email, friend: friendEmail }
    );

    res.json({ message: "Friend added" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Remove a friend connection (both directions)
exports.deleteFriend = async (req, res) => {
  const session = driver.session();
  const { friendEmail } = req.body;

  try {
    await session.run(
      `
      MATCH (a:User {email:$user})-[r:FRIEND]-(b:User {email:$friend})
      DELETE r
      `,
      { user: req.user.email, friend: friendEmail }
    );

    res.json({ message: "Friend removed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Get logged-in user's friends list
exports.getFriends = async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (u:User {email:$email})-[:FRIEND]->(f:User)
      RETURN f.name AS name, f.email AS email, f.bio AS bio, f.avatarColor AS avatarColor
      ORDER BY f.name
      `,
      { email: req.user.email }
    );

    const friends = result.records.map((r) => ({
      name: r.get("name"),
      email: r.get("email"),
      bio: r.get("bio") || "",
      avatarColor: r.get("avatarColor") || "#6366f1",
    }));

    res.json(friends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};
