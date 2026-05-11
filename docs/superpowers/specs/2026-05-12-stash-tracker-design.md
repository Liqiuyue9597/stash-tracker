# Stash Tracker — 设计文档

**日期：** 2026-05-12  
**项目：** 个人囤货记录 App（PWA）

---

## 1. 项目目标

帮助用户记录家里囤了哪些物品，避免重复购买。核心场景：在家整理物品、盘点库存时查阅。

---

## 2. 平台与技术栈

**平台：** PWA（Progressive Web App）
- 部署为网页，通过 Safari「添加到主屏幕」后体验接近原生 App
- 无需苹果开发者账号
- 主要在 iOS 手机上使用

**前端：**
- React + TypeScript
- Vite 构建
- Tailwind CSS 样式
- PWA 配置（manifest + service worker，支持离线缓存基本 UI）
- `html5-qrcode` 扫条形码

**后端：** Supabase
- PostgreSQL 存物品数据
- Supabase Storage 存图片
- Supabase Auth 做登录（邮箱+密码）

**部署：** Vercel（免费，GitHub 连接自动部署）

---

## 3. 数据模型

### items 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| user_id | uuid | 关联 auth.users |
| name | text | 物品名称（必填） |
| image_url | text | Supabase Storage 图片 URL（可选） |
| quantity | numeric | 数量（必填） |
| purchased_at | date | 购买日期（可选） |
| price | numeric | 价格（可选） |
| category | text | 分类（可选，从预设列表选或自定义） |
| barcode | text | 条形码（可选，扫码录入时存储） |
| notes | text | 备注（可选） |
| created_at | timestamptz | 创建时间，自动填入 |
| updated_at | timestamptz | 更新时间，自动填入 |

### 预设分类

食品、饮料、日用品、清洁用品、个护美妆、药品保健、电子产品、文具办公、其他

---

## 4. 页面结构

底部 Tab 导航，共两个 Tab：**库存** 和 **分类**。

### 4.1 库存列表页（默认首页）

- 顶部搜索栏（按名称实时过滤）
- 物品卡片网格（每行 2 列），每张卡片显示：
  - 图片缩略图（无图则显示占位图标）
  - 名称
  - 数量
- 右下角浮动"+"按钮，点击弹出新增入口

### 4.2 分类页

- 列出所有分类，显示每个分类下的物品数量
- 点击分类展开该类下所有物品（同卡片样式）

### 4.3 物品详情页（从列表点入）

- 显示大图
- 所有字段展示（名称、数量、购买日期、价格、分类、备注）
- 顶部右上角「编辑」按钮
- 底部「删除」按钮（二次确认）

### 4.4 新增 / 编辑表单页

**新增时有两个入口：**
1. **扫条形码** — 调用摄像头扫码，自动查询商品信息填入表单
2. **手动填写** — 直接进入空白表单

**表单字段（按顺序）：**
1. 图片（拍照 / 从相册选，上传前在前端压缩到 ≤ 1MB）
2. 名称（文本输入，必填）
3. 分类（下拉选择，可自定义）
4. 数量（数字输入，必填，默认 1）
5. 价格（数字输入，可选）
6. 购买日期（日期选择，可选，默认今天）
7. 备注（多行文本，可选）

---

## 5. 条形码扫描功能

**流程：**
1. 用户点击"扫条形码"，调起摄像头
2. `html5-qrcode` 识别到条码后，关闭摄像头
3. 前端请求条码查询 API：
   - 优先查 **Open Food Facts API**（`https://world.openfoodfacts.org/api/v2/product/{barcode}`，免费无需注册，食品类）
   - 查不到时 fallback 到 **UPC Item DB API**（`https://api.upcitemdb.com/prod/trial/lookup?upc={barcode}`，有免费额度）
4. 查到则自动填入：名称、分类（根据商品类别映射）
5. 查不到则提示"未找到商品信息，请手动填写"，保留条码字段备用
6. 用户确认后正常保存

---

## 6. 图片处理

- 上传前在浏览器端用 `browser-image-compression` 库压缩至 ≤ 1MB
- 上传至 Supabase Storage，按 `{user_id}/{item_id}.jpg` 路径存储
- 数据库 `image_url` 字段存完整的公开访问 URL

---

## 7. 认证

- Supabase Auth，邮箱 + 密码登录
- 单用户使用，注册一次后长期保持登录态
- 所有数据操作均通过 Row Level Security（RLS）隔离到当前用户

---

## 8. 部署

- 代码托管在 GitHub
- Vercel 连接 GitHub 仓库，main 分支自动部署
- 环境变量：`VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`

---

## 9. 不在本期范围内

- 多用户 / 家庭共享
- 消耗记录 / 历史追踪
- 低库存提醒
- Android 版本
- 每件物品多张图片
