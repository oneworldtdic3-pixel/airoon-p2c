# 사이버 산사캠프 캐릭터

| 파일 | 캐릭터 |
|---|---|
| `sansa-cat` | 산사 (기존 캠프 캐릭터, 주황 줄무늬 고양이) |
| `dongeul-monk` | 동글스님 (동자승) |
| `daram-squirrel` | 다람이 (다람쥐) |
| `tori-acorn` | 토리 (도토리) |
| `bami-owl` | 밤이 (부엉이, 연등을 듦) |

## 폴더 / 형식
- `svg/` — **원본(마스터)**. 1024×1024 viewBox, 배경 투명. 수정·인쇄·확대는 항상 SVG 기준.
- `png/` — 1024×1024 투명 PNG. 웹/슬라이드/SNS 바로 사용용.
- `character-sheet.png` — 전체 캐릭터 시트(공유·리뷰용).
- 재생성: `python3 tools/generate_characters.py && node tools/render_characters.js`

## 디자인 규칙
- 윤곽선 없는 플랫 컬러, 큰 흰자 눈 + 진갈색 동공(산사 고양이 기준).
- 몸통은 "털 난 동그라미"(보송한 가장자리), 팔레트는 숲속 갈색·주황·크림 + 포인트(연등 분홍, 잎 초록).
