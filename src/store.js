import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// 🔹 Slice AUTH pour gérer le token OAuth
const initialToken = localStorage.getItem('reddit_token') || null;

const authSlice = createSlice({
  name: 'auth',
  initialState: { token: initialToken },
  reducers: {
    setToken(state, action) {
      state.token = action.payload;
      localStorage.setItem('reddit_token', action.payload);
    },
    clearToken(state) {
      state.token = null;
      localStorage.removeItem('reddit_token');
    }
  }
});

export const { setToken, clearToken } = authSlice.actions;

// 🔹 Async thunk pour charger les posts depuis un subreddit
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (subreddit = 'popular', { getState }) => {
    const token = getState().auth.token; // ✅ On récupère le token depuis Redux
    const url = `https://oauth.reddit.com/r/${subreddit}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `bearer ${token}`,
        'User-Agent': 'web:myredditapp:v1.0 (by /u/TonPseudo)'
      }
    });

    if (!res.ok) {
      throw new Error(`Erreur API Reddit: ${res.status}`);
    }

    const json = await res.json();
    return json.data.children.map(c => c.data);
  }
);

// 🔹 Slice « posts »
const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
    subreddit: 'popular'
  },
  reducers: {
    setSubreddit(state, action) {
      state.subreddit = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export const { setSubreddit } = postsSlice.actions;

// 🔹 Création du store
export const store = configureStore({
  reducer: {
    posts: postsSlice.reducer,
    auth: authSlice.reducer // ✅ On ajoute auth ici
  }
});
