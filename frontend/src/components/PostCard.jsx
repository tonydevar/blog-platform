import React from 'react';
import { Link } from 'react-router-dom';
import styles from './PostCard.module.css';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function truncate(text, maxLen = 140) {
  if (!text || text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + '…';
}

export default function PostCard({ post }) {
  return (
    <article className={styles.card}>
      <div className={styles.body}>
        <div className={styles.meta}>
          <Link
            to={`/category/${post.category.toLowerCase()}`}
            className={styles.category}
          >
            {post.category}
          </Link>
          <span className={styles.readTime}>{post.readTime} min read</span>
        </div>

        <Link to={`/post/${post.id}`} className={styles.titleLink}>
          <h2 className={styles.title}>{post.title}</h2>
        </Link>

        <p className={styles.excerpt}>{truncate(post.excerpt)}</p>

        <div className={styles.footer}>
          <div className={styles.author}>
            <img
              src={
                post.author?.avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.name}`
              }
              alt={post.author?.name}
              className={styles.avatar}
            />
            <div className={styles.authorInfo}>
              <span className={styles.authorName}>{post.author?.name}</span>
              <span className={styles.date}>{formatDate(post.createdAt)}</span>
            </div>
          </div>
          <span className={styles.comments}>
            💬 {post.commentCount || 0}
          </span>
        </div>
      </div>
    </article>
  );
}
