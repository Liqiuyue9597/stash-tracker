import imageCompression from 'browser-image-compression'
import { supabase } from '../lib/supabase'

export function useImageUpload() {
  const uploadImage = async (file: File, itemId: string): Promise<string | null> => {
    // 压缩图片到 ≤ 1MB
    const compressed = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
    })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const path = `${user.id}/${itemId}.jpg`

    const { error } = await supabase.storage
      .from('item-images')
      .upload(path, compressed, {
        contentType: 'image/jpeg',
        upsert: true,
      })

    if (error) {
      console.error('Image upload error:', error)
      return null
    }

    const { data } = supabase.storage
      .from('item-images')
      .getPublicUrl(path)

    return data.publicUrl
  }

  const deleteImage = async (itemId: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const path = `${user.id}/${itemId}.jpg`
    await supabase.storage.from('item-images').remove([path])
  }

  return { uploadImage, deleteImage }
}
