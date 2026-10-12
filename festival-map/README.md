# 쌍계사 페스티벌 맵

하동 쌍계사 일대 페스티벌 구역 지도(텐트존 3곳 250동, 메인 무대, 부스 가안).

- `festival-map.html` — 빌드된 페이지 (Artifact로 게시됨)
- `src/template2.html` — 일러스트 안내도 페이지 원본 (현재 버전). `src/template.html`은 이전 개략도 버전. `__ZONES__`, `__STAGE__`, `__PARCEL__` 자리에 데이터가 들어감
- `src/extract.py` — PPTX 도형 → `shapes.json`
- `src/zones.py` — `shapes.json` → 구역별 텐트·시설 데이터 `zones.json`
- `src/build.py` — 템플릿 + 데이터 + 캡처 이미지 → `festival-map.html`

```sh
cd festival-map/src
python3 extract.py 배치도.pptx shapes.json
python3 zones.py shapes.json zones.json
python3 build.py . ../festival-map.html
```

전체 지도 좌표는 카카오맵 캡처(약 1px = 1m)에서 미터 단위로 옮겨 `template.html`의 `ZONE_SHAPES`, `LANDMARKS`, `ROADS`에 적어 두었습니다.
