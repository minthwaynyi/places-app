import { useState } from 'react';
import type { User } from '../types';

type SignupFormProps = {
  onSignup: (user: User) => void;
};

export const SignupForm = ({ onSignup }: SignupFormProps) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setMessage('');

    const response = await fetch(import.meta.env.VITE_SERVER_URL + '/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password }),
    });

    if (!response.ok) {
      setMessage(response.status === 409 ? 'User already exists' : 'Signup failed');
      return;
    }

    const user: User = await response.json();
    setName('');
    setPassword('');

    if (user.Token) {
      onSignup(user);
    } else {
      setMessage('Account created! Please log in.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Sign Up</h3>
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
      <button type="submit">Sign Up</button>
      {message && <p>{message}</p>}
    </form>
  );
};