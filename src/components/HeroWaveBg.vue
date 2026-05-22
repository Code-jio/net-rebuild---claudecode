<script setup>
// Pure decorative animated wave background — no logic needed
</script>

<template>
  <div class="wave-bg" aria-hidden="true">
    <svg
      class="wave-layer wave-layer-1"
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
    >
      <path
        d="M0,160 C120,100 240,40 360,80 C480,120 600,220 720,200 C840,180 960,100 1080,120 C1200,140 1320,200 1440,160 L1440,320 L0,320 Z"
        fill="rgba(59, 130, 246, 0.06)"
      />
      <path
        class="wave-path-1"
        d="M0,200 C180,260 360,100 540,160 C720,220 900,180 1080,220 C1260,260 1380,180 1440,200"
        fill="none"
        stroke="rgba(96, 165, 250, 0.12)"
        stroke-width="2"
      />
    </svg>

    <svg
      class="wave-layer wave-layer-2"
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
    >
      <path
        d="M0,180 C100,220 200,140 360,190 C520,240 680,140 800,190 C920,240 1040,160 1200,200 C1360,240 1420,190 1440,180 L1440,320 L0,320 Z"
        fill="rgba(59, 130, 246, 0.04)"
      />
      <path
        class="wave-path-2"
        d="M0,160 C160,100 300,220 480,150 C660,80 800,200 960,140 C1120,80 1280,190 1440,160"
        fill="none"
        stroke="rgba(147, 197, 253, 0.1)"
        stroke-width="1.5"
      />
    </svg>

    <svg
      class="wave-layer wave-layer-3"
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
    >
      <path
        d="M0,210 C100,180 200,250 360,210 C520,170 680,240 800,210 C920,180 1040,230 1200,205 C1360,180 1420,215 1440,210 L1440,320 L0,320 Z"
        fill="rgba(59, 130, 246, 0.03)"
      />
    </svg>

  </div>
</template>

<style scoped>
.wave-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

.wave-layer {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  height: 45%;
  animation: wave-drift 20s linear infinite;
}

.wave-layer-1 {
  animation-duration: 28s;
  animation-direction: normal;
}
.wave-layer-2 {
  animation-duration: 22s;
  animation-direction: reverse;
  height: 38%;
  opacity: 0.8;
}
.wave-layer-3 {
  animation-duration: 34s;
  animation-direction: normal;
  height: 32%;
  opacity: 0.6;
}

.wave-path-1,
.wave-path-2 {
  animation: wave-shift 6s ease-in-out infinite alternate;
}

.wave-path-2 {
  animation-duration: 8s;
}

@keyframes wave-drift {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes wave-shift {
  0% { transform: translateY(0); }
  100% { transform: translateY(-12px); }
}

@media (max-width: 640px) {
  .wave-layer { height: 28%; }
  .wave-layer-2 { height: 24%; }
  .wave-layer-3 { height: 20%; }
}
</style>
