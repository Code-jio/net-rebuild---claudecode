<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchMembers, fetchCategories, fetchHomeContent } from '../api'

const members = ref([])
const categories = ref([])
const keywordData = ref({ tech_tags: [], industry_tags: [] })
const activeCategory = ref(null)
const activeTechTags = ref(new Set())
const activeIndustryTags = ref(new Set())
const searchQuery = ref('')

onMounted(async () => {
  const [mData, cData, kData] = await Promise.all([
    fetchMembers(),
    fetchCategories(),
    fetchHomeContent().then(d => d?.keywords ?? {})
  ])
  members.value = (mData ?? []).map(m => ({
    ...m,
    tech_tags: parseTags(m.tech_tags),
    industry_tags: parseTags(m.industry_tags)
  }))
  categories.value = cData ?? []
  keywordData.value = {
    tech_tags: kData.tech_tags ?? [],
    industry_tags: kData.industry_tags ?? []
  }
})

function parseTags(tags) {
  if (!tags) return []
  if (Array.isArray(tags)) return tags
  if (typeof tags === 'string') {
    try { return JSON.parse(tags) } catch { return [] }
  }
  return []
}

function toggleTech(tag) {
  if (activeTechTags.value.has(tag)) {
    activeTechTags.value.delete(tag)
  } else {
    activeTechTags.value.add(tag)
  }
  activeTechTags.value = new Set(activeTechTags.value)
}

function toggleIndustry(tag) {
  if (activeIndustryTags.value.has(tag)) {
    activeIndustryTags.value.delete(tag)
  } else {
    activeIndustryTags.value.add(tag)
  }
  activeIndustryTags.value = new Set(activeIndustryTags.value)
}

const categoryLabel = computed(() => {
  if (activeCategory.value === null) return '全部'
  const cat = categories.value.find(c => c.id === activeCategory.value)
  return cat?.name ?? '全部'
})

const filteredMembers = computed(() => {
  let list = members.value
  if (activeCategory.value !== null) {
    list = list.filter(m => m.category_id === activeCategory.value)
  }
  if (activeTechTags.value.size) {
    list = list.filter(m => m.tech_tags.some(t => activeTechTags.value.has(t)))
  }
  if (activeIndustryTags.value.size) {
    list = list.filter(m => m.industry_tags.some(t => activeIndustryTags.value.has(t)))
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(m =>
      m.name?.toLowerCase().includes(q) ||
      m.intro?.toLowerCase().includes(q) ||
      m.contact?.toLowerCase().includes(q)
    )
  }
  return list
})

const allTechTags = computed(() => {
  const map = new Map()
  for (const m of members.value) {
    for (const t of m.tech_tags) {
      map.set(t, (map.get(t) || 0) + 1)
    }
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1])
})

const allIndustryTags = computed(() => {
  const map = new Map()
  for (const m of members.value) {
    for (const t of m.industry_tags) {
      map.set(t, (map.get(t) || 0) + 1)
    }
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1])
})

function tagFontSize(count) {
  const max = Math.max(...[...(allTechTags.value), ...(allIndustryTags.value)].map(([,c]) => c), 1)
  const min = 12
  const maxFont = 18
  return min + (count / max) * (maxFont - min)
}
</script>

<template>
  <div class="members-page">
    <section class="members-hero">
      <div class="container">
        <h1>成员单位</h1>
        <p>汇聚 40+ 优秀企业与研究机构，按技术能力和服务行业精准检索</p>
      </div>
    </section>

    <section class="section members-content">
      <div class="container">
        <!-- Search bar -->
        <div class="search-bar">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="8.5" cy="8.5" r="5.5" stroke="#94a3b8" stroke-width="2"/>
            <path d="M12.5 12.5L17 17" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <input v-model="searchQuery" type="text" placeholder="搜索单位名称、简介、联系人..." class="search-input" />
        </div>

        <!-- Category filter -->
        <div class="filter-row">
          <span class="filter-label">分类：</span>
          <div class="filter-chips">
            <button
              class="chip" :class="{ active: activeCategory === null }"
              @click="activeCategory = null"
            >全部</button>
            <button
              v-for="cat in categories" :key="cat.id"
              class="chip" :class="{ active: activeCategory === cat.id }"
              @click="activeCategory = activeCategory === cat.id ? null : cat.id"
            >{{ cat.name }}</button>
          </div>
        </div>

        <!-- Tag cloud -->
        <div class="tag-cloud-section" v-if="allTechTags.length || allIndustryTags.length">
          <div class="tag-group" v-if="allTechTags.length">
            <span class="tag-group-label">技术能力</span>
            <div class="tag-cloud">
              <button
                v-for="[tag, count] in allTechTags" :key="tag"
                class="tag-chip tag-chip-tech"
                :class="{ active: activeTechTags.has(tag) }"
                :style="{ fontSize: tagFontSize(count) + 'px' }"
                @click="toggleTech(tag)"
              >{{ tag }}<span class="tag-count">{{ count }}</span></button>
            </div>
          </div>
          <div class="tag-group" v-if="allIndustryTags.length">
            <span class="tag-group-label">服务行业</span>
            <div class="tag-cloud">
              <button
                v-for="[tag, count] in allIndustryTags" :key="tag"
                class="tag-chip tag-chip-industry"
                :class="{ active: activeIndustryTags.has(tag) }"
                :style="{ fontSize: tagFontSize(count) + 'px' }"
                @click="toggleIndustry(tag)"
              >{{ tag }}<span class="tag-count">{{ count }}</span></button>
            </div>
          </div>
        </div>

        <!-- Active filters summary -->
        <div class="active-filters" v-if="activeTechTags.size || activeIndustryTags.size || activeCategory !== null">
          <span class="filter-summary-label">当前筛选：</span>
          <span v-if="activeCategory !== null" class="active-filter-badge">
            {{ categoryLabel }} <button @click="activeCategory = null">&times;</button>
          </span>
          <span v-for="t in [...activeTechTags]" :key="'t-'+t" class="active-filter-badge badge-tech">
            {{ t }} <button @click="toggleTech(t)">&times;</button>
          </span>
          <span v-for="t in [...activeIndustryTags]" :key="'i-'+t" class="active-filter-badge badge-industry">
            {{ t }} <button @click="toggleIndustry(t)">&times;</button>
          </span>
          <button class="clear-all" @click="activeCategory = null; activeTechTags = new Set(); activeIndustryTags = new Set(); searchQuery = ''">
            清除全部
          </button>
        </div>

        <!-- Results -->
        <div class="results-count">{{ filteredMembers.length }} 家单位</div>
        <div class="members-grid" v-if="filteredMembers.length">
          <router-link
            :to="'/members/' + m.id"
            class="member-card"
            v-for="m in filteredMembers" :key="m.id"
          >
            <span class="member-category-badge">{{ categories.find(c => c.id === m.category_id)?.name ?? '' }}</span>
            <h3 class="member-name">{{ m.name }}</h3>
            <div class="member-tags" v-if="m.tech_tags.length || m.industry_tags.length">
              <span v-for="t in m.tech_tags" :key="'t-'+t" class="tag tag-tech">{{ t }}</span>
              <span v-for="t in m.industry_tags" :key="'i-'+t" class="tag tag-industry">{{ t }}</span>
            </div>
            <p class="member-intro">{{ m.intro }}</p>
            <span class="member-contact" v-if="m.contact">{{ m.contact }}</span>
          </router-link>
        </div>
        <div class="empty" v-else>
          <p>没有匹配的成员单位</p>
          <button class="clear-all" @click="activeCategory = null; activeTechTags = new Set(); activeIndustryTags = new Set(); searchQuery = ''">
            清除筛选条件
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ── Hero ── */
.members-hero {
  background: var(--navy-deep);
  padding: 120px 0 60px;
  text-align: center;
}
.members-hero h1 {
  color: #fff;
  margin-bottom: 12px;
}
.members-hero p {
  font-size: 17px;
  color: rgba(255, 255, 255, 0.45);
}

/* ── Search ── */
.search-bar {
  position: relative;
  margin-bottom: 32px;
}
.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}
.search-input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  font-size: 16px;
  font-family: var(--body);
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--white);
  color: var(--text-h);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.search-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-bg);
}
.search-input::placeholder {
  color: #94a3b8;
}

/* ── Filter row ── */
.filter-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}
.filter-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-h);
}
.filter-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.chip {
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--white);
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s;
}
.chip:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.chip.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

/* ── Tag cloud ── */
.tag-cloud-section {
  margin-bottom: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.tag-group {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.tag-group-label {
  font-size: 13px;
  font-weight: 600;
  color: #94a3b8;
  white-space: nowrap;
  padding-top: 4px;
  min-width: 56px;
}
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tag-chip {
  padding: 4px 12px;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  font-family: var(--body);
  font-weight: 500;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.tag-chip-tech {
  color: var(--blue);
  border-color: rgba(37, 99, 235, 0.15);
  background: rgba(37, 99, 235, 0.04);
}
.tag-chip-tech:hover,
.tag-chip-tech.active {
  background: rgba(37, 99, 235, 0.12);
  border-color: rgba(37, 99, 235, 0.3);
}
.tag-chip-tech.active {
  background: var(--blue);
  color: #fff;
}
.tag-chip-industry {
  color: var(--gold);
  border-color: rgba(200, 148, 62, 0.15);
  background: rgba(200, 148, 62, 0.04);
}
.tag-chip-industry:hover,
.tag-chip-industry.active {
  background: rgba(200, 148, 62, 0.12);
  border-color: rgba(200, 148, 62, 0.3);
}
.tag-chip-industry.active {
  background: var(--gold);
  color: #fff;
}
.tag-count {
  font-size: 0.7em;
  opacity: 0.6;
}

/* ── Active filters ── */
.active-filters {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: var(--bg-light);
  border-radius: 10px;
}
.filter-summary-label {
  font-size: 13px;
  color: #94a3b8;
  margin-right: 4px;
}
.active-filter-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 6px;
  background: var(--white);
  border: 1px solid var(--border);
  color: var(--text-h);
}
.active-filter-badge button {
  background: none;
  border: none;
  font-size: 16px;
  line-height: 1;
  color: #94a3b8;
  padding: 0;
  cursor: pointer;
}
.badge-tech { border-color: rgba(37, 99, 235, 0.2); color: var(--blue); }
.badge-industry { border-color: rgba(200, 148, 62, 0.2); color: var(--gold); }
.clear-all {
  background: none;
  border: none;
  font-size: 13px;
  color: var(--accent);
  cursor: pointer;
  margin-left: auto;
}

/* ── Results ── */
.results-count {
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 20px;
}
.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}
.member-card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 28px;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  display: flex;
  flex-direction: column;
}
.member-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
  border-color: var(--accent-border);
}
.member-category-badge {
  font-size: 12px;
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 8px;
}
.member-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-h);
  margin-bottom: 10px;
}
.member-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.member-intro {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 12px;
  flex: 1;
}
.member-contact {
  font-size: 13px;
  color: #94a3b8;
}
.empty {
  text-align: center;
  padding: 60px 0;
  color: #94a3b8;
}
.empty p {
  margin-bottom: 16px;
}
</style>
