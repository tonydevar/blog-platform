import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './PostPage.module.css';

export default function PostPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/posts/${id}`)
      .then(r => r.json())
      .then(d => setPost(d.post || null))
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className={styles.loading}>Loading…</div>;
  if (!post) return (
    <div className={styles.notFound}>
      <p>Post not found.</p>
      <Link to="/">← Back to posts</Link>
    </div>
  );

  return (
    <div className={`container ${styles.page}`}>
      <Link to="/" className={styles.back}>← Back to posts</Link>
      <article className={styles.article}>
        <div className={styles.meta}>
          <Link to={`/category/${post.category.toLowerCase()}`} className={styles.category}>
            {post.category}
          </Link>
          <span className={styles.readTime}>{post.readTime} min read</span>
        </div>
        <h1 className={styles.title}>{post.title}</h1>
        <div className={styles.author}>
          <img
            src={post.author?.avatar}
            alt={post.author?.name}
            className={styles.avatar}
          />
          <div>
            <div className={styles.authorName}>{post.author?.name}</div>
            <div className={styles.date}>
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </div>
          </div>
        </div>
        <div
          className={styles.content}
          dangerouslySetInnerHTML={{
            __html: (typeof window !== 'undefined' && window.marked)
              ? window.marked.parse(post.content)
              : post.content.replace(/\n/g, '<br/>'),
          }}
        />
      </article>

      {post.comments && post.comments.length > 0 && (
        <section className={styles.comments}>
          <h2>Comments ({post.comments.length})</h2>
          {post.comments.map(c => (
            <div key={c.id} className={styles.comment}>
              <img
                src={c.author?.avatar}
                alt={c.author?.name}
                className={styles.commentAvatar}
              />
              <div>
                <strong>{c.author?.name}</strong>
                <span className={styles.commentDate}>
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
                <p>{c.body}</p>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
