// src/App.jsx
import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import SearchBar from './SearchBar';
import Feed from './Feed';

export default function App() {
  // Le Feed va appeler PostCard, qui gère lui-même l’expansion des commentaires.
  return (
    <Provider store={store}>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-2xl font-bold">RedditMinimal</h1>
          </div>
        </header>

        <SearchBar />
        <Feed />
      </div>
    </Provider>
  );
}
