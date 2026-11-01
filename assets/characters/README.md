# 사이버 산사캠프 캐릭터

| 파일 | 캐릭터 |
|---|---|
| `sansa-cat` | 산사 (기존 캠프 캐릭터, 주황 줄무늬 고양이) |
| `dongeul-monk` | 동글스님 (동자승) |
| `daram-squirrel` | 다람이 (다람쥐) |
| `tori-acorn` | 토리 (도토리) |
| `bami-owl` | 밤이 (부엉이, 연등을 듦) |
| `dungsil-balloon` | 둥실이 (열기구, 캠프 패치워크 외피) — v3 전용 |
| `buddhz-booth` | 붓쯔부스 (BUDDHZ 팝업 부스, 로고는 `assets/brand/buddhz-logo.svg`) — v3 전용 |

## 버전
- `v3/` — **확정본.** 플러시 질감, 옷·소품, 표정/포즈 확장 포함.
  - `v3/svg/`, `v3/png/`, `v3/character-sheet.png` — 기본형(기본 표정, 서 있는 포즈)
  - `v3/variants/svg/`, `v3/variants/png/` — 변형 42종. 파일명 `{캐릭터}--{표정}--{포즈}`
    - 표정: `smile`(기본) · `happy`(활짝) · `surprised`(놀람) · `wink`(윙크)
    - 포즈: `stand` · `wave`(손 흔들기) · `jump`(점프)
  - `v3/variants/variants-sheet.png` — 표정/포즈 시트
  - `v3/group/group-photo.svg|png` — 7종 단체 사진(2400×1200, 초원 배경). 배치·표정·포즈는 `tools/generate_group.py`의 `place(...)` 줄에서 바꾼다.
    재생성: `python3 tools/generate_group.py && node tools/render_group.js`
  - 재생성: `python3 tools/generate_characters_v3.py && python3 tools/generate_variants.py && node tools/render_characters.js v3 && node tools/render_variants.js`
  - 다른 조합이 필요하면 `generate_characters_v3.py`의 각 캐릭터 함수에 `fn(expr, pose)`로 호출하면 된다.
- `v2/` — 동물의 숲 스타일 1차 시안(비교용). `svg/`, `png/`는 v1 플랫 버전(비교용).

## 폴더 / 형식 (v1)
- `svg/` — **원본(마스터)**. 1024×1024 viewBox, 배경 투명. 수정·인쇄·확대는 항상 SVG 기준.
- `png/` — 1024×1024 투명 PNG. 웹/슬라이드/SNS 바로 사용용.
- `character-sheet.png` — 전체 캐릭터 시트(공유·리뷰용).
- 재생성: `python3 tools/generate_characters.py && node tools/render_characters.js`

## 디자인 규칙
- 윤곽선 없는 플랫 컬러, 큰 흰자 눈 + 진갈색 동공(산사 고양이 기준).
- 몸통은 "털 난 동그라미"(보송한 가장자리), 팔레트는 숲속 갈색·주황·크림 + 포인트(연등 분홍, 잎 초록).
