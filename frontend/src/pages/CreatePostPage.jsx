import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import PostEditor from '../components/PostEditor.jsx';
import styles from './EditorPage.module.css';

export default function CreatePostPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(values) {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create post');
    navigate(`/post/${data.post.id}`);
  }

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.header}>
        <Link to="/" className={styles.back}>← Back</Link>
        <h1 className={styles.title}>New Post</h1>
      </div>
      <PostEditor onSubmit={handleSubmit} submitLabel="Publish Post" />
    </div>
  );
}
