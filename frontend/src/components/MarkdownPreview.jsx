import React, { useMemo } from 'react';
import { marked } from 'marked';
import styles from './MarkdownPreview.module.css';

export default function MarkdownPreview({ content }) {
  const html = useMemo(() => {
    if (!content) return '<p class="empty-preview">Nothing to preview yet…</p>';
    return marked.parse(content);
  }, [content]);

  return (
    <div
      className={styles.preview}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
