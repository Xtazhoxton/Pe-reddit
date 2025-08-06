// src/CommentsModal.jsx
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function CommentsModal({ post, onClose }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://reddit-proxy-8.vercel.app/api/reddit?path=${post.permalink}.json`)
      .then(r => r.json())
      .then(data => {
        const raw = data[1]?.data?.children.filter(c => c.kind === 't1') || [];
        setComments(raw.map(c => c.data));
      })
      .finally(() => setLoading(false));
  }, [post.permalink]);

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-6 overflow-y-auto z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 mb-4">
          ✕ Close
        </button>
        <h2 className="text-xl font-bold mb-4">{post.title}</h2>
        {loading && <p>Loading comments…</p>}
        {!loading && comments.length === 0 && <p>No comments</p>}
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="p-4 bg-gray-50 rounded">
              <div className="text-sm text-gray-500 mb-2">
                u/{comment.author} • {new Date(comment.created_utc * 1000).toLocaleString()}
              </div>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {comment.body}
              </ReactMarkdown>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
