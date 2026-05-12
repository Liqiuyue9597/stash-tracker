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

// Open Barcode（覆盖中国国产商品 690-699 开头）
async function lookupOpenBarcode(barcode: string): Promise<BarcodeResult | null> {
  try {
    const res = await fetch(
      `https://openbarcode.org/api/v1/product/${barcode}`,
      { signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) return null
    const data = await res.json()
    const name = data.name || data.product_name
    if (!name) return null
    return { name, category: null }
  } catch {
    return null
  }
}

export async function lookupBarcode(barcode: string): Promise<BarcodeResult | null> {
  // 中国商品条形码（690-699 开头）优先走 OpenFoodFacts + OpenBarcode
  // 其他条形码走 UPCItemDB
  const isChinese = /^69\d/.test(barcode)

  if (isChinese) {
    const r1 = await lookupOpenFoodFacts(barcode)
    if (r1) return r1
    const r2 = await lookupOpenBarcode(barcode)
    if (r2) return r2
    return null
  }

  const r1 = await lookupOpenFoodFacts(barcode)
  if (r1) return r1
  return lookupUPCItemDB(barcode)
}
