import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import styles from './CommentList.module.css';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function CommentItem({ comment }) {
  return (
    <div className={styles.comment}>
      <img
        src={
          comment.author?.avatar ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author?.name}`
        }
        alt={comment.author?.name}
        className={styles.avatar}
      />
      <div className={styles.body}>
        <div className={styles.commentHeader}>
          <span className={styles.authorName}>{comment.author?.name}</span>
          <span className={styles.date}>{formatDate(comment.createdAt)}</span>
        </div>
        <p className={styles.text}>{comment.body}</p>
      </div>
    </div>
  );
}

export default function CommentList({ postId, comments: initialComments }) {
  const { user, token } = useAuth();
  const [comments, setComments] = useState(initialComments || []);
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ body: body.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post comment');
      setComments(prev => [...prev, data.comment]);
      setBody('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>
        Comments <span className={styles.count}>({comments.length})</span>
      </h2>

      {comments.length === 0 && (
        <p className={styles.empty}>No comments yet. Be the first!</p>
      )}

      <div className={styles.list}>
        {comments.map(c => (
          <CommentItem key={c.id} comment={c} />
        ))}
      </div>

      <div className={styles.formArea}>
        {user ? (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formHeader}>
              <img
                src={
                  user.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`
                }
                alt={user.name}
                className={styles.formAvatar}
              />
              <span className={styles.formUsername}>{user.name}</span>
            </div>
            {error && <div className={styles.error}>{error}</div>}
            <textarea
              className={styles.textarea}
              placeholder="Write a comment…"
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={4}
              required
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !body.trim()}
            >
              {submitting ? 'Posting…' : 'Post Comment'}
            </button>
          </form>
        ) : (
          <div className={styles.loginPrompt}>
            <Link to="/login" className={styles.loginLink}>Log in</Link> to comment.
          </div>
        )}
      </div>
    </section>
  );
}
