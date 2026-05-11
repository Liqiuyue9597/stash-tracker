import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { Item, NewItem, UpdateItem } from '../types/item'

export function useItems() {
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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

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
      item.id === id ? { ...item, ...updates } : item
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

  const getItem = (id: string): Item | undefined => {
    return items.find(item => item.id === id)
  }

  return { items, loading, error, fetchItems, addItem, updateItem, deleteItem, getItem }
}
