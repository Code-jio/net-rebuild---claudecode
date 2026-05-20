<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { fetchCategories, fetchMembers } from '../api'
import MemberDiscovery from '../components/MemberDiscovery.vue'

const route = useRoute()
const members = ref([])
const categories = ref([])

const initialKeyword = computed(() => {
  const keyword = route.query.keyword
  return typeof keyword === 'string' ? keyword : ''
})

onMounted(async () => {
  const [memberData, categoryData] = await Promise.all([
    fetchMembers(),
    fetchCategories(),
  ])

  members.value = memberData ?? []
  categories.value = categoryData ?? []
})
</script>

<template>
  <div class="members-page">
    <section class="members-hero">
      <div class="container members-hero-inner">
        <span class="hero-kicker">Member Directory</span>
        <h1>成员单位</h1>
        <p>围绕高端装备制造的技术能力、产业场景和科研资源，快速定位可协作单位。</p>
      </div>
    </section>

    <section class="section members-content">
      <div class="container">
        <MemberDiscovery
          :members="members"
          :categories="categories"
          :initial-keyword="initialKeyword"
          title="成员单位能力索引"
          subtitle="先看特色关键词墙和分类结构，再进入单位画像卡片矩阵。"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.members-hero {
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(180deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    var(--navy-deep);
  background-size: 44px 44px;
  padding: 128px 0 68px;
}

.members-hero::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--blue), var(--gold));
}

.members-hero-inner {
  position: relative;
  z-index: 1;
  max-width: 920px;
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

.members-hero h1 {
  color: #fff;
  font-size: 52px;
  margin-bottom: 14px;
}

.members-hero p {
  max-width: 680px;
  color: rgba(255, 255, 255, 0.58);
  font-size: 18px;
}

.members-content {
  background: var(--bg-light);
}

@media (max-width: 640px) {
  .members-hero {
    padding: 108px 0 52px;
  }

  .members-hero h1 {
    font-size: 36px;
  }
}
</style>
