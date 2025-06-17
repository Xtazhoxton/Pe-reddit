// src/SidebarToggle.jsx
import React from 'react'
import { ChevronRight } from 'lucide-react'

export default function SidebarToggle({ onClick, isOpen }) {
  return (
    <button
      onClick={onClick}
      aria-label={isOpen ? 'Fermer menu' : 'Ouvrir menu'}
      className={`
        fixed left-0 top-1/2 transform -translate-y-1/2
        p-3 bg-[#00489A] text-white
        rounded-tr-lg rounded-br-lg
        shadow-lg
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00489A]
        hover:bg-[#003A7A]
        z-30
      `}
    >
      {/* On inverse la flèche selon l'état */}
      {isOpen
        ? <ChevronRight size={24} className="transform rotate-180" />
        : <ChevronRight size={24} />
      }
    </button>
  )
}
