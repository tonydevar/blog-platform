const express = require('express');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const POSTS_FILE = path.join(__dirname, '../data/posts.json');
const USERS_FILE = path.join(__dirname, '../data/users.json');

function readPosts() {
  return JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));
}

function writePosts(posts) {
  fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
}

function readUsers() {
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}

function getAuthor(users, authorId) {
  const u = users.find(u => u.id === authorId);
  if (!u) return { id: authorId, name: 'Unknown', avatar: '' };
  return { id: u.id, name: u.name, avatar: u.avatar };
}

function calculateReadTime(content) {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

// Optional auth middleware (attaches req.user if token present, doesn't block)
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) return next();
  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
  try {
    req.user = jwt.verify(authHeader.slice(7), JWT_SECRET);
  } catch {
    // invalid token — proceed unauthenticated
  }
  next();
}

// GET /api/posts
router.get('/', optionalAuth, (req, res) => {
  const { category, search, author, page = '1', limit = '9' } = req.query;

  const users = readUsers();
  let posts = readPosts();

  // Filter visibility
  posts = posts.filter(p => {
    if (p.status === 'published') return true;
    if (req.user && p.authorId === req.user.id && p.status === 'draft') return true;
    return false;
  });

  // Category filter (case-insensitive)
  if (category) {
    posts = posts.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  // Author filter
  if (author) {
    posts = posts.filter(p => p.authorId === author);
  }

  // Search filter (case-insensitive on title, excerpt, content)
  if (search) {
    const term = search.toLowerCase();
    posts = posts.filter(p =>
      p.title.toLowerCase().includes(term) ||
      p.excerpt.toLowerCase().includes(term) ||
      p.content.toLowerCase().includes(term)
    );
  }

  const total = posts.length;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 9);
  const totalPages = Math.ceil(total / limitNum);
  const paginated = posts.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  const result = paginated.map(p => ({
    id: p.id,
    title: p.title,
    excerpt: p.excerpt,
    authorId: p.authorId,
    author: getAuthor(users, p.authorId),
    category: p.category,
    status: p.status,
    readTime: p.readTime,
    tags: p.tags,
    commentCount: p.comments ? p.comments.length : 0,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));

  res.json({ posts: result, total, page: pageNum, totalPages });
});

// GET /api/posts/:id
router.get('/:id', optionalAuth, (req, res) => {
  const posts = readPosts();
  const users = readUsers();
  const post = posts.find(p => p.id === req.params.id);

  if (!post) return res.status(404).json({ error: 'Post not found' });

  if (post.status !== 'published') {
    if (!req.user || req.user.id !== post.authorId) {
      return res.status(404).json({ error: 'Post not found' });
    }
  }

  const commentsWithAuthors = (post.comments || []).map(c => ({
    ...c,
    author: getAuthor(users, c.authorId),
  }));

  res.json({
    post: {
      ...post,
      author: getAuthor(users, post.authorId),
      comments: commentsWithAuthors,
    },
  });
});

// POST /api/posts
router.post('/', authMiddleware, (req, res) => {
  const { title, excerpt, content, category, status = 'published', tags = [] } = req.body;

  if (!title || !excerpt || !content || !category) {
    return res.status(400).json({ error: 'title, excerpt, content, and category are required' });
  }

  const posts = readPosts();

  // Generate slug from title
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  let slug = baseSlug;
  let counter = 2;
  while (posts.find(p => p.id === slug)) {
    slug = `${baseSlug}-${counter++}`;
  }

  const now = new Date().toISOString();
  const newPost = {
    id: slug,
    title,
    excerpt,
    content,
    authorId: req.user.id,
    category,
    status,
    readTime: calculateReadTime(content),
    tags: Array.isArray(tags) ? tags : [],
    comments: [],
    createdAt: now,
    updatedAt: now,
  };

  posts.push(newPost);
  writePosts(posts);

  const users = readUsers();
  res.status(201).json({
    post: { ...newPost, author: getAuthor(users, req.user.id) },
  });
});

// PUT /api/posts/:id
router.put('/:id', authMiddleware, (req, res) => {
  const posts = readPosts();
  const idx = posts.findIndex(p => p.id === req.params.id);

  if (idx === -1) return res.status(404).json({ error: 'Post not found' });
  if (posts[idx].authorId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden: not the post author' });
  }

  const { title, excerpt, content, category, status, tags } = req.body;
  const post = posts[idx];

  if (title !== undefined) post.title = title;
  if (excerpt !== undefined) post.excerpt = excerpt;
  if (content !== undefined) {
    post.content = content;
    post.readTime = calculateReadTime(content);
  }
  if (category !== undefined) post.category = category;
  if (status !== undefined) post.status = status;
  if (tags !== undefined) post.tags = Array.isArray(tags) ? tags : post.tags;
  post.updatedAt = new Date().toISOString();

  posts[idx] = post;
  writePosts(posts);

  const users = readUsers();
  res.json({ post: { ...post, author: getAuthor(users, post.authorId) } });
});

// DELETE /api/posts/:id
router.delete('/:id', authMiddleware, (req, res) => {
  const posts = readPosts();
  const idx = posts.findIndex(p => p.id === req.params.id);

  if (idx === -1) return res.status(404).json({ error: 'Post not found' });
  if (posts[idx].authorId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden: not the post author' });
  }

  posts.splice(idx, 1);
  writePosts(posts);
  res.json({ message: 'Post deleted successfully' });
});

// POST /api/posts/:id/comments
router.post('/:id/comments', authMiddleware, (req, res) => {
  const { body } = req.body;
  if (!body || typeof body !== 'string' || body.trim().length === 0) {
    return res.status(400).json({ error: 'Comment body is required' });
  }

  const posts = readPosts();
  const idx = posts.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Post not found' });

  const newComment = {
    id: `comment-${uuidv4()}`,
    authorId: req.user.id,
    body: body.trim(),
    createdAt: new Date().toISOString(),
  };

  posts[idx].comments = posts[idx].comments || [];
  posts[idx].comments.push(newComment);
  posts[idx].updatedAt = new Date().toISOString();
  writePosts(posts);

  const users = readUsers();
  res.status(201).json({
    comment: { ...newComment, author: getAuthor(users, req.user.id) },
  });
});

module.exports = router;
