import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from './login.module.css';
import Cookies from 'js-cookie';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = mode === 'login' ? '/login' : '/create';
      const response = await fetch(`http://localhost:3000/user${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const data = await response.json();
      if (mode === 'login') {
        Cookies.set('accessToken', data.accessToken);
        Cookies.set('cvUrl', data.cvUrl || '');
        Cookies.set('userId', data.userId.toString());

        router.push('/tasks');
      } else {
        setMode('login');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.container}>
      <h1>{mode === 'login' ? 'Login' : 'Register'}</h1>
      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">{mode === 'login' ? 'Login' : 'Register'}</button>
        <p onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login'
            ? 'Need an account? Register'
            : 'Already have an account? Login'}
        </p>
      </form>
    </div>
  );
}
