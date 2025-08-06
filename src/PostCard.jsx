// src/PostCard.jsx
import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, ArrowDown, MessageCircle } from 'lucide-react'
import AuthorHovercard from './AuthorHovercard'
import VideoPlayer from './VideoPlayer'
import ImageCarousel from './ImageCarousel'

export default function PostCard({ post }) {
  const [expanded, setExpanded] = useState(false)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)

  const imageUrl =
    post.preview?.images?.[0]?.source?.url.replace(/&amp;/g, '&') ||
    (/\.(jpe?g|png|gif)$/i.test(post.url) ? post.url : null)
  const ratio = post.upvote_ratio ?? 0

  const toggleComments = async () => {
    if (!expanded && comments.length === 0) {
      setLoading(true)
      try {
        const res = await fetch(`https://reddit-proxy-8.vercel.app/api/reddit?path=${post.permalink}.json`)

        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        const rawComments = Array.isArray(data)
          ? data[1]?.data?.children.filter(c => c.kind === 't1').map(c => c.data)
          : []
        setComments(rawComments)
      } catch (err) {
        console.error('Failed to load comments', err)
        // Optionnel : tu peux set un message d'erreur ici
      } finally {
        setLoading(false)
      }
    }
    setExpanded(v => !v)
  }

  return (
    <article className="flex flex-col lg:flex-row bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden ">
      {/* vote + ratio */}
      <div className="flex-none flex flex-col items-center bg-gray-50 px-3 py-4 border-r border-gray-200">
        <button className="p-1 hover:text-[#00489A] transition">
          <ArrowUp size={20} />
        </button>
        <span className="mt-1 font-semibold text-gray-800">{post.score}</span>
        <div className="relative w-2 h-20 bg-red-200 mt-3 rounded">
          <div
            className="absolute bottom-0 w-full bg-[#00489A] rounded"
            style={{ height: `${ratio * 5}rem`, transition: 'height .25s' }}
          />
        </div>
        <button className="mt-3 p-1 hover:text-[#00489A] transition">
          <ArrowDown size={20} />
        </button>
      </div>

      {/* contenu */}
      <div className="flex-1 p-5">
        <h2 className="text-xl font-bold text-gray-900 mb-3 leading-snug">
          {post.title}
        </h2>

        {/* texte */}
        {post.selftext && (
          <div className="prose prose-sm prose-strong:text-gray-800 mb-4">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.selftext}
            </ReactMarkdown>
          </div>
        )}

        {/* vidéo */}
        {post.is_video && post.media?.reddit_video && (
          <div className="mb-4">
            <VideoPlayer media={post.media} />
          </div>
        )}

        {/* carousel */}
        {post.is_gallery && post.gallery_data && post.media_metadata && (
          <div className="mb-4">
            <ImageCarousel
              galleryData={post.gallery_data}
              mediaMetadata={post.media_metadata}
            />
          </div>
        )}

        {/* image unique */}
        {!post.is_video && !post.is_gallery && imageUrl && (
          <div className="mb-4">
            <img
            src={imageUrl}
            alt={post.title}
            className="w-full max-h-[400px] md:max-h-[600px] object-contain rounded-md"
            />
          </div>
        )}

        {/* footer */}
        <div className="flex flex-wrap items-center justify-between text-sm text-gray-600">
          <div>
            Posté par <AuthorHovercard author={post.author} />
          </div>
          <button
            onClick={toggleComments}
            className="flex items-center gap-1 px-2 py-1 hover:text-[#00489A] transition-colors"
          >
            <MessageCircle size={18} />
            {post.num_comments}
          </button>
        </div>

        {/* commentaires */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="comments"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="mt-4 bg-gray-50 rounded-b-lg "
            >
              {loading ? (
                <p className="p-4 text-center text-gray-500">Chargement…</p>
              ) : (
                comments.map(c =>
                  c.id && c.body ? (
                    <div
                      key={c.id}
                      className="px-4 py-3 border-t border-gray-200"
                    >
                      <div className="text-xs text-gray-500 mb-2">
                        u/{c.author} •{' '}
                        {new Date(c.created_utc * 1000).toLocaleString()}
                      </div>
                    <div className="prose prose-sm prose-blockquote:border-l-4 prose-blockquote:border-gray-300">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {c.body}
                      </ReactMarkdown>
                    </div>
                    </div>
                  ) : null
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </article>
  )
}
