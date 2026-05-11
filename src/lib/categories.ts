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
