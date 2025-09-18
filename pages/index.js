import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const [user, setUser] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [tweet, setTweet] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTweet, setEditTweet] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!storedToken || !userData) {
      router.push('/login');
      return;
    }

    setToken(storedToken);
    setUser(JSON.parse(userData));
    loadTweets(storedToken);
  }, []);

  const loadTweets = async (authToken = token) => {
    try {
      const response = await fetch('/api/tweets', {
        headers: {
          'Authorization': authToken,
        },
      });

      const result = await response.json();

      if (response.ok) {
        setTweets(result.tweets);
      } else {
        setMessage('Error loading tweets: ' + result.error);
        if (response.status === 400 && result.error === 'Authentication required') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
        }
      }
    } catch (error) {
      setMessage('Error loading tweets: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tweet) return;

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/tweets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({ content: tweet }),
      });

      const result = await response.json();

      if (response.ok) {
        setTweet('');
        setMessage('Tweet posted successfully!');
        loadTweets();
      } else {
        setMessage('Error: ' + result.error);
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id) => {
    if (!editTweet) return;

    try {
      const response = await fetch(`/api/tweets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({ content: editTweet }),
      });

      const result = await response.json();

      if (response.ok) {
        setEditingId(null);
        setEditTweet('');
        setMessage('Tweet updated successfully!');
        loadTweets();
      } else {
        setMessage('Error: ' + result.error);
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this tweet?')) return;

    try {
      const response = await fetch(`/api/tweets/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token,
        },
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Tweet deleted successfully!');
        loadTweets();
      } else {
        setMessage('Error: ' + result.error);
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    }
  };

  const startEdit = (tweet) => {
    setEditingId(tweet.id);
    setEditTweet(tweet.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTweet('');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div id="main-container">
      <div className="card mb-4">
        <div className="card-body">
          <h1 className="mb-1 fw-bold">Tweet Feed</h1>
          <p id="username">Welcome, {user.username}!</p>
          <button className="btn btn-sm mb-4" onClick={handleLogout}>
            Logout
          </button>
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="mb-2">
              <input
                className="input"
                value={tweet}
                onChange={(e) => setTweet(e.target.value)}
                placeholder="What's happening?"
                disabled={loading}
              />
            </div>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </form>

          {message && (
            <p className="mb-3">
              {message}
            </p>
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-4 ms-3 fw-bold">All Tweets</h3>
        {tweets.length === 0 ? (
          <p className='ms-3'>No tweets yet. Be the first to post!</p>
        ) : (
          tweets.map((tweet) => (
            <div key={tweet.id} className="card mb-3">
              <div className="card-body">
                <div className="mb-2">
                  <p className='fw-bold'>{tweet.username}</p>
                </div>

                {editingId === tweet.id ? (
                  <div>
                    <input
                      className="input"
                      value={editTweet}
                      onChange={(e) => setEditTweet(e.target.value)}
                      rows="2"
                    />
                    <button
                      className="btn btn-sm"
                      onClick={() => handleEdit(tweet.id)}
                    >
                      Save
                    </button>
                    <button
                      className="btn btn-sm"
                      onClick={cancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="mb-3">{tweet.content}</p>
                    {tweet.user_id === user.id && (
                      <div>
                        <button
                          className="btn btn-sm"
                          onClick={() => startEdit(tweet)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm"
                          onClick={() => handleDelete(tweet.id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}