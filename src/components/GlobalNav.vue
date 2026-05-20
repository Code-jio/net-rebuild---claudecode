<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const isHome = computed(() => route.name === 'Home')

function scrollToSection(id) {
  if (route.name !== 'Home') {
    router.push({ name: 'Home' }).then(() => {
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 100)
    })
  } else {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<template>
  <header class="global-nav" :class="{ 'nav-dark': isHome }">
    <div class="nav-inner">
      <a href="/" class="nav-logo">高端装备制造联合实验室</a>
      <nav class="nav-links">
        <a href="/" class="nav-link" :class="{ active: isHome }">首页</a>
        <button class="nav-link" @click="scrollToSection('services')">产业服务</button>
        <router-link to="/members" class="nav-link" :class="{ active: route.path.startsWith('/members') }">
          成员单位
        </router-link>
      </nav>
      <a href="/members" class="nav-cta">寻找合作单位</a>
    </div>
  </header>
</template>

<style scoped>
.global-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  transition: background 0.3s, backdrop-filter 0.3s;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}
.global-nav.nav-dark {
  background: rgba(6, 13, 23, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 40px;
}
.nav-logo {
  font-family: var(--heading);
  font-size: 18px;
  font-weight: 700;
  color: var(--text-h);
  text-decoration: none;
  white-space: nowrap;
}
.nav-dark .nav-logo {
  color: #fff;
}
.nav-links {
  display: flex;
  gap: 8px;
  flex: 1;
}
.nav-link {
  background: none;
  border: none;
  font: inherit;
  font-size: 15px;
  color: var(--text);
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
}
.nav-link:hover,
.nav-link.active {
  color: var(--accent);
  background: var(--accent-bg);
}
.nav-dark .nav-link {
  color: rgba(255, 255, 255, 0.65);
}
.nav-dark .nav-link:hover,
.nav-dark .nav-link.active {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}
.nav-cta {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: var(--accent);
  padding: 8px 20px;
  border-radius: 8px;
  text-decoration: none;
  white-space: nowrap;
  transition: filter 0.2s;
}
.nav-cta:hover {
  filter: brightness(1.1);
}

@media (max-width: 768px) {
  .nav-links {
    gap: 0;
  }
  .nav-link {
    font-size: 13px;
    padding: 6px 10px;
  }
  .nav-cta {
    font-size: 13px;
    padding: 6px 14px;
  }
  .nav-logo {
    font-size: 15px;
  }
  .nav-inner {
    gap: 16px;
  }
}
</style>
