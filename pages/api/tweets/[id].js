import { Pool } from 'pg';
import { verifyToken } from '../auth';

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

  const tweetId = req.query.id;

  if (req.method === 'PUT') {
    // Edit tweet
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    try {
      // Update the tweet (only if user owns it)
      const result = await pool.query(
        'UPDATE tweets SET content = $1 WHERE id = $2 AND user_id = $3 RETURNING id, content, user_id',
        [content, tweetId, req.user.userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(400).json({ error: 'Tweet not found or not authorized' });
      }

      res.status(200).json({
        success: true,
        message: 'Tweet updated successfully'
      });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ 
        error: 'Failed to update tweet'
      });
    }
  } else if (req.method === 'DELETE') {
    // Delete tweet
    try {
      // Delete the tweet (only if user owns it)
      const result = await pool.query(
        'DELETE FROM tweets WHERE id = $1 AND user_id = $2',
        [tweetId, req.user.userId]
      );
      
      if (result.rowCount === 0) {
        return res.status(400).json({ error: 'Tweet not found or not authorized' });
      }

      res.status(200).json({
        success: true,
        message: 'Tweet deleted successfully'
      });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ 
        error: 'Failed to delete tweet'
      });
    }
  }
}