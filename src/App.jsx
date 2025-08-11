import React, { useState } from 'react';
import { Provider, useSelector } from 'react-redux';
import { store } from './store';
import SearchBar from './SearchBar';
import Feed from './Feed';
import Sidebar from './Sidebar';
import SidebarToggle from './SidebarToggle';

const CLIENT_ID = "pn__ltuAczu_dbb-rtenaw"; // à mettre depuis Reddit Dev
const REDIRECT_URI = "https://xtazhoxton.github.io/callback";
const SCOPES = "read,identity";
const STATE = "random123";

function LoginButton() {
  const token = useSelector(state => state.posts.token);

  const loginWithReddit = () => {
    const authUrl = `https://www.reddit.com/api/v1/authorize?client_id=${CLIENT_ID}&response_type=token&state=${STATE}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&duration=temporary&scope=${SCOPES}`;
    window.location.href = authUrl;
  };

  if (token) {
    return <p className="text-green-600 font-bold">✅ Connecté à Reddit</p>;
  }

  return (
    <button
      onClick={loginWithReddit}
      className="bg-orange-500 text-white px-4 py-2 rounded"
    >
      Se connecter à Reddit
    </button>
  );
}

export default function App() {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  return (
    <Provider store={store}>
      <div className="relative min-h-screen bg-gray-50">
        <SidebarToggle
          onClick={() => setSidebarVisible(v => !v)}
          isOpen={sidebarVisible}
        />
        <Sidebar visible={sidebarVisible} />

        <div className={`${sidebarVisible ? 'ml-60' : 'ml-0'} transition-margin duration-300 pt-4 px-4 lg:px-8`}>
          <header className="max-w-4xl mx-auto mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">RedditMinimal</h1>
            <LoginButton />
          </header>

          <SearchBar />
          <main className="flex justify-center">
            <Feed />
          </main>
        </div>
      </div>
    </Provider>
  );
}
