# Temple Pay

Temple Pay 모바일 홈 화면 (React + TypeScript + Vite + Tailwind CSS v4).

```bash
npm install
npm run dev     # 개발 서버
npm run build   # 프로덕션 빌드
npm run lint
```

## 구조

- `src/App.tsx` — 홈 화면 (헤더, 인사 카드, 나의사찰, 바로가기 그리드, 신행 요약)
- `src/components/TabBar.tsx` — 하단 탭 바 (가운데 QR 스캔)
- `src/components/icons.tsx` — 아이콘 SVG
- `src/assets/` — 일러스트 이미지

`src/assets/`의 일러스트는 디자인 스크린샷에서 잘라낸 임시 이미지입니다.
Figma 원본 에셋(투명 배경 PNG)으로 같은 파일명으로 교체하면 됩니다.
