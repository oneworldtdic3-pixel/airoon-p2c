// 언론 기사 미리보기 — 관리자가 붙여 넣은 기사 URL 에서 제목·언론사·대표 이미지·발행일을 읽어 온다.
//  POST { url } (Authorization: 로그인한 관리자 토큰) → { title, outlet, image_url, published_at, url }
//  관리자만 호출 가능(is_admin RPC 로 확인). 내부망·IP 주소 요청은 막는다.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const ANON = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

async function isAdmin(auth: string) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/is_admin`, { method: 'POST', headers: { apikey: ANON, Authorization: auth, 'Content-Type': 'application/json' }, body: '{}' })
  return r.ok && (await r.json()) === true
}

function safeUrl(raw: string): URL | null {
  try {
    const u = new URL(raw.trim())
    if (!/^https?:$/.test(u.protocol)) return null
    const h = u.hostname.toLowerCase()
    if (h === 'localhost' || h.endsWith('.local') || h.endsWith('.internal') || /^[\d.]+$/.test(h) || h.includes(':')) return null
    return u
  } catch { return null }
}

const decodeEntities = (s: string) => s
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
  .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ').trim()

function meta(html: string, keys: string[]): string | null {
  for (const k of keys) {
    const re1 = new RegExp(`<meta[^>]+(?:property|name|itemprop)=["']${k}["'][^>]*content=["']([^"']+)["']`, 'i')
    const re2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name|itemprop)=["']${k}["']`, 'i')
    const m = html.match(re1) ?? html.match(re2)
    if (m?.[1]) return decodeEntities(m[1])
  }
  return null
}

async function readHtml(res: Response): Promise<string> {
  const buf = new Uint8Array(await res.arrayBuffer()).slice(0, 800_000)
  const ct = res.headers.get('content-type') ?? ''
  let charset = ct.match(/charset=([\w-]+)/i)?.[1]
  if (!charset) {
    const head = new TextDecoder('latin1').decode(buf.slice(0, 4000))
    charset = head.match(/<meta[^>]+charset=["']?([\w-]+)/i)?.[1]
  }
  try { return new TextDecoder((charset ?? 'utf-8').toLowerCase()).decode(buf) } catch { return new TextDecoder().decode(buf) }
}

const toDate = (s: string | null) => {
  if (!s) return null
  const m = s.match(/(\d{4})[-./](\d{1,2})[-./](\d{1,2})/)
  return m ? `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}` : null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json(405, { error: 'method not allowed' })
  const auth = req.headers.get('Authorization') ?? ''
  if (!auth || !(await isAdmin(auth))) return json(403, { error: 'FORBIDDEN' })

  let body: { url?: string }
  try { body = await req.json() } catch { return json(400, { error: 'URL_INVALID' }) }
  const u = safeUrl(body.url ?? '')
  if (!u) return json(400, { error: 'URL_INVALID' })

  try {
    const res = await fetch(u, {
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SansaCampBot/1.0; +https://sansacamp.com)', Accept: 'text/html,application/xhtml+xml' },
    })
    if (!res.ok) return json(502, { error: 'FETCH_FAILED', status: res.status })
    const html = await readHtml(res)
    const title = meta(html, ['og:title', 'twitter:title']) ?? decodeEntities(html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ?? '')
    const outlet = meta(html, ['og:site_name', 'application-name', 'author']) ?? u.hostname.replace(/^www\./, '')
    let image = meta(html, ['og:image', 'og:image:url', 'twitter:image'])
    if (image) { try { image = new URL(image, res.url).toString() } catch { image = null } }
    const published = toDate(meta(html, ['article:published_time', 'og:article:published_time', 'pubdate', 'publish_date', 'datePublished', 'date']))
    return json(200, { url: res.url || u.toString(), title: title.slice(0, 200), outlet: outlet.slice(0, 40), image_url: image && /^https?:/i.test(image) ? image : null, published_at: published })
  } catch (e) {
    console.error('press-preview', e instanceof Error ? e.message : e)
    return json(502, { error: 'FETCH_FAILED' })
  }
})
