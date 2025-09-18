import { Pool } from 'pg';
import bcrypt from 'bcrypt';

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
});

export default async function handler(req, res) {

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Check if username already exists
    const checkQuery = 'SELECT id FROM users WHERE username = $1';
    const checkResult = await pool.query(checkQuery, [username]);
      
      if (checkResult.rows.length > 0) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const insertQuery = 'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username';
    const insertResult = await pool.query(insertQuery, [username, passwordHash]);
      
      const newUser = insertResult.rows[0];

      res.status(200).json({
        success: true,
        message: 'User created successfully',
        user: {
          id: newUser.id,
          username: newUser.username
        }
      });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      error: 'Failed to create user'
    });
  }
}