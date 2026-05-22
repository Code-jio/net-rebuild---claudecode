import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = resolve(__dirname, '../src/data')
const API = 'https://mer.wuqiwan.cn'

mkdirSync(DATA_DIR, { recursive: true })

async function fetchJSON(path) {
  const url = `${API}${path}?t=${Date.now()}`
  const res = await fetch(url)
  const json = await res.json()
  if (json.code !== 1) throw new Error(`API error: ${url} → code=${json.code}`)
  return json.data
}

async function main() {
  console.log('Fetching members list...')
  const members = await fetchJSON('/api/index/members')
  writeFileSync(resolve(DATA_DIR, 'members.json'), JSON.stringify(members, null, 2))
  console.log(`  → ${members.length} members saved`)

  console.log('Fetching member details...')
  const details = {}
  const batchSize = 5
  const mids = members.map(m => m.mid)
  for (let i = 0; i < mids.length; i += batchSize) {
    const batch = mids.slice(i, i + batchSize)
    const results = await Promise.all(
      batch.map(mid =>
        fetchJSON(`/api/index/detail/no/${mid}`).catch(err => {
          console.error(`  ! Failed: ${mid} — ${err.message}`)
          return null
        })
      )
    )
    results.forEach((data, j) => {
      if (data?.info) details[batch[j]] = data
    })
    console.log(`  ${Math.min(i + batchSize, mids.length)}/${mids.length}`)
  }
  writeFileSync(resolve(DATA_DIR, 'member-details.json'), JSON.stringify(details, null, 2))
  console.log(`  → ${Object.keys(details).length} details saved`)

  console.log('Fetching categories...')
  const categories = await fetchJSON('/api/index/categories')
  writeFileSync(resolve(DATA_DIR, 'categories.json'), JSON.stringify(categories, null, 2))
  console.log(`  → ${categories.length} categories saved`)

  console.log('Fetching banners...')
  const banners = await fetchJSON('/api/index/banners')
  writeFileSync(resolve(DATA_DIR, 'banners.json'), JSON.stringify(banners, null, 2))
  console.log('  → banners saved')

  console.log('Fetching home content...')
  const homeContent = await fetchJSON('/api/index/homeContent')
  writeFileSync(resolve(DATA_DIR, 'home-content.json'), JSON.stringify(homeContent, null, 2))
  console.log('  → home content saved')

  console.log('\nDone. All data saved to src/data/')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
