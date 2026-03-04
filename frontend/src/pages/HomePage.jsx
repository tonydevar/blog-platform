import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PostCard from '../components/PostCard.jsx';
import Pagination from '../components/Pagination.jsx';
import styles from './HomePage.module.css';

const PAGE_LIMIT = 9;

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [data, setData] = useState({ posts: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    params.set('page', String(page));
    params.set('limit', String(PAGE_LIMIT));

    fetch(`/api/posts?${params}`)
      .then(r => r.json())
      .then(setData)
      .catch(() => setData({ posts: [], total: 0, page: 1, totalPages: 1 }))
      .finally(() => setLoading(false));
  }, [search, page]);

  function handlePageChange(p) {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(p));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.heroBar}>
        <h1 className={styles.heading}>
          {search ? `Results for "${search}"` : 'Latest Posts'}
        </h1>
        <p className={styles.subheading}>
          {loading ? '' : `${data.total} post${data.total !== 1 ? 's' : ''}`}
        </p>
      </div>

      {loading ? (
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      ) : data.posts.length === 0 ? (
        <div className={styles.empty}>
          <p>No posts found{search ? ` for "${search}"` : ''}.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {data.posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      <Pagination
        page={data.page}
        totalPages={data.totalPages}
        onChange={handlePageChange}
      />
    </div>
  );
}
