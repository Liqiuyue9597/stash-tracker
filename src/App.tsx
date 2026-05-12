import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { ItemsProvider } from './contexts/ItemsContext'
import LoginPage from './pages/LoginPage'
import BottomNav from './components/BottomNav'
import InventoryPage from './pages/InventoryPage'
import CategoriesPage from './pages/CategoriesPage'
import ItemDetailPage from './pages/ItemDetailPage'
import ItemFormPage from './pages/ItemFormPage'

function AuthenticatedApp() {
  return (
    <ItemsProvider>
      <div className="min-h-screen bg-gray-50 pb-16">
        <Routes>
          <Route path="/" element={<Navigate to="/inventory" replace />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/items/new" element={<ItemFormPage />} />
          <Route path="/items/:id" element={<ItemDetailPage />} />
          <Route path="/items/:id/edit" element={<ItemFormPage />} />
        </Routes>
        <BottomNav />
      </div>
    </ItemsProvider>
  )
}

export default function App() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">加载中...</p>
      </div>
    )
  }

  if (!session) return <LoginPage />

  return (
    <BrowserRouter>
      <AuthenticatedApp />
    </BrowserRouter>
  )
}
