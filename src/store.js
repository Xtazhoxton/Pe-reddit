import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// 1) Async thunk pour charger les posts depuis un subreddit
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (subreddit = 'popular') => {
    const res = await fetch(`https://reddit-proxy-8.vercel.app/api/reddit?path=r/${subreddit}`);
    const json = await res.json();
    // on récupère juste la liste de posts (= data.children[].data)
    return json.data.children.map(c => c.data);
  }
);

// 2) Slice « posts »
const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    items: [],
    status: 'idle',    // 'idle' | 'loading' | 'succeeded' | 'failed'
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

// 3) Création du store
export const store = configureStore({
  reducer: {
    posts: postsSlice.reducer
  }
});