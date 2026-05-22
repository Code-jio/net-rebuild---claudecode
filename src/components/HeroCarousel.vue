<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const slides = [
  { src: '/image/Carousel/pic1.jpg', alt: '联合实验室形象展示 1' },
  { src: '/image/Carousel/pic2.jpg', alt: '联合实验室形象展示 2' },
  // { src: '/image/info/pic3.png', alt: '联合实验室形象展示 3' },
]

const current = ref(0)
const touchStartX = ref(0)
const touchEndX = ref(0)

let timer = null
const interval = 5000

function start() {
  stop()
  timer = setInterval(() => next(), interval)
}

function stop() {
  if (timer) { clearInterval(timer); timer = null }
}

function next() {
  current.value = (current.value + 1) % slides.length
}

function prev() {
  current.value = (current.value - 1 + slides.length) % slides.length
}

function goTo(idx) {
  current.value = idx
}

function onTouchStart(e) {
  touchStartX.value = e.touches[0].clientX
}

function onTouchEnd(e) {
  touchEndX.value = e.changedTouches[0].clientX
  const dx = touchStartX.value - touchEndX.value
  if (Math.abs(dx) > 40) {
    dx > 0 ? next() : prev()
  }
}

onMounted(start)
onUnmounted(stop)
</script>

<template>
  <div
    class="hero-carousel"
    @mouseenter="stop"
    @mouseleave="start"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
  >
    <div class="carousel-track">
      <img
        v-for="(slide, idx) in slides"
        :key="idx"
        :src="slide.src"
        :alt="slide.alt"
        class="carousel-slide"
        :class="{ active: idx === current }"
      />
    </div>

    <button class="carousel-arrow carousel-prev" @click="prev" aria-label="上一张">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M13 4L7 10L13 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <button class="carousel-arrow carousel-next" @click="next" aria-label="下一张">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M7 4L13 10L7 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <div class="carousel-dots">
      <button
        v-for="(slide, idx) in slides"
        :key="'dot-' + idx"
        class="carousel-dot"
        :class="{ active: idx === current }"
        :aria-label="'第 ' + (idx + 1) + ' 张'"
        @click="goTo(idx)"
      ></button>
    </div>
  </div>
</template>

<style scoped>
.hero-carousel {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.carousel-track {
  width: 100%;
  height: 100%;
  position: relative;
}

.carousel-slide {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.6s ease;
  pointer-events: none;
}

.carousel-slide.active {
  opacity: 1;
  pointer-events: auto;
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(15, 29, 50, 0.6);
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s, background 0.2s;
  z-index: 2;
}

.hero-carousel:hover .carousel-arrow {
  opacity: 1;
}

.carousel-arrow:hover {
  background: rgba(15, 29, 50, 0.85);
  color: #fff;
}

.carousel-prev { left: 10px; }
.carousel-next { right: 10px; }

.carousel-dots {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 2;
}

.carousel-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.4);
  background: transparent;
  cursor: pointer;
  padding: 0;
  transition: background 0.3s, border-color 0.3s, transform 0.2s;
}

.carousel-dot.active {
  background: #fff;
  border-color: #fff;
  transform: scale(1.25);
}
</style>
