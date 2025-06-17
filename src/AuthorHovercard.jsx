// src/components/AuthorHovercard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { createPortal } from 'react-dom';

export default function AuthorHovercard({ author }) {
  const [profile, setProfile] = useState(null);
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef();

  useEffect(() => {
    if (visible && !profile) {
      fetch(`https://www.reddit.com/user/${author}/about.json`)
        .then(r => r.json())
        .then(json => setProfile(json.data))
        .catch(console.error);
    }
  }, [visible, author, profile]);

  const show = () => {
    timeoutRef.current = setTimeout(() => setVisible(true), 300);
  };
  const hide = () => {
    clearTimeout(timeoutRef.current);
    setVisible(false);
  };

 return (
    <span 
      className="relative inline-block"
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      <span className="text-blue-600 hover:underline cursor-pointer">
        u/{author}
      </span>

      <AnimatePresence>
        {visible && profile && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-full mt-1 w-64 bg-white border shadow-lg rounded-md p-4 z-50"
          >
            <h3 className="font-semibold mb-2">{profile.name}</h3>
            <p className="text-sm text-gray-600 mb-1">Karma : {profile.total_karma}</p>
            <p className="text-sm text-gray-600">
              Créé le : {new Date(profile.created_utc * 1000).toLocaleDateString()}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}