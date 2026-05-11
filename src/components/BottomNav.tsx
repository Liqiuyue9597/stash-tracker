import { NavLink } from 'react-router-dom'

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex safe-area-inset-bottom">
      <NavLink
        to="/inventory"
        className={({ isActive }) =>
          `flex-1 flex flex-col items-center py-2 text-xs gap-1 ${isActive ? 'text-blue-500' : 'text-gray-400'}`
        }
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        库存
      </NavLink>
      <NavLink
        to="/categories"
        className={({ isActive }) =>
          `flex-1 flex flex-col items-center py-2 text-xs gap-1 ${isActive ? 'text-blue-500' : 'text-gray-400'}`
        }
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        分类
      </NavLink>
    </nav>
  )
}
