export const FEATURE_KEYWORDS = [
  '低空经济',
  '航空航天',
  '先进动力',
  '智能制造',
  '测试验证',
  '磁性材料',
  '数字化设计',
  '检测认证',
  '新能源汽车',
  '计量测试',
  '氢能源',
  '精密制造',
  '轻量化材料',
  '成果转化',
]

export const KEYWORD_ALIASES = {
  低空经济: ['低空', '无人机', 'eVTOL', 'E-VTOL', '电动垂直', '立体交通'],
  航空航天: ['航空', '航天', '民航', '飞行器', '飞机', '空天'],
  先进动力: ['动力', '发动机', '涡轮', '电机', '燃料电池', '起发'],
  智能制造: ['智能制造', '智能装备', '自动化', '数控', '智慧', '产线'],
  测试验证: ['测试', '验证', '试验', '评价', '中试'],
  磁性材料: ['磁性', '磁场', '磁化', '磁组件'],
  数字化设计: ['数字化', 'MBSE', '模型系统', '正向设计', '仿真'],
  检测认证: ['检测', '认证', '检验', '标准化'],
  新能源汽车: ['新能源汽车', '新能源', '汽车', '驱动轴', '底盘'],
  计量测试: ['计量', '测量', '量具', '刃具'],
  氢能源: ['氢', '燃料电池'],
  精密制造: ['精密', '机床', '零件', '锻件', '加工'],
  轻量化材料: ['轻量化', '3D打印', '增材', '材料', '合金', '铜合金'],
  成果转化: ['成果转化', '产业化', '孵化', '技术服务', '推广'],
}

export const CATEGORY_PROFILES = {
  14: {
    name: '高校',
    description: '学科建设、人才培养、基础研究支撑',
    fallbackKeywords: ['航空航天', '人才培养', '基础研究'],
  },
  15: {
    name: '研究院',
    description: '科研平台、成果转化、技术服务支撑',
    fallbackKeywords: ['成果转化', '科研平台', '技术服务'],
  },
  16: {
    name: '企业',
    description: '产业场景、产品能力、工程化验证支撑',
    fallbackKeywords: ['智能制造', '产品能力', '工程验证'],
  },
}

const CATEGORY_ORDER = [14, 15, 16]

const CARD_KEYWORD_RULES = [
  ['eVTOL', ['evtol', 'e-vtol', '电动垂直']],
  ['起发一体化电机', ['起发一体']],
  ['3D打印', ['3d打印', '增材']],
  ['MBSE', ['mbse', '模型系统']],
  ['无人机', ['无人机']],
  ['燃料电池', ['燃料电池']],
  ['驱动轴', ['驱动轴']],
  ['磁场装备', ['磁场', '磁化']],
  ['计量测试', ['计量', '测量']],
]

function unique(values) {
  return [...new Set(values.filter(Boolean))]
}

function parseTags(tags) {
  if (!tags) return []
  if (Array.isArray(tags)) return tags.filter(Boolean)
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags)
      return Array.isArray(parsed) ? parsed.filter(Boolean) : []
    } catch {
      return tags.split(/[、,，/]/).map(tag => tag.trim()).filter(Boolean)
    }
  }
  return []
}

export function stripHtml(value = '') {
  return String(value)
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&mdash;/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
}

function getSearchText(raw, intro) {
  return [
    raw?.name,
    intro,
    raw?.content,
    raw?.identity,
    raw?.identity_text,
    raw?.category?.name,
  ].filter(Boolean).join(' ').toLowerCase()
}

function textMatchesAny(text, terms) {
  return terms.some(term => text.includes(String(term).toLowerCase()))
}

function inferWallKeywords(raw, intro) {
  const text = getSearchText(raw, intro)
  return FEATURE_KEYWORDS.filter(keyword => {
    const aliases = KEYWORD_ALIASES[keyword] ?? []
    return text.includes(keyword.toLowerCase()) || textMatchesAny(text, aliases)
  })
}

function inferCardKeywords(raw, intro) {
  const text = getSearchText(raw, intro)
  return CARD_KEYWORD_RULES
    .filter(([, aliases]) => textMatchesAny(text, aliases))
    .map(([label]) => label)
}

export function getCategoryName(categoryId, categories = []) {
  const id = Number(categoryId)
  return categories.find(category => Number(category.id) === id)?.name
    ?? CATEGORY_PROFILES[id]?.name
    ?? ''
}

export function normalizeWebsite(value) {
  if (!value || value === '/') return ''
  return /^https?:\/\//i.test(value) ? value : `https://${value}`
}

export function normalizeMember(raw = {}, categories = []) {
  const categoryId = Number(raw.category_id ?? raw.category?.id)
  const intro = stripHtml(raw.intro ?? raw.introduction ?? raw.summary ?? raw.content ?? '')
  const providedTechTags = parseTags(raw.tech_tags)
  const providedIndustryTags = parseTags(raw.industry_tags)
  const inferredWallKeywords = inferWallKeywords(raw, intro)
  const inferredCardKeywords = inferCardKeywords(raw, intro)
  const fallbackKeywords = CATEGORY_PROFILES[categoryId]?.fallbackKeywords ?? []
  const keywords = unique([...providedTechTags, ...providedIndustryTags, ...inferredWallKeywords])
  const featureKeywords = unique([
    ...inferredCardKeywords,
    ...keywords,
    ...fallbackKeywords,
  ]).slice(0, 3)

  return {
    ...raw,
    id: raw.id ?? raw.mid ?? raw.no ?? raw.member_id ?? raw.name,
    mid: raw.mid ?? raw.id,
    name: raw.name ?? '',
    category_id: categoryId,
    categoryName: raw.category?.name ?? getCategoryName(categoryId, categories),
    intro,
    contact: raw.contact ?? raw.contact_person ?? '',
    phone: raw.phone ?? '',
    email: raw.email && raw.email !== '/' ? raw.email : '',
    website: normalizeWebsite(raw.website),
    image: raw.image ?? raw.photo ?? '',
    content: raw.content ?? '',
    tech_tags: unique([...providedTechTags, ...inferredWallKeywords.filter(tag => !['航空航天', '新能源汽车', '氢能源'].includes(tag))]),
    industry_tags: unique([...providedIndustryTags, ...inferredWallKeywords.filter(tag => ['航空航天', '新能源汽车', '氢能源'].includes(tag))]),
    keywords: unique([...keywords, ...featureKeywords]),
    featureKeywords,
  }
}

export function normalizeCategories(categories = []) {
  const merged = CATEGORY_ORDER.map(id => ({
    id,
    name: CATEGORY_PROFILES[id].name,
    ...categories.find(category => Number(category.id) === id),
    description: CATEGORY_PROFILES[id].description,
  }))

  const extras = categories
    .filter(category => !CATEGORY_ORDER.includes(Number(category.id)))
    .map(category => ({ ...category, description: '' }))

  return [...merged, ...extras]
}

export function memberMatchesKeyword(member, keyword) {
  const aliases = KEYWORD_ALIASES[keyword] ?? []
  const text = [
    member.name,
    member.intro,
    member.content,
    member.categoryName,
    ...(member.keywords ?? []),
  ].filter(Boolean).join(' ').toLowerCase()

  return text.includes(keyword.toLowerCase()) || textMatchesAny(text, aliases)
}

export function getKeywordCounts(members = []) {
  return FEATURE_KEYWORDS.map(keyword => ({
    keyword,
    count: members.filter(member => memberMatchesKeyword(member, keyword)).length,
  }))
}
