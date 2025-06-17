// src/Sidebar.jsx
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setSubreddit, fetchPosts } from './store'

const DEFAULT_SUBREDDITS = [
  'popular',
  'programming',
  'javascript',
  'reactjs',
  'webdev'
]

export default function Sidebar() {
  const dispatch = useDispatch()
  const [icons, setIcons] = useState({})

  useEffect(() => {
    // Pour chaque subreddit, on récupère son icône via about.json
    DEFAULT_SUBREDDITS.forEach((name) => {
      fetch(`https://www.reddit.com/r/${name}/about.json`)
        .then(res => {
          if (!res.ok) throw new Error(`404 for ${name}`)
          return res.json()
        })
        .then(({ data }) => {
          // community_icon contient souvent un SVG + url ; fallback sur icon_img
          const url = data.community_icon || data.icon_img || ''
          setIcons(prev => ({ ...prev, [name]: url.split('?')[0] }))
        })
        .catch(() => {
          // en cas d’erreur, on peut laisser vide ou un placeholder
          setIcons(prev => ({ ...prev, [name]: '' }))
        })
    })
  }, [])

  const handleClick = (sub) => {
    dispatch(setSubreddit(sub))
    dispatch(fetchPosts(sub))
  }

  return (
    <aside className="w-64 bg-white border-r h-screen p-4 sticky top-0">
      <h2 className="text-lg font-semibold mb-4">Subreddits</h2>
      <ul className="space-y-2">
        {DEFAULT_SUBREDDITS.map(name => (
          <li key={name}>
            <button
              onClick={() => handleClick(name)}
              className="flex items-center w-full px-3 py-2 hover:bg-gray-100 rounded transition"
            >
              {icons[name]
                ? <img
                    src={icons[name]}
                    alt={`${name} logo`}
                    className="w-6 h-6 rounded-full mr-3 flex-none"
                  />
                : <div className="w-6 h-6 bg-gray-200 rounded-full mr-3 flex-none" />
              }
              <span className="text-gray-800">r/{name}</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
