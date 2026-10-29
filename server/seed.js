/**
 * Seed script — populates Neo4j with demo users & friendships so the
 * dashboard, network analysis, and community detection pages have
 * real, dynamic data to show immediately after setup.
 *
 * Usage:  npm run seed
 */
require("dotenv").config();
const bcrypt = require("bcryptjs");
const driver = require("./config/neo4j");

const colors = ["#6366f1", "#22c55e", "#f97316", "#ec4899", "#0ea5e9", "#a855f7", "#14b8a6"];
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Four friend groups (communities), matching the mockups
const communities = [
  ["Sonali Kumari", "Rahul Kumar", "Priya Singh", "Aman Verma", "Neha Gupta"],
  ["Karan Patel", "Rohit Sharma", "Anjali Mehta", "Vivek Gupta"],
  ["Sneha Reddy", "Pooja Sharma", "Arjun Nair", "Kavya Iyer", "Manish Rai"],
  ["Ishaan Malhotra", "Divya Nair", "Aditya Rao", "Meera Joshi"],
];

const extraFirst = ["Aarav", "Vihaan", "Sai", "Reyansh", "Ayaan", "Krishna", "Ananya", "Diya", "Ira", "Myra", "Kabir", "Yash", "Aryan", "Riya", "Tanvi", "Sara", "Zara", "Nikhil", "Devansh", "Simran"];
const extraLast = ["Sharma", "Verma", "Iyer", "Reddy", "Nair", "Kapoor", "Malhotra", "Chopra", "Bansal", "Saxena", "Trivedi", "Mishra", "Rathi", "Bhatt", "Menon"];

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z]+/g, ".");
}

async function seed() {
  const session = driver.session();
  try {
    console.log("Clearing existing demo data...");
    await session.run("MATCH (n:User) DETACH DELETE n");

    const allUsers = [];
    communities.forEach((group) => group.forEach((name) => allUsers.push(name)));

    // pad up to ~120 total users with random extra names, distributed into
    // the existing communities plus a handful of brand-new small clusters
    while (allUsers.length < 120) {
      const name = `${pick(extraFirst)} ${pick(extraLast)}`;
      allUsers.push(name);
    }

    const hashedPassword = await bcrypt.hash("password123", 10);
    const emailCounts = new Map();

    const userRecords = allUsers.map((name) => {
      let base = slugify(name);
      const count = emailCounts.get(base) || 0;
      emailCounts.set(base, count + 1);
      const email = count === 0 ? `${base}@example.com` : `${base}${count}@example.com`;
      return { name, email, avatarColor: pick(colors) };
    });

    console.log(`Creating ${userRecords.length} users...`);
    for (const u of userRecords) {
      await session.run(
        `
        CREATE (u:User {
          name: $name, email: $email, password: $password,
          bio: "Exploring the network 🌐", avatarColor: $avatarColor,
          createdAt: datetime()
        })
        `,
        { ...u, password: hashedPassword }
      );
    }

    // Build friendships: dense within each defined community, sparse across
    const groups = [];
    let cursor = 0;
    communities.forEach((group) => {
      groups.push(userRecords.slice(cursor, cursor + group.length));
      cursor += group.length;
    });
    // remaining random users -> chunk into groups of 4-6 as extra communities
    const remaining = userRecords.slice(cursor);
    let i = 0;
    while (i < remaining.length) {
      const size = 4 + Math.floor(Math.random() * 3);
      groups.push(remaining.slice(i, i + size));
      i += size;
    }

    console.log(`Wiring up ${groups.length} communities with friendships...`);
    let edgeCount = 0;
    for (const group of groups) {
      for (let a = 0; a < group.length; a++) {
        for (let b = a + 1; b < group.length; b++) {
          // dense but not fully complete graph within a community
          if (Math.random() < 0.75) {
            await session.run(
              `
              MATCH (x:User {email:$a}), (y:User {email:$b})
              MERGE (x)-[:FRIEND]->(y)
              MERGE (y)-[:FRIEND]->(x)
              `,
              { a: group[a].email, b: group[b].email }
            );
            edgeCount++;
          }
        }
      }
    }

    // sparse bridging edges between communities so the graph is connected
    for (let g = 0; g < groups.length - 1; g++) {
      const from = pick(groups[g]);
      const to = pick(groups[g + 1]);
      await session.run(
        `
        MATCH (x:User {email:$a}), (y:User {email:$b})
        MERGE (x)-[:FRIEND]->(y)
        MERGE (y)-[:FRIEND]->(x)
        `,
        { a: from.email, b: to.email }
      );
      edgeCount++;
    }

    // create a demo login account you can use immediately
    const demoEmail = "sonali.kumari@example.com";
    console.log(`\nDemo login -> email: ${demoEmail}  password: password123\n`);

    console.log(`Done. Created ${userRecords.length} users and ~${edgeCount} friendships.`);
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await session.close();
    await driver.close();
  }
}

seed();
