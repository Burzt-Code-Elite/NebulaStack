import { Pool } from 'pg';
import { verifyToken } from './auth';

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
});

export default async function handler(req, res) {
  // Verify authentication for all requests
  try {
    const user = verifyToken(req);
    req.user = user;
  } catch (error) {
    return res.status(400).json({ error: 'Authentication required' });
  }

  if (req.method === 'GET') {
    // Get all tweets from all users
    try {
      const query = `
        SELECT t.id, t.content, u.username, t.user_id
        FROM tweets t
        JOIN users u ON t.user_id = u.id
        ORDER BY t.id DESC
      `;
      
      const result = await pool.query(query);
        
      res.status(200).json({
        success: true,
        tweets: result.rows
      });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch tweets'
      });
    }
  } else if (req.method === 'POST') {
    // Create new tweet
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    try {
      const query = `
        INSERT INTO tweets (content, user_id) 
        VALUES ($1, $2)
        RETURNING id, content, user_id
      `;
      const values = [content, req.user.userId];
      
      const result = await pool.query(query, values);
      const insertedTweet = result.rows[0];
      
      res.status(200).json({
        success: true,
        tweet: {
          ...insertedTweet,
          username: req.user.username,
          user_id: req.user.userId
        }
      });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ 
        error: 'Failed to save tweet'
      });
    }
  }
}