import { spotSceneDataUri } from '../components/illust'
import type { SpotTag } from './types'

/** 'seed:<spot>:<n>' / 'seed:banner:<n>' 를 일러스트 data URI 로 */
export function resolveSeedArt(path: string): string {
  if (!path.startsWith('seed:')) return path
  const [, kind, n] = path.split(':')
  if (kind === 'banner') return bannerArt(Number(n))
  return spotSceneDataUri(kind as SpotTag, Number(n))
}

const BANNER_PALETTES = [['#2F8F5B', '#9BD9B3'], ['#2C5E8A', '#9DCBEA'], ['#8A5A2C', '#E8C79A']]
function bannerArt(seed: number) {
  const [a, b] = BANNER_PALETTES[seed % BANNER_PALETTES.length]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="300" height="200" fill="url(#g)"/><circle cx="${230 - seed * 40}" cy="${60 + seed * 20}" r="46" fill="#FFD64A" opacity=".9"/><path d="M-10 170q80-50 160-10t160-20v70H-10Z" fill="#fff" opacity=".25"/><path d="M-10 190q90-40 170-6t150-14v40H-10Z" fill="#fff" opacity=".35"/></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
