import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setMessage('All fields are required');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Store the token in localStorage
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));

        setMessage('Login successful!');
        router.push('/');
      } else {
        setMessage('Error: ' + result.error);
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="main-container">
      <div className="card">
        <div className="card-body">
          <h1 className="mb-5">Login</h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                className="input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                disabled={loading}
              />
            </div>
            <div className="mb-3">
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                disabled={loading}
              />
            </div>
            <button
              className="btn btn-primary mb-5"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          {message && (
            <p className="mb-3">
              {message}
            </p>
          )}
          <p>
            Don't have an account? <Link href="/signup">Create one here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}