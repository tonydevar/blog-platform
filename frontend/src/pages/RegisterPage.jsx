import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import styles from './AuthPage.module.css';

export default function RegisterPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (user) return <Navigate to="/" replace />;

  function validate() {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters.';
    if (!form.email.includes('@')) e.email = 'Enter a valid email address.';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters.';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length) { setErrors(fieldErrors); return; }
    setErrors({});
    setApiError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.sub}>Join the blogging community</p>

        {apiError && <div className={styles.error}>{apiError}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Name</label>
            <input
              type="text"
              className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
            {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
              autoComplete="email"
            />
            {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
              autoComplete="new-password"
            />
            {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
          </div>
          <button type="submit" className={`btn btn-primary ${styles.submit}`} disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" className={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
