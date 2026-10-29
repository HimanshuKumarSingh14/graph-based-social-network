const driver = require("../config/neo4j");

// Send a message (persisted in Neo4j) between two friends
exports.sendMessage = async (req, res) => {
  const { to, text } = req.body;
  if (!to || !text || !text.trim()) {
    return res.status(400).json({ message: "Recipient and message text are required" });
  }

  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (a:User {email:$from}), (b:User {email:$to})
      CREATE (a)-[:SENT]->(m:Message {
        text: $text, sentAt: datetime(), fromEmail: $from, toEmail: $to
      })-[:TO]->(b)
      RETURN m
      `,
      { from: req.user.email, to, text: text.trim() }
    );

    const msg = result.records[0].get("m").properties;
    res.status(201).json({
      text: msg.text,
      fromEmail: msg.fromEmail,
      toEmail: msg.toEmail,
      sentAt: msg.sentAt.toString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Full conversation between the logged-in user and a friend
exports.getConversation = async (req, res) => {
  const { friendEmail } = req.params;
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (a:User)-[:SENT]->(m:Message)-[:TO]->(b:User)
      WHERE (a.email = $me AND b.email = $friend) OR (a.email = $friend AND b.email = $me)
      RETURN m.text AS text, m.fromEmail AS fromEmail, m.toEmail AS toEmail, m.sentAt AS sentAt
      ORDER BY m.sentAt ASC
      `,
      { me: req.user.email, friend: friendEmail }
    );

    const messages = result.records.map((r) => ({
      text: r.get("text"),
      fromEmail: r.get("fromEmail"),
      toEmail: r.get("toEmail"),
      sentAt: r.get("sentAt").toString(),
    }));

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// List of friends I've exchanged messages with + last message preview
exports.getConversations = async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (a:User)-[:SENT]->(m:Message)-[:TO]->(b:User)
      WHERE a.email = $me OR b.email = $me
      WITH CASE WHEN a.email = $me THEN b ELSE a END AS other, m
      ORDER BY m.sentAt DESC
      WITH other, collect(m)[0] AS lastMessage
      RETURN other.name AS name, other.email AS email, other.avatarColor AS avatarColor,
             lastMessage.text AS lastText, lastMessage.sentAt AS lastSentAt
      ORDER BY lastSentAt DESC
      `,
      { me: req.user.email }
    );

    const conversations = result.records.map((r) => ({
      name: r.get("name"),
      email: r.get("email"),
      avatarColor: r.get("avatarColor") || "#6366f1",
      lastText: r.get("lastText"),
      lastSentAt: r.get("lastSentAt").toString(),
    }));

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};
