// src/App.jsx
import React, { useState } from 'react'
import { Provider } from 'react-redux'
import { store } from './store'
import SearchBar from './SearchBar'
import Feed from './Feed'
import Sidebar from './Sidebar'
import SidebarToggle from './SidebarToggle'

export default function App() {
  const [sidebarVisible, setSidebarVisible] = useState(false)

  return (
    <Provider store={store}>
      <div className="relative min-h-screen bg-gray-50">
        <SidebarToggle
          onClick={() => setSidebarVisible(v => !v)}
          isOpen={sidebarVisible}
        />
        <Sidebar visible={sidebarVisible} />

        <div className={`
            transition-margin duration-300
            ${sidebarVisible ? 'ml-60' : 'ml-0'}
            pt-4 px-4 lg:px-8
          `}
        >
          <header className="max-w-4xl mx-auto mb-6">
            <h1 className="text-2xl font-bold text-gray-900">RedditMinimal</h1>
            <SearchBar />
          </header>

          <main className="flex justify-center">
            <Feed />
          </main>
        </div>
      </div>
    </Provider>
  )
}
