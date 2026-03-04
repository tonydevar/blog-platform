import React, { useState } from 'react';
import MarkdownPreview from './MarkdownPreview.jsx';
import styles from './PostEditor.module.css';

const CATEGORIES = ['Technology', 'Lifestyle', 'Travel', 'Food', 'Science'];

export default function PostEditor({ initialValues = {}, onSubmit, submitLabel = 'Publish' }) {
  const [title, setTitle] = useState(initialValues.title || '');
  const [category, setCategory] = useState(initialValues.category || CATEGORIES[0]);
  const [status, setStatus] = useState(initialValues.status || 'published');
  const [content, setContent] = useState(initialValues.content || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), category, status, content });
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <div className={styles.error}>{error}</div>}

      {/* Title */}
      <div className={styles.field}>
        <label className={styles.label} htmlFor="post-title">Title</label>
        <input
          id="post-title"
          type="text"
          className={styles.input}
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Post title…"
          required
        />
      </div>

      {/* Category + Status row */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="post-category">Category</label>
          <select
            id="post-category"
            className={styles.select}
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Status</label>
          <div className={styles.toggle}>
            <button
              type="button"
              className={`${styles.toggleBtn} ${status === 'published' ? styles.toggleActive : ''}`}
              onClick={() => setStatus('published')}
            >
              Published
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${status === 'draft' ? styles.toggleActive : ''}`}
              onClick={() => setStatus('draft')}
            >
              Draft
            </button>
          </div>
        </div>
      </div>

      {/* Editor / Preview side by side */}
      <div className={styles.editorRow}>
        <div className={styles.editorPane}>
          <div className={styles.paneLabel}>Markdown</div>
          <textarea
            className={styles.textarea}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write your post in Markdown…"
            rows={20}
          />
        </div>
        <div className={styles.previewPane}>
          <div className={styles.paneLabel}>Preview</div>
          <div className={styles.previewBox}>
            <MarkdownPreview content={content} />
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting}
        >
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
