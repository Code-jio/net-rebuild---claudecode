<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { fetchMemberDetail, fetchMembers } from '../api'
import { normalizeMember } from '../utils/memberProfile'

const route = useRoute()
const member = ref(null)
const allMembers = ref([])
const loading = ref(true)

onMounted(async () => {
  const [detailData, listData] = await Promise.all([
    loadMemberData(route.params.id),
    fetchMembers().then(d => (d ?? []).map(m => normalizeMember(m)))
  ])
  allMembers.value = listData
  applyMember(detailData)
})

watch(() => route.params.id, async (id) => {
  const detailData = await loadMemberData(id)
  applyMember(detailData)
  window.scrollTo(0, 0)
})

async function loadMemberData(id) {
  loading.value = true
  member.value = null
  return fetchMemberDetail(id)
}

function applyMember(data) {
  const info = data?.info ?? data
  if (!info) { loading.value = false; return }
  const normalized = normalizeMember(info)
  if (!normalized.intro && allMembers.value.length) {
    const lm = allMembers.value.find(m => m.id === normalized.id)
    if (lm?.intro) normalized.intro = lm.intro
  }
  member.value = normalized
  loading.value = false
}

const relatedMembers = computed(() => {
  if (!member.value || !allMembers.value.length) return []
  const mt = new Set([...(member.value.tech_tags || []), ...(member.value.industry_tags || [])])
  if (!mt.size) return []
  return allMembers.value
    .filter(m => m.id !== member.value.id)
    .map(m => {
      const allTags = [...(m.tech_tags || []), ...(m.industry_tags || [])]
      const overlap = allTags.filter(t => mt.has(t)).length
      return { ...m, overlap }
    })
    .filter(m => m.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, 4)
})

const memberIndex = computed(() => {
  if (!member.value || !allMembers.value.length) return -1
  return allMembers.value.findIndex(m => m.id === member.value.id)
})

const prevMember = computed(() => {
  if (memberIndex.value <= 0) return null
  return allMembers.value[memberIndex.value - 1]
})

const nextMember = computed(() => {
  if (memberIndex.value < 0 || memberIndex.value >= allMembers.value.length - 1) return null
  return allMembers.value[memberIndex.value + 1]
})

const categoryName = computed(() => {
  return member.value?.categoryName ?? ''
})

function cleanInfo(value) {
  if (!value || value === '/' || value === '无') return ''
  return String(value).trim()
}

const infoRows = computed(() => {
  if (!member.value) return []
  return [
    { label: '单位类型', value: categoryName.value },
    { label: '成员身份', value: cleanInfo(member.value.identity_text || member.value.identity) },
    { label: '成立时间', value: cleanInfo(member.value.established) },
    { label: '联系人', value: cleanInfo(member.value.contact) },
    { label: '电话', value: cleanInfo(member.value.phone) },
    { label: '邮箱', value: cleanInfo(member.value.email), href: member.value.email ? `mailto:${member.value.email}` : '' },
    { label: '地址', value: cleanInfo(member.value.address) },
    { label: '网址', value: cleanInfo(member.value.website), href: member.value.website },
  ].filter(row => row.value)
})

const hasFullContent = computed(() => Boolean(member.value?.content))
</script>

<template>
  <div class="detail-page" v-if="!loading && member">
    <!-- Header -->
    <section class="detail-hero">
      <div class="container detail-hero-grid" :class="{ 'no-media': !member.image }">
        <div class="detail-hero-copy">
          <div class="breadcrumb">
            <router-link to="/">首页</router-link>
            <span class="breadcrumb-sep">/</span>
            <router-link to="/members">成员单位</router-link>
            <span class="breadcrumb-sep">/</span>
            <span>{{ member.name }}</span>
          </div>
          <span class="detail-category-badge">{{ categoryName }}</span>
          <h1>{{ member.name }}</h1>
          <div class="detail-tags" v-if="member.tech_tags.length || member.industry_tags.length">
            <span v-for="t in member.tech_tags" :key="'t-'+t" class="tag tag-tech tag-lg">{{ t }}</span>
            <span v-for="t in member.industry_tags" :key="'i-'+t" class="tag tag-industry tag-lg">{{ t }}</span>
          </div>
          <!-- <div class="hero-meta" v-if="infoRows.length">
            <div v-for="row in infoRows.slice(0, 3)" :key="row.label">
              <span>{{ row.label }}</span>
              <strong>{{ row.value }}</strong>
            </div>
          </div> -->
        </div>
        <div class="detail-hero-media" v-if="member.image">
          <img :src="member.image" :alt="member.name" />
        </div>
      </div>
    </section>

    <!-- Content -->
    <section class="section detail-content">
      <div class="container detail-layout">
        <!-- Main -->
        <div class="detail-main">
          <article class="detail-article">
            <div class="article-heading">
              <h2 class="section-label">单位介绍</h2>
              <!-- <h2>完整信息</h2> -->
            </div>
            <div class="article-body" v-if="hasFullContent" v-html="member.content"></div>
            <p class="article-body article-text" v-else-if="member.intro">{{ member.intro }}</p>
          </article>
        </div>

        <!-- Sidebar -->
        <aside class="detail-sidebar">
          <div class="info-panel">
            <h3 class="section-label">单位档案</h3>
            <div class="info-grid">
              <div class="info-item" v-for="row in infoRows" :key="row.label">
                <span class="info-label">{{ row.label }}</span>
                <a v-if="row.href" class="info-value" :href="row.href" target="_blank" rel="noopener">{{ row.value }}</a>
                <span v-else class="info-value">{{ row.value }}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <!-- Related members -->
    <section class="section section-light" v-if="relatedMembers.length">
      <div class="container">
        <h2 class="related-title">相关成员单位</h2>
        <div class="related-grid">
          <router-link
            :to="'/members/' + m.id"
            class="member-card"
            v-for="m in relatedMembers" :key="m.id"
          >
            <span class="member-category-badge">{{ m.category_id === 16 ? '企业' : m.category_id === 15 ? '研究院' : '高校' }}</span>
            <h3 class="member-name">{{ m.name }}</h3>
            <div class="member-tags" v-if="m.tech_tags.length || m.industry_tags.length">
              <span v-for="t in m.tech_tags" :key="'t-'+t" class="tag tag-tech">{{ t }}</span>
              <span v-for="t in m.industry_tags" :key="'i-'+t" class="tag tag-industry">{{ t }}</span>
            </div>
            <p class="member-intro">{{ m.intro }}</p>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Prev/next -->
    <section class="section">
      <div class="container">
        <div class="prev-next" v-if="prevMember || nextMember">
          <router-link
            v-if="prevMember"
            :to="'/members/' + prevMember.id"
            class="prev-next-link"
          >
            <span class="prev-next-label">上一条</span>
            <span class="prev-next-name">{{ prevMember.name }}</span>
          </router-link>
          <div v-else></div>
          <router-link
            v-if="nextMember"
            :to="'/members/' + nextMember.id"
            class="prev-next-link prev-next-right"
          >
            <span class="prev-next-label">下一条</span>
            <span class="prev-next-name">{{ nextMember.name }}</span>
          </router-link>
        </div>
      </div>
    </section>
  </div>

  <div class="detail-page loading-state" v-else-if="loading">
    <section class="section">
      <div class="container" style="text-align:center;padding:120px 0">
        <p>加载中...</p>
      </div>
    </section>
  </div>

  <div class="detail-page" v-else>
    <section class="section">
      <div class="container" style="text-align:center;padding:120px 0">
        <p>未找到该成员单位</p>
        <router-link to="/members" class="btn-primary" style="margin-top:16px">返回成员列表</router-link>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ── Hero ── */
.detail-page {
  background: var(--bg-light);
}
.detail-hero {
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.045) 1px, transparent 1px),
    linear-gradient(180deg, rgba(255, 255, 255, 0.045) 1px, transparent 1px),
    var(--navy-deep);
  background-size: 48px 48px;
  padding: 116px 0 56px;
  color: #fff;
}
.detail-hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 430px);
  gap: 42px;
  align-items: end;
}
.detail-hero-grid.no-media {
  grid-template-columns: minmax(0, 1fr);
}
.detail-hero-grid.no-media .detail-hero-copy {
  max-width: 960px;
}
.detail-hero-copy {
  min-width: 0;
}
.breadcrumb {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.35);
  margin-bottom: 20px;
}
.breadcrumb a {
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
}
.breadcrumb a:hover {
  color: #fff;
}
.breadcrumb-sep {
  margin: 0 8px;
}
.detail-category-badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  background: rgba(200, 148, 62, 0.22);
  border: 1px solid rgba(200, 148, 62, 0.36);
  padding: 5px 12px;
  border-radius: 8px;
  margin-bottom: 14px;
}
.detail-hero h1 {
  color: #fff;
  margin-bottom: 16px;
  max-width: 860px;
}
.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.hero-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 30px;
}
.hero-meta div {
  min-width: 0;
  padding: 14px 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.045);
}
.hero-meta span {
  display: block;
  color: rgba(255, 255, 255, 0.45);
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 4px;
}
.hero-meta strong {
  display: block;
  color: rgba(255, 255, 255, 0.86);
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}
.detail-hero-media {
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.22);
}
.detail-hero-media img {
  display: block;
  width: 100%;
  max-height: 520px;
  object-fit: contain;
  background: rgba(255, 255, 255, 0.03);
}

/* ── Tag large ── */
.tag-lg {
  font-size: 13px;
  padding: 6px 14px;
}

/* ── Layout ── */
.detail-content {
  background: var(--bg-light);
}
.detail-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 28px;
  align-items: start;
}
.detail-article,
.info-panel {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 18px 44px rgba(15, 29, 50, 0.06);
}
.detail-article {
  padding: 42px 48px;
}
.article-heading {
  padding-bottom: 24px;
  margin-bottom: 28px;
  border-bottom: 1px solid var(--border);
}
.article-heading h2 {
  font-size: 28px;
}
.article-body {
  font-size: 17px;
  line-height: 2;
  color: var(--text);
  word-break: break-word;
}
.article-text {
  white-space: pre-wrap;
}
.article-body :deep(p) {
  margin: 0 0 22px;
}
.article-body :deep(p:last-child) {
  margin-bottom: 0;
}
.article-body :deep(ul),
.article-body :deep(ol) {
  margin: 18px 0 24px;
  padding-left: 1.4em;
}
.article-body :deep(li) {
  margin-bottom: 10px;
}
.article-body :deep(img) {
  display: block;
  width: auto;
  max-width: 100%;
  height: auto;
  margin: 24px 0;
  border-radius: 8px;
  border: 1px solid var(--border);
}

/* ── Info grid ── */
.detail-sidebar {
  position: sticky;
  top: 88px;
}
.info-panel {
  padding: 28px;
}
.info-panel h3 {
  margin-bottom: 22px;
}
.info-grid {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.info-item {
  padding: 15px 0;
  border-top: 1px solid var(--border);
}
.info-label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
  margin-bottom: 5px;
}
.info-value {
  display: block;
  font-size: 15px;
  line-height: 1.65;
  color: var(--text-h);
  word-break: break-all;
}
a.info-value {
  color: var(--accent);
}

/* ── Related ── */
.related-title {
  margin-bottom: 32px;
}
.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}
.member-card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 24px;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
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
}
.member-name {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-h);
  margin: 8px 0;
}
.member-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.member-intro {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
}

/* ── Tags (shared) ── */
.tag {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 6px;
  white-space: nowrap;
}
.tag-tech {
  color: var(--blue);
  background: rgba(37, 99, 235, 0.08);
}
.tag-industry {
  color: var(--gold);
  background: rgba(200, 148, 62, 0.1);
}

/* ── Prev/next ── */
.prev-next {
  display: flex;
  justify-content: space-between;
  gap: 24px;
}
.prev-next-link {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 20px 28px;
  border: 1px solid var(--border);
  border-radius: 8px;
  text-decoration: none;
  transition: border-color 0.2s, background 0.2s;
  flex: 1;
  max-width: 48%;
}
.prev-next-link:hover {
  border-color: var(--accent);
  background: var(--accent-bg);
}
.prev-next-right {
  text-align: right;
}
.prev-next-label {
  font-size: 12px;
  color: #94a3b8;
}
.prev-next-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-h);
}

@media (max-width: 768px) {
  .detail-hero {
    padding: 104px 0 42px;
  }
  .detail-hero-grid,
  .detail-layout {
    grid-template-columns: 1fr;
  }
  .hero-meta {
    grid-template-columns: 1fr;
  }
  .detail-article,
  .info-panel {
    padding: 24px;
  }
  .detail-sidebar {
    position: static;
  }
  .prev-next {
    flex-direction: column;
  }
  .prev-next-link {
    max-width: 100%;
  }
}
</style>
