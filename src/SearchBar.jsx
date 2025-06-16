import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setSubreddit, fetchPosts } from './store';
import { Search } from 'lucide-react';

export default function SearchBar() {
  const dispatch = useDispatch();
  const [input, setInput] = useState('');

  const onSubmit = e => {
    e.preventDefault();
    const subreddit = input.trim();
    if (!subreddit) return;
    dispatch(setSubreddit(subreddit));
    dispatch(fetchPosts(subreddit));
    setInput('');
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex items-center max-w-xl mx-auto p-4 space-x-2"
    >
      <Search className="w-5 h-5 text-gray-500" />
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Search subreddit..."
        className="flex-1 border border-gray-300 rounded-l px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 transition"
      >
        Go
      </button>
    </form>
  );
}
