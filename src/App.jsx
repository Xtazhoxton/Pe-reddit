import React, { useState, useEffect, useReducer, useCallback } from 'react';
import { Search, Filter, X, ExternalLink, MessageCircle, ArrowUp, ArrowDown, Clock, User, Hash, ChevronLeft, ChevronRight, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

// Redux-like state management with useReducer
const initialState = {
  posts: [],
  filteredPosts: [],
  loading: false,
  error: null,
  searchTerm: '',
  selectedPost: null,
  currentPage: 0,
  hasMore: true,
  categories: ['Hot', 'New', 'Top', 'Rising'],
  selectedCategory: 'Hot',
  rateLimitError: false,
  lastFetchTime: 0
};

const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_POSTS: 'SET_POSTS',
  SET_ERROR: 'SET_ERROR',
  SET_SEARCH_TERM: 'SET_SEARCH_TERM',
  SET_FILTERED_POSTS: 'SET_FILTERED_POSTS',
  SET_SELECTED_POST: 'SET_SELECTED_POST',
  SET_CURRENT_PAGE: 'SET_CURRENT_PAGE',
  SET_CATEGORY: 'SET_CATEGORY',
  SET_RATE_LIMIT_ERROR: 'SET_RATE_LIMIT_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LAST_FETCH_TIME: 'SET_LAST_FETCH_TIME'
};

function reducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    case actionTypes.SET_POSTS:
      return { ...state, posts: action.payload, loading: false, error: null };
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case actionTypes.SET_SEARCH_TERM:
      return { ...state, searchTerm: action.payload };
    case actionTypes.SET_FILTERED_POSTS:
      return { ...state, filteredPosts: action.payload };
    case actionTypes.SET_SELECTED_POST:
      return { ...state, selectedPost: action.payload };
    case actionTypes.SET_CURRENT_PAGE:
      return { ...state, currentPage: action.payload };
    case actionTypes.SET_CATEGORY:
      return { ...state, selectedCategory: action.payload };
    case actionTypes.SET_RATE_LIMIT_ERROR:
      return { ...state, rateLimitError: action.payload };
    case actionTypes.CLEAR_ERROR:
      return { ...state, error: null, rateLimitError: false };
    case actionTypes.SET_LAST_FETCH_TIME:
      return { ...state, lastFetchTime: action.payload };
    default:
      return state;
  }
}

// Rate limiting utility
const checkRateLimit = (lastFetchTime) => {
  const now = Date.now();
  const timeSinceLastFetch = now - lastFetchTime;
  const minInterval = 6000; // 6 seconds to stay under 10 requests per minute
  return timeSinceLastFetch >= minInterval;
};

// API service
const RedditAPI = {
  async fetchPosts(category = 'hot', after = '') {
    const baseUrl = 'https://www.reddit.com/r/programming';
    const categoryMap = {
      'Hot': '',
      'New': '/new',
      'Top': '/top',
      'Rising': '/rising'
    };
    
    const endpoint = categoryMap[category] || '';
    const afterParam = after ? `?after=${after}` : '';
    const url = `${baseUrl}${endpoint}.json${afterParam}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('RATE_LIMIT');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      if (error.message === 'RATE_LIMIT') {
        throw error;
      }
      throw new Error(`Failed to fetch posts: ${error.message}`);
    }
  },

  async fetchComments(postId) {
    try {
      const response = await fetch(`https://www.reddit.com/r/programming/comments/${postId}.json`);
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('RATE_LIMIT');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      if (error.message === 'RATE_LIMIT') {
        throw error;
      }
      throw new Error(`Failed to fetch comments: ${error.message}`);
    }
  }
};

// Utility functions
const formatTimeAgo = (timestamp) => {
  const now = Date.now() / 1000;
  const diff = now - timestamp;
  
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const formatScore = (score) => {
  if (score >= 1000) {
    return `${(score / 1000).toFixed(1)}k`;
  }
  return score.toString();
};

const truncateText = (text, maxLength = 300) => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

// Components
const ErrorBoundary = ({ children, error, onRetry }) => {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
        <p className="text-gray-600 mb-4 max-w-md">{error}</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </button>
      </div>
    );
  }
  return children;
};

const SearchBar = ({ searchTerm, onSearchChange, onClearSearch }) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        type="text"
        placeholder="Search programming posts..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
      />
      {searchTerm && (
        <button
          onClick={onClearSearch}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selectedCategory === category
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

const PostCard = ({ post, onClick }) => {
  const postData = post.data;
  const hasImage = postData.preview && postData.preview.images && postData.preview.images[0];
  const imageUrl = hasImage ? postData.preview.images[0].source.url.replace(/&amp;/g, '&') : null;

  return (
    <article 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
      onClick={() => onClick(post)}
    >
      {imageUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
          <img 
            src={imageUrl} 
            alt={postData.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <User className="w-4 h-4" />
          <span>u/{postData.author}</span>
          <Clock className="w-4 h-4 ml-2" />
          <span>{formatTimeAgo(postData.created_utc)}</span>
          <Hash className="w-4 h-4 ml-2" />
          <span>r/{postData.subreddit}</span>
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
          {postData.title}
        </h2>
        
        {postData.selftext && (
          <p className="text-gray-600 mb-4 line-clamp-3">
            {truncateText(postData.selftext)}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm">
              <ArrowUp className="w-4 h-4 text-green-500" />
              <span className="font-medium">{formatScore(postData.score)}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MessageCircle className="w-4 h-4" />
              <span>{postData.num_comments}</span>
            </div>
          </div>
          
          {postData.url && postData.url !== `https://www.reddit.com${postData.permalink}` && (
            <div className="flex items-center gap-1 text-sm text-blue-600">
              <ExternalLink className="w-4 h-4" />
              <span>External Link</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

const PostModal = ({ post, onClose, comments, loadingComments }) => {
  if (!post) return null;
  
  const postData = post.data;
  const hasImage = postData.preview && postData.preview.images && postData.preview.images[0];
  const imageUrl = hasImage ? postData.preview.images[0].source.url.replace(/&amp;/g, '&') : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold truncate pr-4">Post Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          {imageUrl && (
            <div className="mb-6 rounded-lg overflow-hidden">
              <img 
                src={imageUrl} 
                alt={postData.title}
                className="w-full h-auto"
              />
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <User className="w-4 h-4" />
            <span>u/{postData.author}</span>
            <Clock className="w-4 h-4 ml-2" />
            <span>{formatTimeAgo(postData.created_utc)}</span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {postData.title}
          </h1>
          
          {postData.selftext && (
            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 whitespace-pre-wrap">{postData.selftext}</p>
            </div>
          )}
          
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <ArrowUp className="w-5 h-5 text-green-500" />
              <span className="font-semibold">{formatScore(postData.score)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MessageCircle className="w-5 h-5" />
              <span>{postData.num_comments} comments</span>
            </div>
          </div>
          
          {postData.url && postData.url !== `https://www.reddit.com${postData.permalink}` && (
            <div className="mb-6">
              <a
                href={postData.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View Original Link
              </a>
            </div>
          )}
          
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Comments</h3>
            {loadingComments ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading comments...</span>
              </div>
            ) : comments && comments.length > 0 ? (
              <div className="space-y-4">
                {comments.slice(0, 10).map((comment, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <User className="w-4 h-4" />
                      <span>u/{comment.data.author}</span>
                      <Clock className="w-4 h-4 ml-2" />
                      <span>{formatTimeAgo(comment.data.created_utc)}</span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {comment.data.body}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-sm">
                      <ArrowUp className="w-4 h-4 text-green-500" />
                      <span>{formatScore(comment.data.score)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No comments available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    <span className="ml-3 text-gray-600">Loading posts...</span>
  </div>
);

const RateLimitNotice = ({ onClose }) => (
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
    <div className="flex items-center">
      <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
      <div className="flex-1">
        <h3 className="text-sm font-medium text-yellow-800">Rate Limit Reached</h3>
        <p className="text-sm text-yellow-700 mt-1">
          Please wait a moment before making another request. Reddit limits free API usage to 10 requests per minute.
        </p>
      </div>
      <button
        onClick={onClose}
        className="ml-4 text-yellow-600 hover:text-yellow-800"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  </div>
);

// Main App Component
export default function RedditApp() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  // Fetch posts
  const fetchPosts = useCallback(async (category = 'Hot', showLoading = true) => {
    if (!checkRateLimit(state.lastFetchTime)) {
      dispatch({ type: actionTypes.SET_RATE_LIMIT_ERROR, payload: true });
      return;
    }

    if (showLoading) {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
    }
    
    try {
      dispatch({ type: actionTypes.SET_LAST_FETCH_TIME, payload: Date.now() });
      const data = await RedditAPI.fetchPosts(category);
      const posts = data.data.children.filter(post => post.kind === 't3');
      dispatch({ type: actionTypes.SET_POSTS, payload: posts });
      dispatch({ type: actionTypes.SET_FILTERED_POSTS, payload: posts });
    } catch (error) {
      if (error.message === 'RATE_LIMIT') {
        dispatch({ type: actionTypes.SET_RATE_LIMIT_ERROR, payload: true });
      } else {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      }
    }
  }, [state.lastFetchTime]);

  // Fetch comments for a post
  const fetchComments = async (postId) => {
    if (!checkRateLimit(state.lastFetchTime)) {
      return;
    }

    setLoadingComments(true);
    try {
      dispatch({ type: actionTypes.SET_LAST_FETCH_TIME, payload: Date.now() });
      const data = await RedditAPI.fetchComments(postId);
      if (data && data[1] && data[1].data && data[1].data.children) {
        const commentData = data[1].data.children.filter(comment => comment.kind === 't1');
        setComments(commentData);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  // Search functionality
  const handleSearch = (searchTerm) => {
    dispatch({ type: actionTypes.SET_SEARCH_TERM, payload: searchTerm });
    
    if (!searchTerm.trim()) {
      dispatch({ type: actionTypes.SET_FILTERED_POSTS, payload: state.posts });
      return;
    }

    const filtered = state.posts.filter(post => {
      const title = post.data.title.toLowerCase();
      const selftext = post.data.selftext ? post.data.selftext.toLowerCase() : '';
      const author = post.data.author.toLowerCase();
      const term = searchTerm.toLowerCase();
      
      return title.includes(term) || selftext.includes(term) || author.includes(term);
    });
    
    dispatch({ type: actionTypes.SET_FILTERED_POSTS, payload: filtered });
  };

  // Category change
  const handleCategoryChange = (category) => {
    dispatch({ type: actionTypes.SET_CATEGORY, payload: category });
    fetchPosts(category);
  };

  // Post selection
  const handlePostClick = (post) => {
    dispatch({ type: actionTypes.SET_SELECTED_POST, payload: post });
    fetchComments(post.data.id);
  };

  const handleCloseModal = () => {
    dispatch({ type: actionTypes.SET_SELECTED_POST, payload: null });
    setComments([]);
  };

  // Error handling
  const handleRetry = () => {
    dispatch({ type: actionTypes.CLEAR_ERROR });
    fetchPosts(state.selectedCategory);
  };

  const handleClearRateLimit = () => {
    dispatch({ type: actionTypes.SET_RATE_LIMIT_ERROR, payload: false });
  };

  // Initial load
  useEffect(() => {
    fetchPosts('Hot');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              📱 Reddit Programming Hub
            </h1>
            <div className="text-sm text-gray-500">
              {state.filteredPosts.length} posts
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="flex-1 max-w-md">
              <SearchBar
                searchTerm={state.searchTerm}
                onSearchChange={handleSearch}
                onClearSearch={() => handleSearch('')}
              />
            </div>
            
            <CategoryFilter
              categories={state.categories}
              selectedCategory={state.selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {state.rateLimitError && (
          <RateLimitNotice onClose={handleClearRateLimit} />
        )}

        <ErrorBoundary error={state.error} onRetry={handleRetry}>
          {state.loading ? (
            <LoadingSpinner />
          ) : (
            <>
              {state.filteredPosts.length === 0 && !state.loading ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Search className="w-12 h-12 mx-auto mb-4" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
                  <p className="text-gray-600">
                    {state.searchTerm ? `No results for "${state.searchTerm}"` : 'No posts available'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {state.filteredPosts.map((post) => (
                    <PostCard
                      key={post.data.id}
                      post={post}
                      onClick={handlePostClick}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </ErrorBoundary>
      </main>

      {/* Post Modal */}
      <PostModal
        post={state.selectedPost}
        onClose={handleCloseModal}
        comments={comments}
        loadingComments={loadingComments}
      />

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-gray-600">
          <p>Built with React and Reddit JSON API • Designed for Programming Enthusiasts</p>
        </div>
      </footer>
    </div>
  );
}