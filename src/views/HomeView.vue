<script setup>
import { ref, onMounted } from 'vue'
import { fetchBanners, fetchCategories, fetchHomeContent, fetchMembers } from '../api'
import MemberDiscovery from '../components/MemberDiscovery.vue'

const banners = ref([])
const services = ref([])
const subLabs = ref([])
const stats = ref([])
const members = ref([])
const categories = ref([])

onMounted(async () => {
  const [bData, hData, mData, cData] = await Promise.all([
    fetchBanners(),
    fetchHomeContent(),
    fetchMembers(),
    fetchCategories()
  ])
  banners.value = bData ?? []
  services.value = hData?.service?.list ?? []
  subLabs.value = hData?.laboratory?.list ?? []
  stats.value = hData?.stats ?? []
  members.value = mData ?? []
  categories.value = cData ?? []
})
</script>

<template>
  <div class="home">
    <!-- Hero -->
    <section id="lab" class="hero">
      <div class="hero-bg-pattern"></div>
      <div class="container hero-inner">
        <div class="hero-text">
          <div class="hero-badge">
            <span>国家级产业平台</span>
            <span class="badge-sep">·</span>
            <span>专业学术组织</span>
            <span class="badge-sep">·</span>
            <span>地方政府共建</span>
          </div>
          <h1 class="hero-title">
            高端装备制造<br /><span class="title-gradient">联合实验室</span>
          </h1>
          <p class="hero-desc">
            汇聚 40+ 成员单位、50+ 专家委员，覆盖航空航天、新能源汽车、高端装备等前沿领域，
            提供测试验证、技术交流、产业对接一站式服务。
          </p>
          <div class="hero-actions">
            <a href="#services" class="btn-primary" @click.prevent="document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })">
              探索业务模块
            </a>
            <router-link to="/members" class="btn-outline">寻找合作单位</router-link>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-geo-ring"></div>
          <div class="hero-geo-line"></div>
          <div class="hero-img-placeholder">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <rect x="12" y="20" width="56" height="48" rx="4" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
              <path d="M28 44l8-12 10 8 14-16" stroke="rgba(255,255,255,0.5)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="24" cy="32" r="4" fill="rgba(255,255,255,0.2)"/>
            </svg>
          </div>
        </div>
      </div>
      <div class="hero-cofounders">
        <div class="container cofounder-list">
          <span>工信部重点实验室</span>
          <span class="cofounder-sep">|</span>
          <span>中国航空学会</span>
          <span class="cofounder-sep">|</span>
          <span>宁波市江北区政府</span>
        </div>
      </div>
    </section>

    <!-- 产业服务 -->
    <section id="services" class="section section-light">
      <div class="container">
        <div class="section-header">
          <span class="section-label">产业服务</span>
          <h2>九大业务模块</h2>
          <p class="section-sub">覆盖测试验证、技术交流、产业对接全链条</p>
        </div>
        <div class="services-grid" v-if="services.length">
          <div class="service-card" v-for="s in services" :key="s.title">
            <div class="service-icon">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="8" fill="#2563eb" opacity="0.12"/>
                <circle cx="14" cy="14" r="5" stroke="#2563eb" stroke-width="2"/>
              </svg>
            </div>
            <h3>{{ s.title }}</h3>
            <p>{{ s.intro }}</p>
          </div>
        </div>
        <div class="services-grid" v-else>
          <div class="service-card" v-for="i in 9" :key="i">
            <div class="service-icon"><div class="icon-placeholder"></div></div>
            <h3 class="skeleton skeleton-text"></h3>
            <p class="skeleton skeleton-line"></p>
          </div>
        </div>
      </div>
    </section>

    <!-- 核心数据 -->
    <section class="section section-mid">
      <div class="container">
        <div class="stats-row" v-if="stats.length">
          <div class="stat-item" v-for="s in stats" :key="s.label">
            <span class="stat-number">{{ s.value }}</span>
            <span class="stat-label">{{ s.label }}</span>
          </div>
        </div>
        <div class="stats-row" v-else>
          <div class="stat-item">
            <span class="stat-number">40<span class="stat-suffix">+</span></span>
            <span class="stat-label">成员单位</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">50<span class="stat-suffix">+</span></span>
            <span class="stat-label">专家委员</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">3</span>
            <span class="stat-label">分实验室</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">2</span>
            <span class="stat-label">团体标准</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 分实验室 -->
    <section class="section section-light">
      <div class="container">
        <div class="section-header">
          <span class="section-label">分实验室</span>
          <h2>三大研究平台</h2>
          <p class="section-sub">聚焦前沿领域，构建协同创新网络</p>
        </div>
        <div class="sublabs-grid" v-if="subLabs.length">
          <div class="sublab-card" v-for="lab in subLabs" :key="lab.title">
            <div class="sublab-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="10" fill="#2563eb" opacity="0.1"/>
                <rect x="10" y="10" width="12" height="12" rx="3" stroke="#2563eb" stroke-width="2"/>
              </svg>
            </div>
            <h3>{{ lab.title }}</h3>
            <p class="sublab-founder">{{ lab.initiator }}</p>
            <p class="sublab-desc">{{ lab.intro }}</p>
          </div>
        </div>
        <div class="sublabs-grid" v-else>
          <div class="sublab-card" v-for="i in 3" :key="i">
            <div class="sublab-icon"><div class="icon-placeholder"></div></div>
            <h3 class="skeleton skeleton-text"></h3>
            <p class="skeleton skeleton-line"></p>
          </div>
        </div>
      </div>
    </section>

    <!-- 成员单位能力索引 -->
    <section class="section member-discovery-section">
      <div class="container">
        <MemberDiscovery
          :members="members"
          :categories="categories"
          title="成员单位能力地图"
          subtitle="以高频关键词呈现实验室成员特色，按高校、研究院、企业三类快速查看协作资源。"
          :limit="6"
          compact
        />
        <div class="members-more">
          <router-link to="/members" class="btn-gold">查看全部成员单位</router-link>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container footer-inner">
        <div class="footer-brand">
          <span class="footer-name">高端装备制造联合实验室</span>
          <span class="footer-sub">智能制造测试验证与评价工业和信息化部重点实验室</span>
        </div>
        <div class="footer-meta">
          <span>© 2026 高端装备制造联合实验室</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* ── Hero ── */
.hero {
  background: var(--navy-deep);
  color: var(--text-light);
  position: relative;
  overflow: hidden;
  padding: 120px 0 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  scroll-margin-top: 64px;
}
.hero-bg-pattern {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 80% 30%, rgba(37, 99, 235, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 20% 70%, rgba(200, 148, 62, 0.06) 0%, transparent 40%);
  pointer-events: none;
}
.hero-inner {
  display: flex;
  align-items: center;
  gap: 60px;
  flex: 1;
  position: relative;
  z-index: 1;
  padding-top: 40px;
  padding-bottom: 40px;
}
.hero-text {
  flex: 1;
}
.hero-badge {
  display: flex;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.5px;
  margin-bottom: 24px;
}
.badge-sep {
  opacity: 0.3;
}
.hero-title {
  font-size: 56px;
  font-weight: 900;
  color: #fff;
  line-height: 1.18;
  letter-spacing: -1px;
  margin-bottom: 24px;
}
.title-gradient {
  background: linear-gradient(135deg, #3b82f6 30%, #60a5fa 70%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-desc {
  font-size: 17px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.55);
  max-width: 520px;
  margin-bottom: 36px;
}
.hero-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.btn-primary {
  display: inline-flex;
  align-items: center;
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background: var(--blue);
  border-radius: 10px;
  text-decoration: none;
  transition: filter 0.2s, transform 0.2s;
}
.btn-primary:hover {
  filter: brightness(1.12);
  transform: translateY(-1px);
}
.btn-outline {
  display: inline-flex;
  align-items: center;
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  text-decoration: none;
  transition: border-color 0.2s, background 0.2s;
}
.btn-outline:hover {
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.04);
}
.hero-visual {
  flex: 0 0 420px;
  position: relative;
  height: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hero-geo-ring {
  position: absolute;
  width: 300px;
  height: 300px;
  border: 2px solid rgba(255, 255, 255, 0.06);
  border-radius: 50%;
}
.hero-geo-line {
  position: absolute;
  width: 200px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(200, 148, 62, 0.3), transparent);
  top: 50%;
}
.hero-img-placeholder {
  width: 240px;
  height: 240px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.02);
  position: relative;
  z-index: 1;
}
.hero-cofounders {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding: 20px 0;
}
.cofounder-list {
  display: flex;
  gap: 24px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.35);
  letter-spacing: 0.5px;
  justify-content: center;
}
.cofounder-sep {
  opacity: 0.2;
}

/* ── Section header ── */
.section-header {
  text-align: center;
  margin-bottom: 60px;
}
.section-sub {
  font-size: 17px;
  color: #94a3b8;
  margin-top: 8px;
}
.section-light .section-sub {
  color: #64748b;
}

#services {
  scroll-margin-top: 64px;
}

/* ── Services grid ── */
.services-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
.service-card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 36px 28px;
  transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
  position: relative;
  overflow: hidden;
}
.service-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 0;
  background: linear-gradient(180deg, var(--blue) 0%, transparent 100%);
  opacity: 0.1;
  transition: height 0.3s;
}
.service-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
  border-color: var(--accent-border);
}
.service-card:hover::before {
  height: 100%;
}
.service-icon {
  margin-bottom: 20px;
}
.service-card h3 {
  margin-bottom: 8px;
}
.service-card p {
  font-size: 14px;
  color: #64748b;
  line-height: 1.65;
}

/* ── Stats ── */
.stats-row {
  display: flex;
  justify-content: center;
  gap: 80px;
  text-align: center;
}
.stat-number {
  display: block;
  font-family: var(--number);
  font-size: 64px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
  margin-bottom: 8px;
}
.stat-suffix {
  color: var(--gold);
}
.stat-label {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 0.5px;
}

/* ── Sub-labs ── */
.sublabs-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
.sublab-card {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 36px 28px;
  transition: transform 0.3s, box-shadow 0.3s;
}
.sublab-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
}
.sublab-icon {
  margin-bottom: 20px;
}
.sublab-founder {
  font-size: 13px;
  color: var(--accent);
  margin-bottom: 8px;
  margin-top: 4px;
}
.sublab-desc {
  font-size: 14px;
  color: #64748b;
  line-height: 1.65;
  margin-bottom: 16px;
}
.sublab-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* ── Tags ── */
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

/* ── Member discovery ── */
.member-discovery-section {
  background: var(--bg-light);
}
.members-more {
  display: flex;
  justify-content: center;
  margin-top: 34px;
}
.btn-gold {
  display: inline-flex;
  align-items: center;
  padding: 14px 36px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background: var(--gold);
  border-radius: 10px;
  text-decoration: none;
  transition: filter 0.2s, transform 0.2s;
}
.btn-gold:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

/* ── Footer ── */
.footer {
  background: var(--navy-deep);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding: 40px 0;
}
.footer-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}
.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.footer-name {
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
}
.footer-sub {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.3);
}
.footer-meta {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.25);
}

/* ── Skeleton ── */
.skeleton {
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 6px;
}
.skeleton-text {
  height: 20px;
  width: 70%;
  margin-bottom: 8px;
}
.skeleton-line {
  height: 14px;
  width: 90%;
}
.icon-placeholder {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #e2e8f0;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (max-width: 1024px) {
  .hero-inner {
    flex-direction: column;
    text-align: center;
  }
  .hero-desc {
    max-width: 100%;
  }
  .hero-actions {
    justify-content: center;
  }
  .hero-visual {
    flex: 0 0 auto;
    width: 100%;
    height: 240px;
  }
  .hero-geo-ring {
    width: 200px;
    height: 200px;
  }
  .services-grid,
  .sublabs-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .stats-row {
    gap: 40px;
    flex-wrap: wrap;
  }
  .stat-number {
    font-size: 44px;
  }
}

@media (max-width: 640px) {
  .hero { min-height: auto; }
  .hero-title { font-size: 36px; }
  .services-grid,
  .sublabs-grid {
    grid-template-columns: 1fr;
  }
  .stats-row {
    gap: 24px;
  }
  .stat-number {
    font-size: 36px;
  }
}
</style>
