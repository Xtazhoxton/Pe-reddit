import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown, MessageCircle } from 'lucide-react';

export default function PostCard({ post }) {
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  // Récupère les vrais posts preview
  const imageUrl = post.preview?.images?.[0]?.source?.url
    ?.replace(/&amp;/g, '&')
    || (/\.(jpe?g|png|gif)$/i.test(post.url) ? post.url : null);

  const toggleComments = () => {
    if (!expanded && comments.length === 0) {
      setLoadingComments(true);
      fetch(`https://www.reddit.com${post.permalink}.json`)
        .then(r => r.json())
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
        {/* Vote + mini‐barre à gauche */}
        <div className="flex flex-col items-center px-3 py-4 bg-gray-50 border-r">
          <ArrowUp className="w-5 h-5 text-gray-400 hover:text-green-500 cursor-pointer" />
          <span className="text-sm font-medium text-gray-700">{post.score}</span>
          <ArrowDown className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer" />
        </div>

        {/* Contenu */}
        <div className="p-4 flex-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h2>
        
        {post.selftext && (
        <div className="prose prose-sm mb-4">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.selftext}
            </ReactMarkdown>
        </div>
        )}
          {imageUrl && (
            <div className="my-4">
              <img
                src={imageUrl}
                alt={post.title}
                className="w-full h-auto rounded-md object-contain"
              />
            </div>
          )}

          <div className="text-sm text-gray-500 mb-2">
            Posted by u/{post.author}
          </div>

          {/* Footer interactif */}
          <div className="flex items-center text-sm text-gray-600 space-x-6">
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

      {/* Zone des commentaires animée */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="comments"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-50 overflow-hidden"
          >
            {loadingComments ? (
              <p className="p-4 text-center">Loading comments…</p>
            ) : (
              comments.map(c => (
                <div key={c.id} className="p-4 border-t">
                  <div className="text-xs text-gray-500 mb-1">
                    u/{c.author} • {new Date(c.created_utc * 1000).toLocaleString()}
                  </div>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {c.body}
                  </ReactMarkdown>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}