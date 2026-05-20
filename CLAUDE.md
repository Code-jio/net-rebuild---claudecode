# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A Vue 3 + Vite SPA redesign for the "高端装备制造联合实验室" (High-End Equipment Manufacturing Joint Lab) website. This is a brand portal + member directory for a lab co-founded by an MIIT key lab, the Chinese Society of Aeronautics, and the Ningbo Jiangbei district government.

**Current state**: Fresh Vite scaffold. The HelloWorld component is template boilerplate. Views referenced by the router (HomeView, MembersView, MemberDetailView) do not exist yet and need to be built per the spec in `docs/specs/`.

## Commands

```bash
npm run dev       # Start dev server (Vite HMR)
npm run build     # Production build to dist/
npm run preview   # Preview production build locally
```

No test runner, linter, or TypeScript is configured.

## Architecture

```
src/
├── main.js              # createApp, registers router
├── App.vue              # Root component (currently renders HelloWorld directly)
├── router/index.js      # 3 routes: /, /members, /members/:id (lazy-loaded views)
├── api/index.js         # API layer — all calls go to https://mer.wuqiwan.cn
├── style.css            # Global styles (CSS custom properties, light/dark theme)
├── components/          # Shared/reusable components
└── views/               # Page-level components (HomeView, MembersView, MemberDetailView)
```

**Routing**: `createWebHistory` mode, scrolls to top on navigation. All route components are lazy-loaded via dynamic `import()`.

**API layer** (`src/api/index.js`): Thin wrapper around `fetch`. Every GET appends `?t=Date.now()` for cache-busting. Responses are expected to return `{ data: ... }` — the wrapper unpacks `data` automatically. Credentials are sent `same-origin`. The live backend is at `https://mer.wuqiwan.cn`.

**API endpoints available**:
- `GET /api/index/members` — member list with category_id, tech_tags, industry_tags
- `GET /api/index/categories` — member categories (企业=16, 研究院=15, 高校=14)
- `GET /api/index/banners` — hero banners
- `GET /api/index/homeContent` — industry services, sub-labs, stats
- `GET /api/index/detail/no/:id` — single member detail
- `GET /api/index/keywords` — tag vocabulary (new, for the redesign)

**Data model notes** (from spec):
- 40+ members across 3 categories
- Members have `tech_tags` (blue chips, e.g. "eVTOL", "3D打印") and `industry_tags` (gold chips, e.g. "航空航天")
- 9 industry services, 3 sub-labs, 4 stats (members, experts, sub-labs, standards)
- Tags use a preset vocabulary managed by admin — members select from the pool only

## Design system (from spec)

- **Theme**: "Industrial Precision × Academic Authority"
- **Primary colors**: Deep navy `#060d17` / `#0f1d32`, blue `#2563eb`, gold accent `#c8943e`, light bg `#f8f9fb`
- **Typography**: Rajdhani (numbers/stats) + Noto Sans SC (Chinese headings/body, weights 300–900)
- **Layout rhythm**: Alternating dark/light sections (Hero dark → Services light → Stats dark → Sub-labs light → CTA dark)
- **Member tags**: Blue chips for tech tags, gold chips for industry tags
- **No UI framework** is installed — all styling is hand-written CSS

## Key spec reference

`docs/specs/2026-05-19-joint-lab-redesign.md` — The full redesign specification. Contains page structure, component breakdown, color palette, data model changes, and API extensions. Always consult this before building pages.
