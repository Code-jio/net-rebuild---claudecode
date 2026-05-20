const BASE = import.meta.env.DEV ? '' : 'https://mer.wuqiwan.cn'

async function get(url, params = {}) {
  params.t = Date.now()
  const qs = new URLSearchParams(params).toString()
  const resp = await fetch(`${BASE}${url}?${qs}`)
  const data = await resp.json()
  return data.data ?? data
}

export function fetchMembers()        { return get('/api/index/members') }
export function fetchCategories()     { return get('/api/index/categories') }
export function fetchBanners()        { return get('/api/index/banners') }
export function fetchHomeContent()    { return get('/api/index/homeContent') }
export function fetchMemberDetail(id) { return get(`/api/index/detail/no/${id}`) }
