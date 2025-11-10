const db = require("./db");

async function setup() {
  try {
    console.log("Starting database setup...");

    // 1. Users Table
    await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                is_admin BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    console.log("Users table ready.");

    // 2. Drops Table
    await db.query(`
            CREATE TABLE IF NOT EXISTS drops (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                stock_count INTEGER NOT NULL DEFAULT 0,
                status VARCHAR(50) DEFAULT 'upcoming',
                starts_at TIMESTAMP,
                ends_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    console.log("Drops table ready.");

    // 3. Waitlist Table
    await db.query(`
    CREATE TABLE IF NOT EXISTS waitlist (
        user_id INTEGER REFERENCES users(id),
        drop_id INTEGER REFERENCES drops(id) ON DELETE CASCADE,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        score INTEGER DEFAULT 0,
        PRIMARY KEY (user_id, drop_id)
    );
`);
    console.log("Waitlist table ready.");

    console.log("Database setup complete!");
    process.exit(0);
  } catch (err) {
    console.error("Error setting up database:", err);
    process.exit(1);
  }
}

setup();
