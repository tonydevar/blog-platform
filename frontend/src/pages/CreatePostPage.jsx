import React from 'react';
import { Link } from 'react-router-dom';
import styles from './PostPage.module.css';

export default function CreatePostPage() {
  return (
    <div className={`container ${styles.page}`}>
      <Link to="/" className={styles.back}>← Back to posts</Link>
      <div className={styles.article}>
        <h1>Create New Post</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '12px' }}>
          Post editor coming soon in a future feature.
        </p>
      </div>
    </div>
  );
}
