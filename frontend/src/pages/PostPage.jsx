import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { marked } from 'marked';
import { useAuth } from '../context/AuthContext.jsx';
import CommentList from '../components/CommentList.jsx';
import styles from './PostPage.module.css';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function PostPage() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    fetch(`/api/posts/${id}`, { headers })
      .then(r => r.json())
      .then(data => {
        setPost(data.post || null);
        setRelated(data.related || []);
      })
      .catch(() => {
        setPost(null);
        setRelated([]);
      })
      .finally(() => setLoading(false));
  }, [id, token]);

  async function handleDelete() {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Delete failed');
      navigate('/');
    } catch {
      setDeleting(false);
      setDeleteConfirm(false);
    }
  }

  if (loading) {
    return <div className={styles.loading}>Loading…</div>;
  }

  if (!post) {
    return (
      <div className={styles.notFound}>
        <p>Post not found.</p>
        <Link to="/">← Back to posts</Link>
      </div>
    );
  }

  const isAuthor = user && user.id === post.authorId;
  const contentHtml = marked.parse(post.content || '');

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.breadcrumb}>
        <Link to="/" className={styles.backLink}>← All posts</Link>
        <span className={styles.sep}>/</span>
        <Link
          to={`/category/${post.category.toLowerCase()}`}
          className={styles.categoryLink}
        >
          {post.category}
        </Link>
      </div>

      <div className={styles.layout}>
        {/* Main content */}
        <main className={styles.main}>
          <article className={styles.article}>
            <div className={styles.articleMeta}>
              <Link
                to={`/category/${post.category.toLowerCase()}`}
                className={styles.categoryBadge}
              >
                {post.category}
              </Link>
              <span className={styles.readTime}>{post.readTime} min read</span>
              {post.status === 'draft' && (
                <span className={styles.draftBadge}>Draft</span>
              )}
            </div>

            <h1 className={styles.title}>{post.title}</h1>

            <div className={styles.authorRow}>
              <img
                src={
                  post.author?.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.name}`
                }
                alt={post.author?.name}
                className={styles.authorAvatar}
              />
              <div>
                <div className={styles.authorName}>{post.author?.name}</div>
                <div className={styles.articleDate}>{formatDate(post.createdAt)}</div>
              </div>

              {isAuthor && (
                <div className={styles.authorActions}>
                  <Link
                    to={`/edit/${post.id}`}
                    className={`btn btn-outline ${styles.editBtn}`}
                  >
                    ✏️ Edit
                  </Link>
                  {deleteConfirm ? (
                    <div className={styles.deleteConfirm}>
                      <span>Are you sure?</span>
                      <button
                        className={`btn ${styles.confirmBtn}`}
                        onClick={handleDelete}
                        disabled={deleting}
                      >
                        {deleting ? 'Deleting…' : 'Yes, delete'}
                      </button>
                      <button
                        className="btn btn-ghost"
                        onClick={() => setDeleteConfirm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      className={`btn ${styles.deleteBtn}`}
                      onClick={handleDelete}
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
              )}
            </div>

            <div
              className={styles.content}
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          </article>

          <CommentList
            postId={post.id}
            comments={post.comments || []}
          />
        </main>

        {/* Author sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.authorCard}>
            <img
              src={
                post.author?.avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.name}`
              }
              alt={post.author?.name}
              className={styles.sidebarAvatar}
            />
            <h3 className={styles.sidebarName}>{post.author?.name}</h3>
            {post.author?.bio && (
              <p className={styles.sidebarBio}>{post.author.bio}</p>
            )}
          </div>

          {related.length > 0 && (
            <div className={styles.relatedSection}>
              <h4 className={styles.relatedHeading}>Related Posts</h4>
              <div className={styles.relatedList}>
                {related.map(r => (
                  <Link key={r.id} to={`/post/${r.id}`} className={styles.relatedItem}>
                    <span className={styles.relatedTitle}>{r.title}</span>
                    <span className={styles.relatedDate}>{formatDate(r.createdAt)}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
