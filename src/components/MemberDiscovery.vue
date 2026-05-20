<script setup>
import { computed, ref, watch } from 'vue'
import {
  FEATURE_KEYWORDS,
  getKeywordCounts,
  memberMatchesKeyword,
  normalizeCategories,
  normalizeMember,
} from '../utils/memberProfile'

const props = defineProps({
  members: { type: Array, default: () => [] },
  categories: { type: Array, default: () => [] },
  title: { type: String, default: '成员单位能力地图' },
  subtitle: { type: String, default: '以特色关键词和组织类型快速定位合作单位' },
  limit: { type: Number, default: 0 },
  initialKeyword: { type: String, default: '' },
  compact: { type: Boolean, default: false },
  showSearch: { type: Boolean, default: true },
})

const activeCategory = ref(null)
const activeKeywords = ref(new Set())
const searchQuery = ref('')

watch(
  () => props.initialKeyword,
  keyword => {
    if (keyword && FEATURE_KEYWORDS.includes(keyword)) {
      activeKeywords.value = new Set([keyword])
    }
  },
  { immediate: true }
)

const normalizedCategories = computed(() => normalizeCategories(props.categories))
const normalizedMembers = computed(() => props.members.map(member => normalizeMember(member, normalizedCategories.value)))
const keywordWall = computed(() => getKeywordCounts(normalizedMembers.value))

const categoryCards = computed(() => normalizedCategories.value.map(category => ({
  ...category,
  count: normalizedMembers.value.filter(member => Number(member.category_id) === Number(category.id)).length,
})))

const filteredMembers = computed(() => {
  let list = normalizedMembers.value

  if (activeCategory.value !== null) {
    list = list.filter(member => Number(member.category_id) === Number(activeCategory.value))
  }

  if (activeKeywords.value.size) {
    const selected = [...activeKeywords.value]
    list = list.filter(member => selected.some(keyword => memberMatchesKeyword(member, keyword)))
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim().toLowerCase()
    list = list.filter(member => [
      member.name,
      member.intro,
      member.contact,
      member.categoryName,
      ...(member.keywords ?? []),
    ].filter(Boolean).join(' ').toLowerCase().includes(query))
  }

  return list
})

const visibleMembers = computed(() => {
  if (!props.limit) return filteredMembers.value
  return filteredMembers.value.slice(0, props.limit)
})

const hasActiveFilters = computed(() => activeCategory.value !== null || activeKeywords.value.size || searchQuery.value.trim())

function toggleKeyword(keyword) {
  const next = new Set(activeKeywords.value)
  if (next.has(keyword)) {
    next.delete(keyword)
  } else {
    next.add(keyword)
  }
  activeKeywords.value = next
}

function selectCategory(id) {
  activeCategory.value = activeCategory.value === id ? null : id
}

function clearFilters() {
  activeCategory.value = null
  activeKeywords.value = new Set()
  searchQuery.value = ''
}
</script>

<template>
  <div class="member-discovery" :class="{ compact }">
    <div class="module-heading">
      <span class="section-label">Member Network</span>
      <h2>{{ title }}</h2>
      <p>{{ subtitle }}</p>
    </div>

    <div class="filter-stage">
      <section class="keyword-wall" aria-labelledby="keyword-wall-title">
        <div class="stage-head">
          <div>
            <span class="stage-kicker">特色关键词墙</span>
            <h3 id="keyword-wall-title">按能力标签发现成员单位</h3>
          </div>
          <span class="stage-count">{{ filteredMembers.length }} 家匹配</span>
        </div>
        <div class="keyword-grid">
          <button
            v-for="item in keywordWall"
            :key="item.keyword"
            class="keyword-pill"
            :class="{ active: activeKeywords.has(item.keyword) }"
            :disabled="item.count === 0"
            @click="toggleKeyword(item.keyword)"
          >
            <span>{{ item.keyword }}</span>
            <strong>{{ item.count }}</strong>
          </button>
        </div>
      </section>

      <section class="category-stage" aria-labelledby="category-stage-title">
        <div class="stage-head">
          <div>
            <span class="stage-kicker">成员单位分类</span>
            <h3 id="category-stage-title">按协作角色查看资源结构</h3>
          </div>
          <button class="reset-button" v-if="hasActiveFilters" @click="clearFilters">清除筛选</button>
        </div>
        <div class="category-grid">
          <button
            v-for="category in categoryCards"
            :key="category.id"
            class="category-card"
            :class="{ active: activeCategory === category.id }"
            @click="selectCategory(category.id)"
          >
            <span class="category-name">{{ category.name }}</span>
            <strong>{{ category.count }}</strong>
            <p>{{ category.description }}</p>
          </button>
        </div>
      </section>

      <div class="search-row" v-if="showSearch">
        <svg class="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" stroke-width="2"/>
          <path d="M12.5 12.5L17 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <input v-model="searchQuery" type="search" placeholder="搜索单位名称、能力关键词或联系人" />
      </div>
    </div>

    <div class="active-strip" v-if="hasActiveFilters">
      <span>当前筛选</span>
      <button v-if="activeCategory !== null" @click="activeCategory = null">
        {{ categoryCards.find(category => category.id === activeCategory)?.name }}
      </button>
      <button v-for="keyword in [...activeKeywords]" :key="keyword" @click="toggleKeyword(keyword)">
        {{ keyword }}
      </button>
    </div>

    <div class="cards-head">
      <div>
        <span class="stage-kicker">成员单位卡片矩阵</span>
        <h3>单位画像卡片</h3>
      </div>
      <span>{{ filteredMembers.length }} 家单位</span>
    </div>

    <div class="portrait-grid" v-if="visibleMembers.length">
      <article class="portrait-card" v-for="member in visibleMembers" :key="member.id">
        <div class="portrait-meta">
          <span>{{ member.categoryName }}</span>
          <span v-if="member.website">官网可达</span>
        </div>
        <h3>{{ member.name }}</h3>
        <div class="portrait-keywords">
          <span v-for="keyword in member.featureKeywords" :key="keyword">{{ keyword }}</span>
        </div>
        <p>{{ member.intro }}</p>
        <div class="portrait-actions">
          <a v-if="member.website" :href="member.website" target="_blank" rel="noopener">官网入口</a>
          <router-link :to="'/members/' + member.id">查看详情</router-link>
        </div>
      </article>
    </div>

    <div class="empty" v-else>
      <p>没有匹配的成员单位</p>
      <button class="reset-button" @click="clearFilters">清除筛选</button>
    </div>
  </div>
</template>

<style scoped>
.member-discovery {
  color: var(--text);
}

.module-heading {
  max-width: 720px;
  margin-bottom: 36px;
}

.module-heading h2 {
  margin-bottom: 10px;
}

.module-heading p {
  color: #64748b;
  font-size: 17px;
}

.filter-stage {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
  gap: 20px;
  align-items: stretch;
}

.keyword-wall,
.category-stage,
.search-row,
.active-strip,
.portrait-card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.keyword-wall,
.category-stage {
  padding: 24px;
}

.stage-head,
.cards-head,
.portrait-meta,
.portrait-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.stage-kicker {
  display: block;
  color: var(--gold);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.stage-head h3,
.cards-head h3 {
  font-size: 20px;
}

.stage-count,
.cards-head > span {
  color: #64748b;
  font-size: 14px;
  white-space: nowrap;
}

.keyword-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 22px;
}

.keyword-pill {
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px;
  border: 1px solid rgba(37, 99, 235, 0.14);
  border-radius: 8px;
  background: rgba(37, 99, 235, 0.04);
  color: var(--blue);
  font-size: 15px;
  font-weight: 600;
  transition: transform 0.2s, border-color 0.2s, background 0.2s, color 0.2s;
}

.keyword-pill strong {
  min-width: 24px;
  color: #0f172a;
  font-family: var(--number);
  font-size: 18px;
  line-height: 1;
}

.keyword-pill:hover:not(:disabled),
.keyword-pill.active {
  transform: translateY(-1px);
  background: var(--blue);
  border-color: var(--blue);
  color: #fff;
}

.keyword-pill.active strong,
.keyword-pill:hover:not(:disabled) strong {
  color: #fff;
}

.keyword-pill:disabled {
  opacity: 0.42;
  cursor: not-allowed;
}

.category-grid {
  display: grid;
  gap: 10px;
  margin-top: 22px;
}

.category-card {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 4px 14px;
  padding: 16px;
  text-align: left;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #fbfdff;
  color: inherit;
  transition: transform 0.2s, border-color 0.2s, background 0.2s;
}

.category-card:hover,
.category-card.active {
  transform: translateY(-1px);
  border-color: rgba(200, 148, 62, 0.45);
  background: rgba(200, 148, 62, 0.08);
}

.category-name {
  color: var(--text-h);
  font-weight: 700;
}

.category-card strong {
  color: var(--gold);
  font-family: var(--number);
  font-size: 28px;
  line-height: 1;
}

.category-card p {
  grid-column: 1 / -1;
  color: #64748b;
  font-size: 13px;
}

.search-row {
  grid-column: 1 / -1;
  position: relative;
  color: #94a3b8;
}

.search-row input {
  width: 100%;
  min-height: 52px;
  border: 0;
  border-radius: 8px;
  padding: 0 18px 0 50px;
  color: var(--text-h);
  font: inherit;
  outline: none;
}

.search-row input:focus {
  box-shadow: 0 0 0 3px var(--accent-bg);
}

.search-icon {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
}

.reset-button {
  border: 0;
  background: transparent;
  color: var(--blue);
  font-size: 13px;
  font-weight: 600;
}

.active-strip {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
  padding: 12px 14px;
}

.active-strip span {
  color: #94a3b8;
  font-size: 13px;
}

.active-strip button {
  border: 1px solid rgba(37, 99, 235, 0.18);
  border-radius: 8px;
  background: rgba(37, 99, 235, 0.06);
  color: var(--blue);
  font-size: 13px;
  font-weight: 600;
  padding: 5px 10px;
}

.cards-head {
  margin: 40px 0 18px;
}

.portrait-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 18px;
}

.portrait-card {
  min-height: 300px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}

.portrait-card:hover {
  transform: translateY(-3px);
  border-color: var(--accent-border);
  box-shadow: 0 16px 38px rgba(15, 29, 50, 0.1);
}

.portrait-meta {
  margin-bottom: 14px;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 700;
}

.portrait-meta span:first-child {
  color: var(--gold);
}

.portrait-card h3 {
  min-height: 54px;
  margin-bottom: 14px;
  font-size: 19px;
}

.portrait-keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-bottom: 14px;
}

.portrait-keywords span {
  padding: 5px 9px;
  border-radius: 8px;
  background: rgba(37, 99, 235, 0.08);
  color: var(--blue);
  font-size: 12px;
  font-weight: 700;
}

.portrait-card p {
  color: #64748b;
  font-size: 14px;
  line-height: 1.75;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.portrait-actions {
  margin-top: 20px;
}

.portrait-actions a {
  min-height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
}

.portrait-actions a:first-child {
  color: #64748b;
}

.portrait-actions a:last-child {
  margin-left: auto;
  padding: 0 14px;
  background: var(--navy-mid);
  color: #fff;
}

.empty {
  padding: 52px 0;
  text-align: center;
  color: #94a3b8;
}

.empty p {
  margin-bottom: 14px;
}

.compact .module-heading {
  text-align: center;
  margin-left: auto;
  margin-right: auto;
}

.compact .portrait-grid {
  grid-template-columns: repeat(3, 1fr);
}

@media (max-width: 960px) {
  .filter-stage,
  .compact .portrait-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .module-heading {
    margin-bottom: 24px;
  }

  .keyword-wall,
  .category-stage,
  .portrait-card {
    padding: 18px;
  }

  .stage-head,
  .cards-head {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }

  .keyword-pill {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
