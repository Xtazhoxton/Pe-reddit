// src/Sidebar.jsx
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setSubreddit, fetchPosts } from './store'

const SUBREDDITS = ['popular','programming','javascript','reactjs','webdev']

export default function Sidebar({ visible }) {
  const dispatch = useDispatch()
  const [icons, setIcons] = useState({})

  // Au montage, fetch des icônes
  useEffect(() => {
    SUBREDDITS.forEach(name => {
      fetch(`https://www.reddit.com/r/${name}/about.json`)
        .then(res => {
          if (!res.ok) throw new Error('404')
          return res.json()
        })
        .then(json => {
          const url = json.data.icon_img || json.data.community_icon || null
          setIcons(prev => ({ ...prev, [name]: url }))
        })
        .catch(() => {
          // placeholder éventuel
        })
    })
  }, [])

  if (!visible) return null

  return (
    <nav
      className="
        fixed left-0 top-0 h-full w-60
        bg-white shadow-lg
        border-r border-gray-200
        z-20
        flex flex-col pt-20
      "
    >
      <h2 className="px-4 mb-4 text-lg font-semibold text-gray-700">Subreddits</h2>
      <ul className="flex-1 overflow-auto">
        {SUBREDDITS.map(name => (
          <li key={name}>
            <button
              onClick={() => {
                dispatch(setSubreddit(name))
                dispatch(fetchPosts(name))
              }}
              className="
                w-full flex items-center gap-3
                px-4 py-2 hover:bg-gray-100 transition
              "
            >
              {icons[name]
                ? <img
                    src={icons[name]}
                    alt={`${name} logo`}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                : <div className="w-6 h-6 bg-gray-200 rounded-full" />
              }
              <span className="text-gray-800 font-medium">r/{name}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

