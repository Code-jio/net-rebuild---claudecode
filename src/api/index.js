import members from '../data/members.json'
import categories from '../data/categories.json'
import banners from '../data/banners.json'
import homeContent from '../data/home-content.json'
import memberDetails from '../data/member-details.json'

function asPromise(data) {
  return Promise.resolve(data)
}

export function fetchMembers()        { return asPromise(members) }
export function fetchCategories()     { return asPromise(categories) }

export function fetchBanners() {
  return asPromise(banners.banner ?? banners)
}

export function fetchHomeContent() {
  return asPromise(homeContent)
}

export function fetchMemberDetail(id) {
  const detail = memberDetails[id]
  return asPromise(detail ?? null)
}
