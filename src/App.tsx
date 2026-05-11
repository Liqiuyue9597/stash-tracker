import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'

export default function App() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">加载中...</p>
      </div>
    )
  }

  if (!session) {
    return <LoginPage />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/inventory" replace />} />
        <Route path="/inventory" element={<div>库存页（待实现）</div>} />
        <Route path="/categories" element={<div>分类页（待实现）</div>} />
        <Route path="/items/:id" element={<div>详情页（待实现）</div>} />
        <Route path="/items/new" element={<div>新增页（待实现）</div>} />
        <Route path="/items/:id/edit" element={<div>编辑页（待实现）</div>} />
      </Routes>
    </BrowserRouter>
  )
}
