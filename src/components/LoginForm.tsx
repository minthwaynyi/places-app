import { useState } from 'react';
import type { User } from '../types';

type LoginFormProps = {
  onLogin: (user: User) => void;
};

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError('');

    const response = await fetch(import.meta.env.VITE_SERVER_URL + '/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password }),
    });

    if (!response.ok) {
      setError(response.status === 401 ? 'Invalid credentials' : 'Login failed');
      return;
    }

    const user: User = await response.json();
    onLogin(user);
    setName('');
    setPassword('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Log In</h3>
      <div>
        <label>
          Username:{' '}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Password:{' '}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
      </div>
      <button type="submit">Log In</button>
      {error && <p>{error}</p>}
    </form>
  );
};