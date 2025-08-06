// src/components/AuthorHovercard.jsx
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

export default function AuthorHovercard({ author }) {
  const [profile, setProfile] = useState(null);
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef();
  const timeoutRef = useRef();

  // 1) Fetch des données Reddit quand on hover
  useEffect(() => {
    if (visible && !profile) {
      fetch(`https://reddit-proxy-8.vercel.app/api/reddit?path=user/${author}/about`)
        .then(r => r.json())
        .then(json => setProfile(json.data))
        .catch(console.error);
    }
  }, [visible, author, profile]);

  // 2) Calculer la position du trigger pour placer la carte juste en dessous
  useLayoutEffect(() => {
    if (visible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + window.scrollY + 4,    // 4px de marge
        left: rect.left + window.scrollX + rect.width / 2,
      });
    }
  }, [visible]);

  // 3) Handlers hover avec petit delay
  const show = () => {
    timeoutRef.current = setTimeout(() => setVisible(true), 300);
  };
  const hide = () => {
    clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  // 4) Le portal contenant la hovercard
  const card = visible && profile && createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.15 }}
        style={{
          position: 'absolute',
          top: pos.top,
          left: pos.left,
          transform: 'translateX(-50%)',
          width: 240
        }}
        className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-sm text-gray-800 z-[9999]"
        onMouseEnter={show}
        onMouseLeave={hide}
      >
        <h3 className="font-semibold mb-1">u/{profile.name}</h3>
        <p className="text-xs text-gray-600 mb-1">
          Karma total : {profile.total_karma}
        </p>
        <p className="text-xs text-gray-600">
          Membre depuis : {new Date(profile.created_utc * 1000).toLocaleDateString()}
        </p>
      </motion.div>
    </AnimatePresence>,
    document.body
  );

  return (
    <span
      ref={triggerRef}
      onMouseEnter={show}
      onMouseLeave={hide}
      className="inline-block"
    >
      <span className="text-blue-800 hover:underline cursor-pointer">
        u/{author}
      </span>
      {card}
    </span>
  );
}
