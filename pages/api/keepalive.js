import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
});

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'alive', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Keepalive error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
}