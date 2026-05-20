<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { fetchMemberDetail, fetchMembers } from '../api'

const route = useRoute()
const member = ref(null)
const allMembers = ref([])
const loading = ref(true)

function parseTags(tags) {
  if (!tags) return []
  if (Array.isArray(tags)) return tags
  if (typeof tags === 'string') {
    try { return JSON.parse(tags) } catch { return [] }
  }
  return []
}

onMounted(async () => {
  loadMember()
  fetchMembers().then(d => { allMembers.value = (d ?? []).map(m => ({ ...m, tech_tags: parseTags(m.tech_tags), industry_tags: parseTags(m.industry_tags) })) })
})

watch(() => route.params.id, () => {
  loadMember()
  window.scrollTo(0, 0)
})

async function loadMember() {
  loading.value = true
  member.value = null
  const id = route.params.id
  const data = await fetchMemberDetail(id)
  member.value = {
    ...data,
    tech_tags: parseTags(data?.tech_tags),
    industry_tags: parseTags(data?.industry_tags)
  }
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
  const id = member.value?.category_id
  if (id === 16) return '企业'
  if (id === 15) return '研究院'
  if (id === 14) return '高校'
  return ''
})
</script>

<template>
  <div class="detail-page" v-if="!loading && member">
    <!-- Header -->
    <section class="detail-hero">
      <div class="container">
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
      </div>
    </section>

    <!-- Content -->
    <section class="section detail-content">
      <div class="container detail-layout">
        <!-- Main -->
        <div class="detail-main">
          <div class="detail-card" v-if="member.intro">
            <h2>单位简介</h2>
            <div class="detail-image" v-if="member.image">
              <img :src="member.image" :alt="member.name" />
            </div>
            <p class="detail-intro">{{ member.intro }}</p>
          </div>

          <div class="detail-card" v-if="member.content">
            <div class="detail-body" v-html="member.content"></div>
          </div>
        </div>

        <!-- Sidebar -->
        <aside class="detail-sidebar">
          <div class="detail-card info-card">
            <h3>联系信息</h3>
            <div class="info-grid">
              <div class="info-item" v-if="member.contact">
                <span class="info-label">联系人</span>
                <span class="info-value">{{ member.contact }}</span>
              </div>
              <div class="info-item" v-if="member.phone">
                <span class="info-label">电话</span>
                <span class="info-value">{{ member.phone }}</span>
              </div>
              <div class="info-item" v-if="member.email">
                <span class="info-label">邮箱</span>
                <a class="info-value" :href="'mailto:' + member.email">{{ member.email }}</a>
              </div>
              <div class="info-item" v-if="member.address">
                <span class="info-label">地址</span>
                <span class="info-value">{{ member.address }}</span>
              </div>
              <div class="info-item" v-if="member.website">
                <span class="info-label">网址</span>
                <a class="info-value" :href="member.website" target="_blank" rel="noopener">{{ member.website }}</a>
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
.detail-hero {
  background: var(--navy-deep);
  padding: 120px 0 48px;
  color: #fff;
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
  color: var(--accent);
  background: rgba(37, 99, 235, 0.15);
  padding: 4px 12px;
  border-radius: 6px;
  margin-bottom: 12px;
}
.detail-hero h1 {
  color: #fff;
  margin-bottom: 16px;
}

/* ── Tag large ── */
.tag-lg {
  font-size: 13px;
  padding: 6px 14px;
}

/* ── Layout ── */
.detail-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 40px;
  align-items: start;
}
.detail-card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 36px;
  margin-bottom: 24px;
}
.detail-card h2 {
  font-size: 22px;
  margin-bottom: 20px;
}
.detail-card h3 {
  margin-bottom: 16px;
}
.detail-image {
  margin-bottom: 24px;
  border-radius: 10px;
  overflow: hidden;
}
.detail-image img {
  width: 100%;
  object-fit: cover;
  max-height: 400px;
}
.detail-intro {
  font-size: 16px;
  line-height: 1.8;
  color: var(--text);
  white-space: pre-wrap;
}
.detail-body {
  font-size: 15px;
  line-height: 1.8;
  color: var(--text);
}

/* ── Info grid ── */
.info-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.info-label {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.info-value {
  font-size: 14px;
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
  border-radius: 14px;
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
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
  border-radius: 12px;
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
  .detail-layout {
    grid-template-columns: 1fr;
  }
  .prev-next {
    flex-direction: column;
  }
  .prev-next-link {
    max-width: 100%;
  }
}
</style>
