import React, { useState, useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, fetchPosts, setSubreddit } from './store';
import { Search } from 'lucide-react';
import CommentsModal from './CommentsModal';

// SearchBar: sélection de subreddit
function SearchBar() {
  const dispatch = useDispatch();
  const [input, setInput] = useState('');

  const onSubmit = e => {
    e.preventDefault();
    if (!input.trim()) return;
    dispatch(setSubreddit(input.trim()));
    dispatch(fetchPosts(input.trim()));
  };

  return (
    <form onSubmit={onSubmit} className="flex items-center max-w-xl mx-auto p-4">
      <Search className="w-5 h-5 text-gray-500 mr-2" />
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Search subreddit..."
        className="flex-1 border border-gray-300 rounded-l px-3 py-2 focus:outline-none"
      />
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-r">
        Go
      </button>
    </form>
  );
}

// PostCard: affiche vote, contenu et miniature/full image
function PostCard({ post, onSelect }) {
  // Calcule la vraie URL d'image (preview ou lien direct)
  const imageUrl = post.preview?.images?.[0]?.source?.url
    ?.replace(/&amp;/g, '&')
    || (/\.(jpe?g|png|gif)$/i.test(post.url) ? post.url : null);

  return (
    <article
      className="flex bg-white rounded shadow mb-6 max-w-2xl mx-auto cursor-pointer hover:shadow-lg transition"
      onClick={() => onSelect(post)}
    >
      {/* Barre de vote */}
      <div className="flex flex-col items-center px-3 py-4 bg-gray-50 border-r">
        <div className="text-gray-400 hover:text-green-500 cursor-pointer">▲</div>
        <span className="text-sm font-medium text-gray-700">{post.score}</span>
        <div className="text-gray-400 hover:text-red-500 cursor-pointer">▼</div>
      </div>

      {/* Contenu du post */}
      <div className="p-4 flex-1">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h2>

        {imageUrl && (
          <div className="my-4">
            <img
              src={imageUrl}
              alt={post.title}
              className="w-full h-auto rounded-md object-contain"
            />
          </div>
        )}

        <div className="text-sm text-gray-500">Posted by u/{post.author}</div>
      </div>
    </article>
  );
}

// Feed: liste des posts selon le state Redux
function Feed({ onSelect }) {
  const dispatch = useDispatch();
  const { items, status, error, subreddit } = useSelector(state => state.posts);

  useEffect(() => {
    dispatch(fetchPosts(subreddit));
  }, [dispatch, subreddit]);

  if (status === 'loading') return <p className="text-center p-4">Loading...</p>;
  if (status === 'failed') return <p className="text-center p-4 text-red-500">{error}</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      {items.map(post => (
        <PostCard key={post.id} post={post} onSelect={onSelect} />
      ))}
    </div>
  );
}

// Composant principal App
export default function App() {
  const [selectedPost, setSelectedPost] = useState(null);

  return (
    <Provider store={store}>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-2xl font-bold">RedditMinimal</h1>
          </div>
        </header>

        <SearchBar />
        <Feed onSelect={setSelectedPost} />

        {/* Modal des commentaires */}
        {selectedPost && (
          <CommentsModal
            post={selectedPost}
            onClose={() => setSelectedPost(null)}
          />
        )}
      </div>
    </Provider>
  );
}
