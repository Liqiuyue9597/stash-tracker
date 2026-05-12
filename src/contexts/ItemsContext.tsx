import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { Item, NewItem, UpdateItem } from '../types/item'

interface ItemsContextValue {
  items: Item[]
  loading: boolean
  error: string | null
  fetchItems: () => Promise<void>
  addItem: (newItem: NewItem) => Promise<Item | null>
  updateItem: (id: string, updates: UpdateItem) => Promise<boolean>
  deleteItem: (id: string) => Promise<boolean>
  getItem: (id: string) => Item | undefined
}

const ItemsContext = createContext<ItemsContextValue | null>(null)

export function ItemsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setItems(data as Item[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const addItem = async (newItem: NewItem): Promise<Item | null> => {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      setError(authError?.message ?? 'Not authenticated')
      return null
    }

    const { data, error } = await supabase
      .from('items')
      .insert({ ...newItem, user_id: user.id })
      .select()
      .single()

    if (error) {
      setError(error.message)
      return null
    }

    const item = data as Item
    setItems(prev => [item, ...prev])
    return item
  }

  const updateItem = async (id: string, updates: UpdateItem): Promise<boolean> => {
    const { error } = await supabase
      .from('items')
      .update(updates)
      .eq('id', id)

    if (error) {
      setError(error.message)
      return false
    }

    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item
    ))
    return true
  }

  const deleteItem = async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id)

    if (error) {
      setError(error.message)
      return false
    }

    setItems(prev => prev.filter(item => item.id !== id))
    return true
  }

  const getItem = (id: string): Item | undefined =>
    items.find(item => item.id === id)

  return (
    <ItemsContext.Provider value={{ items, loading, error, fetchItems, addItem, updateItem, deleteItem, getItem }}>
      {children}
    </ItemsContext.Provider>
  )
}

export function useItemsContext(): ItemsContextValue {
  const ctx = useContext(ItemsContext)
  if (!ctx) throw new Error('useItemsContext must be used within ItemsProvider')
  return ctx
}
