<script setup>
import { computed, ref } from 'vue'
import { experts } from '../data/experts'

const searchQuery = ref('')
const activeDomain = ref('全部')

const domainRules = [
  { name: '航空航天', terms: ['航空', '航天', '飞行器', '民航', '空中交通', '机载'] },
  { name: '先进动力', terms: ['动力', '发动机', '电动力', '燃料', '旋转叶片'] },
  { name: '智能制造', terms: ['智能制造', '智能加工', '柔性产线', '数字化车间', '装备制造', '数控', '机器人'] },
  { name: '检测计量', terms: ['测试', '检测', '计量', '测量', '检验', '评价', '试验'] },
  { name: '数字技术', terms: ['软件', 'MBSE', 'CAE', '人工智能', '大数据', '云计算', '工业软件', '信息化', '通信'] },
  { name: '材料工艺', terms: ['材料', '铝合金', '金属', '热处理', '磁性', '磁化', '机械加工', '非标零部件'] },
  { name: '能源交通', terms: ['能源', '零碳', '光储充', '汽车', '驱动轴', '交通', '无人机'] },
  { name: '产业治理', terms: ['经济学', '法学', '会计', '税务', '技术管理', '精益管理'] },
]

function textOf(expert) {
  return [expert.organization, expert.position, expert.research, expert.note].filter(Boolean).join(' ')
}

function inferDomains(expert) {
  const text = textOf(expert).toLowerCase()
  const matched = domainRules
    .filter(rule => rule.terms.some(term => text.includes(term.toLowerCase())))
    .map(rule => rule.name)

  return matched.length ? matched.slice(0, 3) : ['综合支撑']
}

const enrichedExperts = computed(() => experts.map(expert => ({
  ...expert,
  domains: inferDomains(expert),
  summary: expert.research || expert.position || '专家委员信息待补充',
})))

const domainFilters = computed(() => {
  const counts = new Map()
  for (const expert of enrichedExperts.value) {
    for (const domain of expert.domains) {
      counts.set(domain, (counts.get(domain) || 0) + 1)
    }
  }

  return [
    { name: '全部', count: enrichedExperts.value.length },
    ...domainRules.map(rule => ({ name: rule.name, count: counts.get(rule.name) || 0 })),
    { name: '综合支撑', count: counts.get('综合支撑') || 0 },
  ].filter(item => item.name === '全部' || item.count > 0)
})

const organizationCount = computed(() => new Set(experts.map(expert => expert.organization).filter(Boolean)).size)
const researchCount = computed(() => experts.filter(expert => expert.research).length)

const filteredExperts = computed(() => {
  let list = enrichedExperts.value

  if (activeDomain.value !== '全部') {
    list = list.filter(expert => expert.domains.includes(activeDomain.value))
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim().toLowerCase()
    list = list.filter(expert => [
      expert.name,
      expert.organization,
      expert.position,
      expert.research,
      ...expert.domains,
    ].filter(Boolean).join(' ').toLowerCase().includes(query))
  }

  return list
})
</script>

<template>
  <div class="experts-page">
    <section class="experts-hero">
      <div class="container experts-hero-inner">
        <span class="hero-kicker">Expert Committee</span>
        <h1>专家委员</h1>
        <p>汇聚航空航天、智能制造、检测计量、数字技术等领域专家，为联合实验室提供战略咨询、技术评审与产业协同支撑。</p>
        <div class="expert-stats">
          <div>
            <strong>{{ experts.length }}</strong>
            <span>专家委员</span>
          </div>
          <div>
            <strong>{{ organizationCount }}</strong>
            <span>来源单位</span>
          </div>
          <div>
            <strong>{{ researchCount }}</strong>
            <span>研究方向</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section experts-content">
      <div class="container">
        <div class="experts-toolbar">
          <div class="toolbar-copy">
            <span class="section-label">委员检索</span>
            <h2>按领域和姓名快速定位专家</h2>
            <p>数据来源：resource/专家委员会名单—2025.11.28更新.xlsx</p>
          </div>
          <div class="search-box">
            <svg class="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" stroke-width="2"/>
              <path d="M12.5 12.5L17 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <input v-model="searchQuery" type="search" placeholder="搜索姓名、单位、职务或研究方向" />
          </div>
        </div>

        <div class="domain-filter" aria-label="专家领域筛选">
          <button
            v-for="domain in domainFilters"
            :key="domain.name"
            :class="{ active: activeDomain === domain.name }"
            @click="activeDomain = domain.name"
          >
            <span>{{ domain.name }}</span>
            <strong>{{ domain.count }}</strong>
          </button>
        </div>

        <div class="results-line">
          <span>{{ filteredExperts.length }} 位专家委员</span>
          <button v-if="activeDomain !== '全部' || searchQuery" @click="activeDomain = '全部'; searchQuery = ''">
            清除筛选
          </button>
        </div>

        <div class="expert-grid" v-if="filteredExperts.length">
          <article class="expert-card" v-for="expert in filteredExperts" :key="expert.id">
            <div class="expert-topline">
              <span>No. {{ String(expert.id).padStart(2, '0') }}</span>
              <span v-if="expert.gender">{{ expert.gender }}</span>
            </div>
            <h3>{{ expert.name }}</h3>
            <p class="expert-org">{{ expert.organization }}</p>
            <p class="expert-position" v-if="expert.position">{{ expert.position }}</p>
            <p class="expert-summary">{{ expert.summary }}</p>
            <div class="expert-domains">
              <span v-for="domain in expert.domains" :key="domain">{{ domain }}</span>
            </div>
          </article>
        </div>

        <div class="empty" v-else>
          <p>没有匹配的专家委员</p>
          <button @click="activeDomain = '全部'; searchQuery = ''">清除筛选</button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.experts-hero {
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(180deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    var(--navy-deep);
  background-size: 44px 44px;
  padding: 128px 0 72px;
}

.experts-hero::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--gold), var(--blue));
}

.experts-hero-inner {
  max-width: 980px;
}

.hero-kicker {
  display: inline-block;
  color: var(--gold);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.experts-hero h1 {
  color: #fff;
  font-size: 52px;
  margin-bottom: 14px;
}

.experts-hero p {
  max-width: 760px;
  color: rgba(255, 255, 255, 0.58);
  font-size: 18px;
}

.expert-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 160px));
  gap: 14px;
  margin-top: 34px;
}

.expert-stats div {
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
}

.expert-stats strong {
  display: block;
  color: #fff;
  font-family: var(--number);
  font-size: 38px;
  line-height: 1;
}

.expert-stats span {
  display: block;
  color: rgba(255, 255, 255, 0.48);
  margin-top: 8px;
  font-size: 13px;
}

.experts-content {
  background: var(--bg-light);
}

.experts-toolbar {
  display: grid;
  grid-template-columns: 1fr minmax(320px, 440px);
  gap: 24px;
  align-items: end;
  margin-bottom: 26px;
}

.toolbar-copy h2 {
  margin-bottom: 8px;
}

.toolbar-copy p {
  color: #64748b;
  font-size: 14px;
}

.search-box {
  position: relative;
  color: #94a3b8;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.search-box input {
  width: 100%;
  min-height: 52px;
  border: 0;
  border-radius: 8px;
  padding: 0 18px 0 50px;
  color: var(--text-h);
  font: inherit;
  outline: none;
}

.search-box input:focus {
  box-shadow: 0 0 0 3px var(--accent-bg);
}

.search-icon {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
}

.domain-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 18px;
}

.domain-filter button {
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border: 1px solid rgba(37, 99, 235, 0.14);
  border-radius: 8px;
  background: rgba(37, 99, 235, 0.04);
  color: var(--blue);
  font-size: 14px;
  font-weight: 700;
  transition: background 0.2s, color 0.2s, transform 0.2s;
}

.domain-filter button:hover,
.domain-filter button.active {
  transform: translateY(-1px);
  background: var(--blue);
  color: #fff;
}

.domain-filter strong {
  color: var(--text-h);
  font-family: var(--number);
  font-size: 18px;
  line-height: 1;
}

.domain-filter button:hover strong,
.domain-filter button.active strong {
  color: #fff;
}

.results-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
  color: #64748b;
  font-size: 14px;
}

.results-line button,
.empty button {
  border: 0;
  background: transparent;
  color: var(--blue);
  font-weight: 700;
}

.expert-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 18px;
}

.expert-card {
  min-height: 330px;
  display: flex;
  flex-direction: column;
  padding: 24px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--white);
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}

.expert-card:hover {
  transform: translateY(-3px);
  border-color: rgba(37, 99, 235, 0.28);
  box-shadow: 0 16px 38px rgba(15, 29, 50, 0.1);
}

.expert-topline {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #94a3b8;
  font-family: var(--number);
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 14px;
}

.expert-card h3 {
  font-size: 24px;
  margin-bottom: 8px;
}

.expert-org {
  color: var(--gold);
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 12px;
}

.expert-position {
  color: var(--text-h);
  font-size: 14px;
  line-height: 1.65;
  margin-bottom: 12px;
}

.expert-summary {
  color: #64748b;
  font-size: 14px;
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.expert-domains {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 18px;
}

.expert-domains span {
  padding: 5px 9px;
  border-radius: 8px;
  background: rgba(200, 148, 62, 0.1);
  color: var(--gold);
  font-size: 12px;
  font-weight: 700;
}

.empty {
  padding: 64px 0;
  text-align: center;
  color: #94a3b8;
}

.empty p {
  margin-bottom: 12px;
}

@media (max-width: 860px) {
  .experts-toolbar {
    grid-template-columns: 1fr;
  }

  .expert-stats {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 640px) {
  .experts-hero {
    padding: 108px 0 52px;
  }

  .experts-hero h1 {
    font-size: 36px;
  }

  .expert-stats {
    grid-template-columns: 1fr;
  }

  .domain-filter button {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
