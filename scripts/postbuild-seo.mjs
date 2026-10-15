// 빌드 후 라우트별 정적 HTML(dist/<route>/index.html)을 만든다.
// 네이버 검색로봇처럼 JS를 실행하지 않는 크롤러가 페이지별 제목·설명·본문을 읽게 하기 위함.
// 사용자 화면은 React가 #root를 덮어쓰므로 그대로다.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

const SITE = 'https://sansacamp.com'
const base = readFileSync('dist/index.html', 'utf8')

const PAGES = [
  {
    route: 'about',
    title: '산사캠프 기획의도 | 하동 쌍계사 템플스테이 힐링캠프',
    description: '가장 조용한 페스티벌, 산사캠프의 기획의도. 하동 쌍계사에서 2박 3일 동안 싱잉볼 명상과 차명상, 산사의 시간표로 마음을 쉬어 가는 힐링캠프를 소개합니다.',
    event: true,
    body: `<h1>산사캠프 기획의도 · WHY SANSA CAMP</h1>
      <p>산사캠프는 산사에서 즐기는 마인드 디톡스, ‘가장 조용한 페스티벌’입니다. 2026년 11월 6일(금)부터 8일(일)까지 2박 3일간 경남 하동 쌍계사에서 산사의 시간표를 빌려 살아 봅니다.</p>
      <p>종교 행사가 아닌 누구나 참여하는 힐링 체험 캠프로, 싱잉볼 사운드 명상과 요가, 108선다 차명상, 스님과의 대화를 통해 일상의 소음을 잠시 내려놓습니다. 혼자 와도, 반려견과 함께 와도 좋습니다.</p>`,
  },
  {
    route: 'reserve',
    title: '산사캠프 예약 | 프로그램·샤워부스·주차 사전예약',
    description: '산사캠프 참가자를 위한 프로그램 사전예약, 샤워부스 시간대 예약, 주차 사전등록 안내. 프로그램 예약은 11월 1일부터 열리며 주차는 무료 사전등록제(1팀 1대)입니다.',
    event: true,
    body: `<h1>산사캠프 예약 안내</h1>
      <p>산사캠프 참가자는 앱에서 프로그램 사전예약, 샤워부스 시간대 예약, 주차 사전등록을 할 수 있습니다.</p>
      <ul>
        <li>프로그램: 싱잉볼 사운드 명상, 요가, 선명상, 108선다 차명상 등 · 11월 1일부터 예약 가능</li>
        <li>샤워부스: 주차장 4곳과 쌍계사 1곳, 30분 단위 시간대 예약</li>
        <li>주차: 무료 · 사전등록제(1팀 1대) · 미등록 차량 진입 불가</li>
      </ul>
      <p>숙박(한옥 방사, 캠핑존) 예매는 네이버 스마트스토어(아이룬 엔터프라이즈)와 NOL티켓에서 할 수 있습니다.</p>`,
  },
  {
    route: 'terms',
    title: '이용약관 | 산사캠프',
    description: '산사캠프 앱과 행사 참가에 관한 이용약관입니다. 예약, 샤워부스·주차 이용 규칙과 행사장 안전 수칙을 안내합니다.',
    event: false,
    body: `<h1>산사캠프 이용약관</h1>
      <p>산사캠프(주최 주식회사 아이룬, 산사캠프 사무국) 앱과 행사 참가에 관한 이용약관입니다. 프로그램·샤워부스·주차 예약과 행사장 이용 규칙을 담고 있습니다.</p>`,
  },
  {
    route: 'privacy',
    title: '개인정보처리방침 | 산사캠프',
    description: '산사캠프 앱의 개인정보처리방침입니다. 수집하는 개인정보 항목, 이용 목적, 보관 기간과 이용자의 권리를 안내합니다.',
    event: false,
    body: `<h1>산사캠프 개인정보처리방침</h1>
      <p>주식회사 아이룬(산사캠프 사무국)이 산사캠프 앱에서 수집하는 개인정보 항목과 이용 목적, 보관 기간, 이용자의 권리를 안내합니다.</p>`,
  },
]

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

function replaceOnce(html, re, value, label) {
  if (!re.test(html)) throw new Error(`postbuild-seo: ${label} not found in dist/index.html`)
  return html.replace(re, value)
}

for (const p of PAGES) {
  const url = `${SITE}/${p.route}`
  let html = base
  html = replaceOnce(html, /<title>[^<]*<\/title>/, `<title>${esc(p.title)}</title>`, 'title')
  html = replaceOnce(html, /<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${esc(p.description)}" />`, 'description')
  html = replaceOnce(html, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`, 'canonical')
  html = replaceOnce(html, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${esc(p.title)}" />`, 'og:title')
  html = replaceOnce(html, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${esc(p.description)}" />`, 'og:description')
  html = replaceOnce(html, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${url}" />`, 'og:url')
  if (!p.event) html = replaceOnce(html, /\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/, '', 'ld+json')
  html = replaceOnce(html, /<main class="seo-intro">[\s\S]*?<\/main>/, `<main class="seo-intro">
      ${p.body}
      <p><a href="/">산사캠프 홈</a> · <a href="/about">기획의도</a> · <a href="/reserve">예약 안내</a></p>
    </main>`, 'seo-intro')
  mkdirSync(`dist/${p.route}`, { recursive: true })
  writeFileSync(`dist/${p.route}/index.html`, html)
  console.log(`postbuild-seo: dist/${p.route}/index.html`)
}
