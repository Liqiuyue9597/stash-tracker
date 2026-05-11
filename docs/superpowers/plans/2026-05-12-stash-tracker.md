# Stash Tracker 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个 PWA 个人囤货记录 App，支持图片、扫条形码录入，Supabase 做后端，Safari 可「添加到主屏幕」使用。

**Architecture:** React + TypeScript 单页应用，Supabase 提供 PostgreSQL 数据库、Storage 图片存储和 Auth 认证，Vite 构建 + PWA 配置，部署到 Vercel。路由使用 React Router，状态用 React 内置 hooks，不引入额外状态管理库。

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, React Router v6, Supabase JS SDK v2, html5-qrcode, browser-image-compression, vite-plugin-pwa

---

## 文件结构总览

```
stash-tracker/
├── public/
│   ├── icons/                    # PWA 图标（192x192, 512x512）
│   └── manifest.json             # PWA manifest（由 vite-plugin-pwa 生成）
├── src/
│   ├── main.tsx                  # 入口，挂载 React App
│   ├── App.tsx                   # 路由根组件，含底部 Tab 导航
│   ├── lib/
│   │   ├── supabase.ts           # Supabase client 初始化
│   │   ├── categories.ts         # 预设分类常量
│   │   └── barcode.ts            # 条形码 API 查询逻辑（Open Food Facts + UPC Item DB）
│   ├── types/
│   │   └── item.ts               # Item 类型定义
│   ├── hooks/
│   │   ├── useAuth.ts            # 认证状态 hook
│   │   ├── useItems.ts           # 物品 CRUD hook
│   │   └── useImageUpload.ts     # 图片压缩 + 上传 hook
│   ├── pages/
│   │   ├── LoginPage.tsx         # 登录页
│   │   ├── InventoryPage.tsx     # 库存列表页（含搜索）
│   │   ├── CategoriesPage.tsx    # 分类页
│   │   ├── ItemDetailPage.tsx    # 物品详情页
│   │   └── ItemFormPage.tsx      # 新增 / 编辑表单页
│   └── components/
│       ├── BottomNav.tsx         # 底部 Tab 导航
│       ├── ItemCard.tsx          # 物品卡片（列表用）
│       ├── AddItemModal.tsx      # 新增入口弹窗（扫码 / 手动）
│       ├── BarcodeScanner.tsx    # 条形码扫描组件
│       └── ImagePicker.tsx       # 图片拍照/选择组件
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Task 1: 项目初始化

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tailwind.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`（空壳）

- [ ] **Step 1: 初始化 Vite + React + TypeScript 项目**

```bash
cd /Users/elissali/github/stash-tracker
npm create vite@latest . -- --template react-ts
```

- [ ] **Step 2: 安装全部依赖**

```bash
npm install
npm install @supabase/supabase-js react-router-dom html5-qrcode browser-image-compression
npm install -D tailwindcss @tailwindcss/vite vite-plugin-pwa
```

- [ ] **Step 3: 配置 Tailwind**

将 `vite.config.ts` 替换为：

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Stash Tracker',
        short_name: 'Stash',
        description: '记录你的囤货',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
})
```

- [ ] **Step 4: 在 `src/index.css` 中添加 Tailwind 指令**

将 `src/index.css` 内容替换为：

```css
@import "tailwindcss";
```

- [ ] **Step 5: 创建 PWA 图标占位文件**

```bash
mkdir -p public/icons
# 用任意工具生成或放入 192x192 和 512x512 的 PNG 图标
# 临时可使用在线工具生成纯色占位图标
```

- [ ] **Step 6: 验证项目启动**

```bash
npm run dev
```

打开 http://localhost:5173，看到 Vite 默认页面即为成功。

- [ ] **Step 7: 清空默认内容，替换 `src/App.tsx`**

```typescript
export default function App() {
  return <div className="min-h-screen bg-gray-50">Stash Tracker</div>
}
```

- [ ] **Step 8: 提交**

```bash
git init
echo "node_modules\n.env\n.env.local\ndist\n.superpowers/" > .gitignore
git add .
git commit -m "feat: 初始化项目，配置 Vite + React + Tailwind + PWA"
```

---

## Task 2: Supabase 配置与数据库建表

**Files:**
- Create: `src/lib/supabase.ts`
- Create: `.env.local`（不提交）

- [ ] **Step 1: 在 Supabase Dashboard 创建项目**

访问 https://supabase.com，新建项目，记录：
- Project URL（格式：`https://xxxx.supabase.co`）
- Anon public key

- [ ] **Step 2: 创建 `.env.local` 文件**

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

- [ ] **Step 3: 创建 `src/lib/supabase.ts`**

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **Step 4: 在 Supabase Dashboard SQL Editor 建表**

运行以下 SQL：

```sql
-- 创建 items 表
create table public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  image_url text,
  quantity numeric not null default 1,
  purchased_at date,
  price numeric,
  category text,
  barcode text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 创建 updated_at 自动更新触发器
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger items_updated_at
  before update on public.items
  for each row execute function update_updated_at();

-- 开启 RLS
alter table public.items enable row level security;

-- RLS 策略：只能读写自己的数据
create policy "users can select own items"
  on public.items for select
  using (auth.uid() = user_id);

create policy "users can insert own items"
  on public.items for insert
  with check (auth.uid() = user_id);

create policy "users can update own items"
  on public.items for update
  using (auth.uid() = user_id);

create policy "users can delete own items"
  on public.items for delete
  using (auth.uid() = user_id);
```

- [ ] **Step 5: 在 Supabase Dashboard 创建 Storage bucket**

1. 进入 Storage 页面
2. 新建 bucket，名称：`item-images`
3. 设为 **Public**（方便直接用 URL 显示图片）
4. 在 Storage → Policies 添加策略：

```sql
-- 允许已登录用户上传到自己的目录
create policy "users can upload images"
  on storage.objects for insert
  with check (auth.uid()::text = (storage.foldername(name))[1]);

-- 允许公开读取
create policy "public can read images"
  on storage.objects for select
  using (bucket_id = 'item-images');

-- 允许用户删除自己的图片
create policy "users can delete own images"
  on storage.objects for delete
  using (auth.uid()::text = (storage.foldername(name))[1]);
```

- [ ] **Step 6: 提交**

```bash
git add src/lib/supabase.ts
git commit -m "feat: 添加 Supabase client 配置"
```

---

## Task 3: 类型定义与常量

**Files:**
- Create: `src/types/item.ts`
- Create: `src/lib/categories.ts`

- [ ] **Step 1: 创建 `src/types/item.ts`**

```typescript
export interface Item {
  id: string
  user_id: string
  name: string
  image_url: string | null
  quantity: number
  purchased_at: string | null  // ISO date string "YYYY-MM-DD"
  price: number | null
  category: string | null
  barcode: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type NewItem = Omit<Item, 'id' | 'user_id' | 'created_at' | 'updated_at'>

export type UpdateItem = Partial<NewItem>
```

- [ ] **Step 2: 创建 `src/lib/categories.ts`**

```typescript
export const PRESET_CATEGORIES = [
  '食品',
  '饮料',
  '日用品',
  '清洁用品',
  '个护美妆',
  '药品保健',
  '电子产品',
  '文具办公',
  '其他',
] as const

export type PresetCategory = typeof PRESET_CATEGORIES[number]
```

- [ ] **Step 3: 提交**

```bash
git add src/types/item.ts src/lib/categories.ts
git commit -m "feat: 添加 Item 类型定义和预设分类常量"
```

---

## Task 4: 认证 Hook 与登录页

**Files:**
- Create: `src/hooks/useAuth.ts`
- Create: `src/pages/LoginPage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: 创建 `src/hooks/useAuth.ts`**

```typescript
import { useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = () => supabase.auth.signOut()

  return { session, loading, signOut }
}
```

- [ ] **Step 2: 创建 `src/pages/LoginPage.tsx`**

```typescript
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })

    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Stash Tracker</h1>
        <p className="text-gray-500 text-sm mb-6">记录你的囤货清单</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="至少 6 位"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50"
          >
            {loading ? '处理中...' : isSignUp ? '注册' : '登录'}
          </button>
        </form>

        <button
          onClick={() => { setIsSignUp(!isSignUp); setError(null) }}
          className="mt-4 w-full text-center text-sm text-blue-500"
        >
          {isSignUp ? '已有账号？去登录' : '没有账号？去注册'}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: 更新 `src/App.tsx` 添加认证守卫**

```typescript
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
```

- [ ] **Step 4: 验证**

```bash
npm run dev
```

访问 http://localhost:5173，应看到登录页面。注册一个账号，登录后应看到"库存页（待实现）"文字。

- [ ] **Step 5: 提交**

```bash
git add src/hooks/useAuth.ts src/pages/LoginPage.tsx src/App.tsx
git commit -m "feat: 添加认证 hook 和登录/注册页"
```

---

## Task 5: 物品 CRUD Hook

**Files:**
- Create: `src/hooks/useItems.ts`

- [ ] **Step 1: 创建 `src/hooks/useItems.ts`**

```typescript
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
```

- [ ] **Step 2: 验证类型正确**

```bash
npm run build
```

应无类型错误。

- [ ] **Step 3: 提交**

```bash
git add src/hooks/useItems.ts
git commit -m "feat: 添加物品 CRUD hook"
```

---

## Task 6: 图片上传 Hook

**Files:**
- Create: `src/hooks/useImageUpload.ts`

- [ ] **Step 1: 创建 `src/hooks/useImageUpload.ts`**

```typescript
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
```

- [ ] **Step 2: 提交**

```bash
git add src/hooks/useImageUpload.ts
git commit -m "feat: 添加图片压缩上传 hook"
```

---

## Task 7: 条形码查询工具

**Files:**
- Create: `src/lib/barcode.ts`

- [ ] **Step 1: 创建 `src/lib/barcode.ts`**

```typescript
import { PRESET_CATEGORIES } from './categories'

export interface BarcodeResult {
  name: string
  category: string | null
}

// Open Food Facts 分类 → 预设分类映射
function mapFoodCategory(categories: string): string | null {
  const lower = categories.toLowerCase()
  if (lower.includes('beverage') || lower.includes('drink') || lower.includes('water')) return '饮料'
  if (lower.includes('food') || lower.includes('snack') || lower.includes('fruit') || lower.includes('vegetable')) return '食品'
  return '食品' // 默认食品类
}

async function lookupOpenFoodFacts(barcode: string): Promise<BarcodeResult | null> {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}?fields=product_name,product_name_zh,categories`,
      { signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) return null
    const data = await res.json()
    if (data.status !== 1 || !data.product) return null

    const name = data.product.product_name_zh || data.product.product_name
    if (!name) return null

    const category = data.product.categories
      ? mapFoodCategory(data.product.categories)
      : '食品'

    return { name, category }
  } catch {
    return null
  }
}

async function lookupUPCItemDB(barcode: string): Promise<BarcodeResult | null> {
  try {
    const res = await fetch(
      `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`,
      { signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) return null
    const data = await res.json()
    if (!data.items || data.items.length === 0) return null

    const item = data.items[0]
    const name = item.title
    if (!name) return null

    // UPC Item DB 分类简单映射
    const categoryStr = (item.category || '').toLowerCase()
    let category: string | null = null
    if (categoryStr.includes('food') || categoryStr.includes('grocery')) category = '食品'
    else if (categoryStr.includes('electronic')) category = '电子产品'
    else if (categoryStr.includes('health') || categoryStr.includes('beauty')) category = '个护美妆'
    else if (categoryStr.includes('office') || categoryStr.includes('stationery')) category = '文具办公'

    return { name, category }
  } catch {
    return null
  }
}

export async function lookupBarcode(barcode: string): Promise<BarcodeResult | null> {
  const result = await lookupOpenFoodFacts(barcode)
  if (result) return result
  return lookupUPCItemDB(barcode)
}
```

- [ ] **Step 2: 提交**

```bash
git add src/lib/barcode.ts
git commit -m "feat: 添加条形码查询工具（Open Food Facts + UPC Item DB fallback）"
```

---

## Task 8: 底部导航与布局

**Files:**
- Create: `src/components/BottomNav.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: 创建 `src/components/BottomNav.tsx`**

```typescript
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
```

- [ ] **Step 2: 更新 `src/App.tsx`，添加完整路由结构**

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import BottomNav from './components/BottomNav'
import InventoryPage from './pages/InventoryPage'
import CategoriesPage from './pages/CategoriesPage'
import ItemDetailPage from './pages/ItemDetailPage'
import ItemFormPage from './pages/ItemFormPage'

function AuthenticatedApp() {
  return (
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
```

- [ ] **Step 3: 创建页面占位文件**（后续 Task 会填充实现）

`src/pages/InventoryPage.tsx`:
```typescript
export default function InventoryPage() {
  return <div className="p-4">库存列表</div>
}
```

`src/pages/CategoriesPage.tsx`:
```typescript
export default function CategoriesPage() {
  return <div className="p-4">分类</div>
}
```

`src/pages/ItemDetailPage.tsx`:
```typescript
export default function ItemDetailPage() {
  return <div className="p-4">物品详情</div>
}
```

`src/pages/ItemFormPage.tsx`:
```typescript
export default function ItemFormPage() {
  return <div className="p-4">表单</div>
}
```

- [ ] **Step 4: 验证**

```bash
npm run dev
```

登录后应看到底部两个 Tab（库存、分类），点击可切换，URL 随之变化。

- [ ] **Step 5: 提交**

```bash
git add src/components/BottomNav.tsx src/App.tsx src/pages/
git commit -m "feat: 添加底部导航和路由结构"
```

---

## Task 9: 物品卡片组件 + 库存列表页

**Files:**
- Create: `src/components/ItemCard.tsx`
- Modify: `src/pages/InventoryPage.tsx`

- [ ] **Step 1: 创建 `src/components/ItemCard.tsx`**

```typescript
import { useNavigate } from 'react-router-dom'
import { Item } from '../types/item'

interface Props {
  item: Item
}

export default function ItemCard({ item }: Props) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/items/${item.id}`)}
      className="bg-white rounded-xl overflow-hidden shadow-sm active:scale-95 transition-transform cursor-pointer"
    >
      <div className="aspect-square bg-gray-100 flex items-center justify-center">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )}
      </div>
      <div className="p-2">
        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">数量：{item.quantity}</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 实现 `src/pages/InventoryPage.tsx`**

```typescript
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useItems } from '../hooks/useItems'
import ItemCard from '../components/ItemCard'
import AddItemModal from '../components/AddItemModal'

export default function InventoryPage() {
  const { items, loading } = useItems()
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const navigate = useNavigate()

  const filtered = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 顶部搜索栏 */}
      <div className="bg-white px-4 pt-4 pb-3 sticky top-0 z-10 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900 mb-3">我的囤货</h1>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索物品..."
            className="w-full bg-gray-100 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 物品网格 */}
      <div className="flex-1 p-4">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-gray-400 text-sm">加载中...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <p className="text-sm">{search ? '没有找到相关物品' : '还没有物品，点击 + 添加'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* 浮动 + 按钮 */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed right-4 bottom-20 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center text-2xl active:scale-95 transition-transform z-20"
      >
        +
      </button>

      {/* 新增入口弹窗 */}
      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onManual={() => { setShowAddModal(false); navigate('/items/new') }}
          onScanDone={(barcode, name, category) => {
            setShowAddModal(false)
            navigate('/items/new', { state: { barcode, name, category } })
          }}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 3: 提交**

```bash
git add src/components/ItemCard.tsx src/pages/InventoryPage.tsx
git commit -m "feat: 添加物品卡片组件和库存列表页"
```

---

## Task 10: 条形码扫描组件 + 新增入口弹窗

**Files:**
- Create: `src/components/BarcodeScanner.tsx`
- Create: `src/components/AddItemModal.tsx`

- [ ] **Step 1: 创建 `src/components/BarcodeScanner.tsx`**

```typescript
import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { lookupBarcode, BarcodeResult } from '../lib/barcode'

interface Props {
  onResult: (barcode: string, result: BarcodeResult | null) => void
  onCancel: () => void
}

export default function BarcodeScanner({ onResult, onCancel }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [scanning, setScanning] = useState(true)
  const [looking, setLooking] = useState(false)

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader')
    scannerRef.current = scanner

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 150 } },
      async (decodedText) => {
        if (!scanning) return
        setScanning(false)
        setLooking(true)
        await scanner.stop()
        const result = await lookupBarcode(decodedText)
        onResult(decodedText, result)
      },
      () => {} // ignore errors during scanning
    ).catch(console.error)

    return () => {
      scanner.stop().catch(() => {})
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-white text-lg font-medium">扫描条形码</h2>
        <button onClick={onCancel} className="text-white text-sm">取消</button>
      </div>

      <div className="flex-1 flex items-center justify-center">
        {looking ? (
          <p className="text-white text-sm">正在查询商品信息...</p>
        ) : (
          <div id="qr-reader" className="w-full max-w-sm" />
        )}
      </div>

      <p className="text-gray-400 text-xs text-center pb-8">将条形码对准框内</p>
    </div>
  )
}
```

- [ ] **Step 2: 创建 `src/components/AddItemModal.tsx`**

```typescript
import { useState } from 'react'
import BarcodeScanner from './BarcodeScanner'
import { BarcodeResult } from '../lib/barcode'

interface Props {
  onClose: () => void
  onManual: () => void
  onScanDone: (barcode: string, name: string | null, category: string | null) => void
}

export default function AddItemModal({ onClose, onManual, onScanDone }: Props) {
  const [showScanner, setShowScanner] = useState(false)

  if (showScanner) {
    return (
      <BarcodeScanner
        onCancel={() => setShowScanner(false)}
        onResult={(barcode, result) => {
          onScanDone(barcode, result?.name ?? null, result?.category ?? null)
        }}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="absolute bottom-16 left-4 right-4 bg-white rounded-2xl p-4 space-y-3"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-gray-900 text-center">添加物品</h3>

        <button
          onClick={() => setShowScanner(true)}
          className="w-full flex items-center gap-3 p-4 bg-blue-50 rounded-xl"
        >
          <span className="text-2xl">📷</span>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900">扫条形码</p>
            <p className="text-xs text-gray-400">自动识别商品信息</p>
          </div>
        </button>

        <button
          onClick={onManual}
          className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl"
        >
          <span className="text-2xl">✏️</span>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900">手动填写</p>
            <p className="text-xs text-gray-400">自己输入物品信息</p>
          </div>
        </button>

        <button onClick={onClose} className="w-full py-2 text-sm text-gray-400">取消</button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: 提交**

```bash
git add src/components/BarcodeScanner.tsx src/components/AddItemModal.tsx
git commit -m "feat: 添加条形码扫描组件和新增入口弹窗"
```

---

## Task 11: 图片选择组件

**Files:**
- Create: `src/components/ImagePicker.tsx`

- [ ] **Step 1: 创建 `src/components/ImagePicker.tsx`**

```typescript
import { useRef } from 'react'

interface Props {
  value: File | null
  previewUrl: string | null
  onChange: (file: File) => void
}

export default function ImagePicker({ value, previewUrl, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full aspect-video bg-gray-100 rounded-xl flex flex-col items-center justify-center overflow-hidden"
      >
        {previewUrl ? (
          <img src={previewUrl} alt="预览" className="w-full h-full object-cover" />
        ) : (
          <>
            <svg className="w-10 h-10 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm text-gray-400">拍照 / 从相册选择</p>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) onChange(file)
        }}
      />
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/components/ImagePicker.tsx
git commit -m "feat: 添加图片选择组件"
```

---

## Task 12: 新增 / 编辑表单页

**Files:**
- Modify: `src/pages/ItemFormPage.tsx`

- [ ] **Step 1: 实现 `src/pages/ItemFormPage.tsx`**

```typescript
import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useItems } from '../hooks/useItems'
import { useImageUpload } from '../hooks/useImageUpload'
import { PRESET_CATEGORIES } from '../lib/categories'
import ImagePicker from '../components/ImagePicker'
import { NewItem } from '../types/item'

export default function ItemFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const isEdit = !!id

  const { getItem, addItem, updateItem } = useItems()
  const { uploadImage } = useImageUpload()

  const existing = id ? getItem(id) : undefined
  const prefill = location.state as { barcode?: string; name?: string; category?: string } | null

  const [name, setName] = useState(existing?.name ?? prefill?.name ?? '')
  const [category, setCategory] = useState(existing?.category ?? prefill?.category ?? '')
  const [quantity, setQuantity] = useState(String(existing?.quantity ?? 1))
  const [price, setPrice] = useState(existing?.price != null ? String(existing.price) : '')
  const [purchasedAt, setPurchasedAt] = useState(
    existing?.purchased_at ?? new Date().toISOString().split('T')[0]
  )
  const [notes, setNotes] = useState(existing?.notes ?? '')
  const [barcode] = useState(existing?.barcode ?? prefill?.barcode ?? '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(existing?.image_url ?? null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImageChange = (file: File) => {
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('请输入物品名称'); return }
    if (!quantity || Number(quantity) <= 0) { setError('数量必须大于 0'); return }

    setSubmitting(true)
    setError(null)

    const itemData: NewItem = {
      name: name.trim(),
      category: category || null,
      quantity: Number(quantity),
      price: price ? Number(price) : null,
      purchased_at: purchasedAt || null,
      notes: notes.trim() || null,
      barcode: barcode || null,
      image_url: existing?.image_url ?? null,
    }

    if (isEdit && id) {
      const success = await updateItem(id, itemData)
      if (!success) { setError('保存失败，请重试'); setSubmitting(false); return }
      if (imageFile) {
        const url = await uploadImage(imageFile, id)
        if (url) await updateItem(id, { image_url: url })
      }
      navigate(`/items/${id}`)
    } else {
      const item = await addItem(itemData)
      if (!item) { setError('添加失败，请重试'); setSubmitting(false); return }
      if (imageFile) {
        const url = await uploadImage(imageFile, item.id)
        if (url) await updateItem(item.id, { image_url: url })
      }
      navigate('/inventory')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-4 py-4 border-b border-gray-100 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-900">{isEdit ? '编辑物品' : '添加物品'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <ImagePicker value={imageFile} previewUrl={previewUrl} onChange={handleImageChange} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">名称 *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="物品名称"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">请选择分类</option>
            {PRESET_CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">数量 *</label>
          <input
            type="number"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            min="0.1"
            step="any"
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">价格（元）</label>
          <input
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            min="0"
            step="0.01"
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="可选"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">购买日期</label>
          <input
            type="date"
            value={purchasedAt}
            onChange={e => setPurchasedAt(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="可选"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-500 text-white rounded-xl py-3 text-sm font-medium disabled:opacity-50"
        >
          {submitting ? '保存中...' : isEdit ? '保存修改' : '添加物品'}
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: 验证**

```bash
npm run dev
```

登录后点击 +，选择「手动填写」，填写表单并提交，库存列表应出现新物品。

- [ ] **Step 3: 提交**

```bash
git add src/pages/ItemFormPage.tsx
git commit -m "feat: 实现新增/编辑物品表单页"
```

---

## Task 13: 物品详情页

**Files:**
- Modify: `src/pages/ItemDetailPage.tsx`

- [ ] **Step 1: 实现 `src/pages/ItemDetailPage.tsx`**

```typescript
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useItems } from '../hooks/useItems'
import { useImageUpload } from '../hooks/useImageUpload'

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getItem, deleteItem } = useItems()
  const { deleteImage } = useImageUpload()
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const item = id ? getItem(id) : undefined

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">物品不存在</p>
      </div>
    )
  }

  const handleDelete = async () => {
    if (!id) return
    setDeleting(true)
    if (item.image_url) await deleteImage(id)
    const success = await deleteItem(id)
    if (success) navigate('/inventory')
    else setDeleting(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶栏 */}
      <div className="bg-white px-4 py-4 border-b border-gray-100 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-900 flex-1 text-center">{item.name}</h1>
        <button
          onClick={() => navigate(`/items/${id}/edit`)}
          className="text-blue-500 text-sm font-medium"
        >
          编辑
        </button>
      </div>

      {/* 图片 */}
      <div className="bg-white">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="w-full aspect-square object-cover" />
        ) : (
          <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
      </div>

      {/* 详情 */}
      <div className="p-4 space-y-3">
        <div className="bg-white rounded-xl p-4 space-y-3">
          {[
            { label: '名称', value: item.name },
            { label: '分类', value: item.category },
            { label: '数量', value: String(item.quantity) },
            { label: '价格', value: item.price != null ? `¥${item.price}` : null },
            { label: '购买日期', value: item.purchased_at },
            { label: '备注', value: item.notes },
          ].map(({ label, value }) =>
            value ? (
              <div key={label} className="flex justify-between items-start">
                <span className="text-sm text-gray-400">{label}</span>
                <span className="text-sm text-gray-900 text-right max-w-[60%]">{value}</span>
              </div>
            ) : null
          )}
        </div>

        {/* 删除按钮 */}
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full py-3 text-red-500 text-sm font-medium bg-white rounded-xl"
        >
          删除物品
        </button>
      </div>

      {/* 删除确认弹窗 */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowConfirm(false)} />
          <div className="relative bg-white w-full rounded-t-2xl p-6 space-y-4">
            <p className="text-center text-base font-medium text-gray-900">确认删除「{item.name}」？</p>
            <p className="text-center text-sm text-gray-400">删除后无法恢复</p>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-full py-3 bg-red-500 text-white rounded-xl text-sm font-medium disabled:opacity-50"
            >
              {deleting ? '删除中...' : '确认删除'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="w-full py-3 text-gray-500 text-sm"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/pages/ItemDetailPage.tsx
git commit -m "feat: 实现物品详情页（含删除确认）"
```

---

## Task 14: 分类页

**Files:**
- Modify: `src/pages/CategoriesPage.tsx`

- [ ] **Step 1: 实现 `src/pages/CategoriesPage.tsx`**

```typescript
import { useState } from 'react'
import { useItems } from '../hooks/useItems'
import ItemCard from '../components/ItemCard'

export default function CategoriesPage() {
  const { items, loading } = useItems()
  const [expanded, setExpanded] = useState<string | null>(null)

  // 按分类分组，null/undefined 归入"未分类"
  const grouped = items.reduce<Record<string, typeof items>>((acc, item) => {
    const cat = item.category ?? '未分类'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  const categories = Object.keys(grouped).sort((a, b) => {
    if (a === '未分类') return 1
    if (b === '未分类') return -1
    return a.localeCompare(b, 'zh')
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-4 py-4 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">分类</h1>
      </div>

      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-gray-400 text-sm">加载中...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-gray-400 text-sm">还没有物品</p>
          </div>
        ) : (
          categories.map(cat => (
            <div key={cat} className="bg-white rounded-xl overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === cat ? null : cat)}
                className="w-full flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{cat}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                    {grouped[cat].length}
                  </span>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${expanded === cat ? 'rotate-90' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {expanded === cat && (
                <div className="grid grid-cols-2 gap-3 p-3 pt-0">
                  {grouped[cat].map(item => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add src/pages/CategoriesPage.tsx
git commit -m "feat: 实现分类页（可折叠展开）"
```

---

## Task 15: 端到端验证 + 部署

**Files:**
- Modify: 无新文件，验证现有功能

- [ ] **Step 1: 完整功能验证**

```bash
npm run dev
```

依次测试：
1. 注册账号 → 登录
2. 手动添加一件物品（含图片）
3. 搜索刚添加的物品
4. 点入详情，验证所有字段显示
5. 编辑物品，修改数量后保存
6. 切换到分类页，验证分类显示
7. 删除物品，确认从列表消失
8. 扫条形码添加（需要实物条形码），验证自动填入名称

- [ ] **Step 2: 生产构建验证**

```bash
npm run build
npm run preview
```

访问 preview URL，重复步骤 1-7，确认无构建错误。

- [ ] **Step 3: 推送到 GitHub**

```bash
git remote add origin https://github.com/<your-username>/stash-tracker.git
git push -u origin main
```

- [ ] **Step 4: 部署到 Vercel**

1. 访问 https://vercel.com，用 GitHub 账号登录
2. 点击 "New Project"，选择 `stash-tracker` 仓库
3. Framework Preset 选 "Vite"
4. 在 Environment Variables 填入：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. 点击 Deploy，等待完成
6. 访问 Vercel 提供的域名，验证 App 正常运行

- [ ] **Step 5: iOS 添加到主屏幕测试**

1. 用 iPhone Safari 打开 Vercel 域名
2. 点底部分享按钮 → 「添加到主屏幕」
3. 验证图标出现，全屏打开时无 Safari 工具栏
4. 测试拍照上传功能（需授权摄像头）

- [ ] **Step 6: 最终提交**

```bash
git add .
git commit -m "feat: 完成 Stash Tracker MVP"
```
