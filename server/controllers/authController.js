const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const driver = require("../config/neo4j");

const signToken = (user) =>
  jwt.sign({ email: user.email, name: user.name }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

// Register
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }

  const session = driver.session();
  try {
    const existingUser = await session.run(
      "MATCH (u:User {email:$email}) RETURN u",
      { email }
    );

    if (existingUser.records.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await session.run(
      `
      CREATE (u:User {
        name: $name,
        email: $email,
        password: $password,
        bio: "",
        avatarColor: $avatarColor,
        createdAt: datetime()
      })
      RETURN u
      `,
      {
        name,
        email,
        password: hashedPassword,
        avatarColor: randomColor(),
      }
    );

    const user = result.records[0].get("u").properties;
    const token = signToken(user);

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: { name: user.name, email: user.email, bio: user.bio, avatarColor: user.avatarColor },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const session = driver.session();
  try {
    const result = await session.run("MATCH (u:User {email:$email}) RETURN u", { email });

    if (result.records.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.records[0].get("u").properties;
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const token = signToken(user);

    return res.json({
      token,
      user: {
        name: user.name,
        email: user.email,
        bio: user.bio || "",
        avatarColor: user.avatarColor || "#6366f1",
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
};

function randomColor() {
  const colors = ["#6366f1", "#22c55e", "#f97316", "#ec4899", "#0ea5e9", "#a855f7", "#14b8a6"];
  return colors[Math.floor(Math.random() * colors.length)];
}
