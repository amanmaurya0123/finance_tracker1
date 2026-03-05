require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const DEMO_USERS = [
  { name: 'Admin User', email: 'admin@example.com', password: 'admin123', role: 'admin' },
  { name: 'Regular User', email: 'user@example.com', password: 'user123', role: 'user' },
  { name: 'Read Only User', email: 'readonly@example.com', password: 'readonly123', role: 'read-only' },
];

async function seed() {
  try {
    for (const u of DEMO_USERS) {
      const hash = await bcrypt.hash(u.password, 10);
      await pool.query(
        `INSERT INTO users (name, email, password, role)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO UPDATE SET name = $1, password = $3, role = $4`,
        [u.name, u.email, hash, u.role]
      );
      console.log(`Seeded user: ${u.email}`);
    }
    console.log('Seed completed.');
  } catch (err) {
    console.error('Seed failed:', err);
  } finally {
    await pool.end();
  }
}

seed();
