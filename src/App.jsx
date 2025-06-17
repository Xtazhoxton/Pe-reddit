// src/App.jsx
import Sidebar from './Sidebar'
import SearchBar from './SearchBar'
import Feed from './Feed'
import { Provider } from 'react-redux'
import { store } from './store'

export default function App() {
  return (
    <Provider store={store}>
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <header className="bg-white shadow">
            <div className="max-w-4xl mx-auto p-4">
              <h1 className="text-2xl font-bold">RedditMinimal</h1>
            </div>
          </header>

          <SearchBar />
          <Feed />
        </div>
      </div>
    </Provider>
  )
}