import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown, MessageCircle } from 'lucide-react';
import AuthorHovercard from './AuthorHovercard';
import VideoPlayer from './VideoPlayer';
import ImageCarousel from './ImageCarousel';

export default function PostCard({ post }) {
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  // Compute media URL and upvote ratio
  const imageUrl =
    post.preview?.images?.[0]?.source?.url.replace(/&amp;/g, '&') ||
    (/(jpe?g|png|gif)$/i.test(post.url) ? post.url : null);
  const ratio = post.upvote_ratio ?? 0;

  const toggleComments = () => {
    if (!expanded && comments.length === 0) {
      setLoadingComments(true);
      fetch(`https://www.reddit.com${post.permalink}.json`)
        .then(res => res.json())
        .then(data => {
          const raw = data[1]?.data?.children.filter(c => c.kind === 't1') || [];
          setComments(raw.map(c => c.data));
        })
        .finally(() => setLoadingComments(false));
    }
    setExpanded(prev => !prev);
  };

  return (
    <article className="flex flex-col bg-white rounded shadow mb-6 max-w-2xl mx-auto">
      <div className="flex">
        {/* Voting bar + ratio */}
        <div className="flex flex-col items-center px-3 py-4 bg-gray-50 border-r">
          <ArrowUp className="w-5 h-5 text-gray-400 hover:text-green-500 cursor-pointer" />
          <span className="text-sm font-medium text-gray-700">{post.score}</span>
          <div className="relative w-2 h-16 bg-red-400 mt-2">
            <div
              className="absolute bottom-0 w-full bg-green-400"
              style={{ height: `${ratio * 4}rem`, transition: 'height .3s' }}
            />
          </div>
          <ArrowDown className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer mt-2" />
        </div>

        {/* Post content */}
        <div className="p-4 flex-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h2>

          {/* Post text */}
          {post.selftext && (
            <div className="prose prose-sm mb-4">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.selftext}</ReactMarkdown>
            </div>
          )}

          {/* Inline video */}
          {post.is_video && post.media?.reddit_video && (
            <VideoPlayer media={post.media} />
          )}

          {/* Image gallery */}
          {post.is_gallery && post.gallery_data && post.media_metadata && (
            <ImageCarousel
              galleryData={post.gallery_data}
              mediaMetadata={post.media_metadata}
            />
          )}

          {/* Single image fallback */}
          {!post.is_video && !post.is_gallery && imageUrl && (
            <div className="my-4">
              <img
                src={imageUrl}
                alt={post.title}
                className="w-full h-auto rounded-md object-contain"
              />
            </div>
          )}

          {/* Author + comments button */}
          <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
            <span>
              Posté par <AuthorHovercard author={post.author} />
            </span>
            <button
              onClick={toggleComments}
              className="flex items-center hover:text-blue-600 transition"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              {post.num_comments} comments
            </button>
          </div>
        </div>
      </div>

      {/* Inline comments accordion */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="comments"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-50 overflow-hidden mt-4"
          >
            {loadingComments ? (
              <p className="p-4 text-center">Loading comments…</p>
            ) : (
              comments.map(c => (
                <div key={c.id} className="p-4 border-t">
                  <div className="text-xs text-gray-500 mb-2">
                    u/{c.author} • {new Date(c.created_utc * 1000).toLocaleString()}
                  </div>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{c.body}</ReactMarkdown>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
