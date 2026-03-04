import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import PostEditor from '../components/PostEditor.jsx';
import styles from './EditorPage.module.css';

export default function EditPostPage() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notAllowed, setNotAllowed] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/posts/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        const p = data.post;
        if (!p) { setNotAllowed(true); return; }
        // Only the author can edit
        if (!user || user.id !== p.authorId) {
          setNotAllowed(true);
          return;
        }
        setPost(p);
      })
      .catch(() => setNotAllowed(true))
      .finally(() => setLoading(false));
  }, [id, token, user]);

  // Redirect if not allowed after loading
  useEffect(() => {
    if (!loading && notAllowed) {
      navigate('/', { replace: true });
    }
  }, [loading, notAllowed, navigate]);

  async function handleSubmit(values) {
    const res = await fetch(`/api/posts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update post');
    navigate(`/post/${id}`);
  }

  if (loading) {
    return <div className={styles.loading}>Loading…</div>;
  }

  if (!post) return null;

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.header}>
        <Link to={`/post/${id}`} className={styles.back}>← Back to post</Link>
        <h1 className={styles.title}>Edit Post</h1>
      </div>
      <PostEditor
        initialValues={post}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
      />
    </div>
  );
}
