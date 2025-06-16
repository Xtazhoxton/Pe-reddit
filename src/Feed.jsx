// src/Feed.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts } from './store';
import PostCard from './PostCard';

export default function Feed() {
  const dispatch = useDispatch();
  const { items, status, error, subreddit } = useSelector(state => state.posts);

  useEffect(() => {
    dispatch(fetchPosts(subreddit));
  }, [dispatch, subreddit]);

  if (status === 'loading') return <p className="text-center p-4">Loading...</p>;
  if (status === 'failed')  return <p className="text-center p-4 text-red-500">{error}</p>;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {items.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
