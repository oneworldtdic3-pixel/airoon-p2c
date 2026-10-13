"""山寺캠프 with 쌍계사 — 깃털배너 3종 생성기.

포스터(하늘/초록/주황, 굵은 검정 라인, 망점, 붓글씨 로고)의 톤앤매너를
깃털배너 형태로 옮긴다. 출력: flag-<color>.svg + mockup.html
"""
import json
import random
from pathlib import Path

HERE = Path(__file__).parent
W, H = 600, 2600  # 1 unit = 1mm (600 x 2600mm 깃털배너 인쇄면)

INK = "#1a1a1a"
C = {
    "sky": "#4FBDE9",
    "green": "#2E9B57",
    "orange": "#E8541C",
    "yellow": "#F2E53A",
    "white": "#FFFFFF",
}
VARIANTS = {
    "green": {"bg": C["green"], "dot": "#22804A", "acc": [C["orange"], C["yellow"], C["white"], C["sky"]]},
    "sky": {"bg": C["sky"], "dot": "#36A6D6", "acc": [C["green"], C["orange"], C["yellow"], C["white"]]},
    "orange": {"bg": C["orange"], "dot": "#CF4514", "acc": [C["green"], C["yellow"], C["white"], C["sky"]]},
}

# 깃털 형태: 왼쪽이 폴대(직선), 상단은 둥글게 말리고 오른쪽 날은 완만한 곡선
FLAG = ("M30 2600 L30 150 C30 70 95 28 210 28 C385 28 548 112 576 310 "
        "C598 470 560 900 556 1400 C552 1900 584 2280 556 2600 Z")

LOGO = json.loads((HERE / "logo_paths.json").read_text())


def logo(x, y, scale):
    """붓글씨 로고를 2줄(山寺 / 캠프)로 재배치. 원본 좌표계 그대로 이동만 한다."""
    parts = []
    for key, dx, dy in [("san", 0, 0), ("sa", 0, 0),
                        ("kaem", -2240, 1350), ("peu", -2240, 1350), ("seal", -2240, 1350)]:
        p = LOGO[key]
        parts.append(f'<path transform="translate({p["x"] + dx} {p["y"] + dy})" d="{p["d"]}"/>')
    return (f'<g transform="translate({x} {y}) scale({scale}) translate(-103 -161)" '
            f'fill="{INK}">{"".join(parts)}</g>')


def cloud(x0, y0, x1, y1, seed=3):
    """포스터 구름: 원을 이어 붙이고 굵은 외곽선."""
    rnd = random.Random(seed)
    circles = []
    n = max(2, round((x1 - x0) / 74))
    for i in range(n + 1):
        cx = x0 + (x1 - x0) * i / n
        circles.append((cx, y0 + rnd.uniform(-6, 6), rnd.uniform(46, 62)))
        circles.append((cx, y1 + rnd.uniform(-6, 6), rnd.uniform(46, 62)))
    m = max(2, round((y1 - y0) / 90))
    for j in range(1, m):
        cy = y0 + (y1 - y0) * j / m
        circles.append((x0 + rnd.uniform(-4, 4), cy, rnd.uniform(44, 58)))
        circles.append((x1 + rnd.uniform(-4, 4), cy, rnd.uniform(44, 58)))
    out = [f'<g stroke="{INK}" stroke-width="16" fill="{INK}">']
    out += [f'<circle cx="{a:.1f}" cy="{b:.1f}" r="{r:.1f}"/>' for a, b, r in circles]
    out.append(f'<rect x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}"/></g><g fill="#fff">')
    out += [f'<circle cx="{a:.1f}" cy="{b:.1f}" r="{r:.1f}"/>' for a, b, r in circles]
    out.append(f'<rect x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}"/></g>')
    return "".join(out)


# ── 모티프 (모두 100x100 기준, 굵은 검정 라인) ─────────────────────────
def maple(fill):
    return (f'<path d="M50 4 L58 22 L68 14 L66 34 L84 24 L80 42 L96 44 L82 56 L88 66 L62 64 '
            f'L56 78 L50 72 L44 78 L38 64 L12 66 L18 56 L4 44 L20 42 L16 24 L34 34 L32 14 L42 22 Z" fill="{fill}" '
            f'stroke="{INK}" stroke-width="5" stroke-linejoin="round"/>'
            f'<path d="M50 36 L50 96" stroke="{INK}" stroke-width="5" stroke-linecap="round"/>')


def sun(fill):
    return f'<circle cx="50" cy="50" r="40" fill="{fill}" stroke="{INK}" stroke-width="5"/>'


def tent(_):
    return (f'<path d="M50 12 L94 86 L6 86 Z" fill="#fff" stroke="{INK}" stroke-width="5" '
            f'stroke-linejoin="round"/><path d="M50 12 L38 86 L62 86 Z" fill="{INK}"/>'
            f'<path d="M26 72 L40 46" stroke="{INK}" stroke-width="3" stroke-dasharray="6 6"/>')


def chair(_):
    return (f'<path d="M20 14 L32 92 M80 20 L68 92 M28 92 L76 52 M72 92 L24 52 M14 60 L86 62" '
            f'stroke="#6B3E26" stroke-width="7" stroke-linecap="round"/>'
            f'<path d="M22 20 L78 26 L72 62 L28 60 Z" fill="{C["yellow"]}" stroke="{INK}" '
            f'stroke-width="5" stroke-linejoin="round"/>')


def grass(_):
    return (f'<path d="M20 90 Q22 60 12 40 M38 90 Q40 50 50 26 M58 90 Q60 64 74 50 '
            f'M76 90 Q80 74 90 70" stroke="{INK}" stroke-width="6" fill="none" '
            f'stroke-linecap="round"/>')


def gate(_):
    return (f'<path d="M28 50 V94 M72 50 V94" stroke="{INK}" stroke-width="14" stroke-linecap="round"/>'
            f'<path d="M28 50 V94 M72 50 V94" stroke="#fff" stroke-width="6" stroke-linecap="round"/>'
            f'<rect x="20" y="40" width="60" height="10" fill="#fff" stroke="{INK}" stroke-width="5"/>'
            f'<path d="M4 42 Q50 16 96 42 L86 28 Q50 4 14 28 Z" fill="{C["orange"]}" '
            f'stroke="{INK}" stroke-width="5" stroke-linejoin="round"/>'
            f'<path d="M22 30 l0 7 M36 22 l0 7 M50 19 l0 7 M64 22 l0 7 M78 30 l0 7" '
            f'stroke="{INK}" stroke-width="4"/>')


def dog(_):
    return (f'<path d="M8 80 Q6 50 40 46 Q66 42 78 56 Q96 58 94 76 Q92 88 70 86 L16 88 Q8 88 8 80 Z" '
            f'fill="#fff" stroke="{INK}" stroke-width="5" stroke-linejoin="round"/>'
            f'<ellipse cx="34" cy="60" rx="10" ry="7" fill="{INK}"/>'
            f'<path d="M66 56 Q76 50 82 62 Q76 70 68 66 Z" fill="{INK}"/>'
            f'<path d="M80 72 q5 4 10 0" stroke="{INK}" stroke-width="4" fill="none" stroke-linecap="round"/>'
            f'<path d="M56 6 h14 l-14 14 h14 M74 24 h9 l-9 9 h9" stroke="{INK}" stroke-width="4" '
            f'fill="none" stroke-linejoin="round"/>')


def pack(_):
    return (f'<rect x="20" y="22" width="60" height="72" rx="20" fill="{C["sky"]}" stroke="{INK}" '
            f'stroke-width="5"/><rect x="32" y="56" width="36" height="28" rx="8" fill="{C["sky"]}" '
            f'stroke="{INK}" stroke-width="5"/><path d="M36 22 Q36 6 50 6 Q64 6 64 22" '
            f'stroke="{INK}" stroke-width="5" fill="none"/>')


def dot(fill):
    return f'<circle cx="50" cy="50" r="30" fill="{fill}" stroke="{INK}" stroke-width="8"/>'


def squiggle(fill):
    return (f'<path d="M8 60 Q22 30 36 55 T64 55 T92 45" stroke="{INK}" stroke-width="16" '
            f'fill="none" stroke-linecap="round"/><path d="M8 60 Q22 30 36 55 T64 55 T92 45" '
            f'stroke="{fill}" stroke-width="8" fill="none" stroke-linecap="round"/>')


# (모티프, x, y, 크기, 회전, 액센트 색 인덱스) — 레퍼런스처럼 흩뿌리되 대각 리듬 유지
SCATTER = [
    (grass, 70, 125, 54, 0, 0), (maple, 300, 70, 56, -18, 0), (dot, 236, 150, 26, 0, 2),
    (squiggle, 140, 1180, 60, -10, 1), (maple, 430, 1190, 74, 22, 0), (dot, 330, 1180, 24, 0, 2),
    (gate, 250, 1290, 120, 0, 0), (dot, 92, 1330, 30, 0, 0), (maple, 470, 1380, 52, -30, 1),
    (grass, 110, 1440, 56, 0, 0), (squiggle, 420, 1490, 54, 15, 2), (maple, 200, 1500, 60, 12, 2),
    (tent, 300, 1600, 140, 0, 0), (dot, 470, 1580, 22, 0, 1), (sun, 92, 1620, 52, 0, 0),
    (chair, 120, 1760, 84, -6, 0), (maple, 470, 1720, 64, -14, 0), (dot, 260, 1780, 26, 0, 3),
    (squiggle, 380, 1800, 56, -20, 3), (pack, 450, 1880, 66, 8, 0), (maple, 90, 1890, 50, 30, 1),
    (dog, 250, 1910, 120, 0, 0), (grass, 380, 1960, 46, 0, 0), (dot, 140, 1990, 22, 0, 2),
    (maple, 470, 2010, 46, 18, 2),
    (grass, 70, 2540, 50, 0, 0), (maple, 470, 2530, 50, -12, 0), (dot, 300, 2560, 22, 0, 1),
]


def place(fn, x, y, size, rot, color):
    s = size * 1.45 / 100
    return (f'<g transform="translate({x} {y}) rotate({rot}) scale({s:.3f}) translate(-50 -50)">'
            f'{fn(color)}</g>')


def flag(name, v):
    bg, acc = v["bg"], v["acc"]
    scatter = "".join(place(fn, x, y, sz, r, acc[i % len(acc)]) for fn, x, y, sz, r, i in SCATTER)
    sun_fill = C["yellow"] if name == "orange" else C["orange"]
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}mm" height="{H}mm">
<defs>
  <style>
    @font-face {{ font-family: BHS; src: url(fonts/BlackHanSans-Regular.ttf); }}
    @font-face {{ font-family: Jua; src: url(fonts/Jua-Regular.ttf); }}
    @font-face {{ font-family: Rubik; src: url(fonts/Rubik.ttf); font-weight: 300 900; }}
    .num {{ font-family: Rubik; font-weight: 800; fill: #fff; }}
    .ko {{ font-family: BHS; }}
    .ko2 {{ font-family: Jua; }}
  </style>
  <pattern id="ht-{name}" width="11" height="11" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <circle cx="5.5" cy="5.5" r="2.4" fill="{v["dot"]}"/>
  </pattern>
  <clipPath id="clip-{name}"><path d="{FLAG}"/></clipPath>
</defs>
<g clip-path="url(#clip-{name})">
  <rect width="{W}" height="{H}" fill="{bg}"/>
  <rect width="{W}" height="{H}" fill="url(#ht-{name})"/>
  <circle cx="470" cy="270" r="92" fill="{sun_fill}" stroke="{INK}" stroke-width="9"/>
  {scatter}
  {cloud(92, 330, 500, 1090)}
  <text x="296" y="420" text-anchor="middle" class="num" style="fill:{INK}" font-size="40">2026</text>
  <text x="296" y="466" text-anchor="middle" class="ko" fill="{INK}" font-size="31">산사에서 즐기는 마인드 디톡스</text>
  {logo(118, 488, 0.175)}
  <text x="296" y="1002" text-anchor="middle" class="num" style="fill:{INK};font-weight:700" font-size="36">with</text>
  <text x="296" y="1076" text-anchor="middle" class="ko" fill="{INK}" font-size="72">쌍계사</text>

  <g class="num" font-size="68" letter-spacing="-1">
    <text x="62" y="2120">2026.</text>
    <text x="62" y="2196">11.06 FRI –</text>
    <text x="62" y="2272">11.08 SUN</text>
  </g>
  <rect x="62" y="2310" width="440" height="6" fill="#fff"/>
  <text x="62" y="2398" class="ko" fill="#fff" font-size="64">하동 쌍계사 일원</text>
  <text x="64" y="2452" class="ko2" fill="#fff" font-size="32">사전예약제 700명 한정</text>
  <text x="64" y="2494" class="ko2" fill="#fff" font-size="32">숙박 캠핑존 / 한옥 방사 스테이</text>
</g>
</svg>'''


def main():
    for name, v in VARIANTS.items():
        (HERE / f"flag-{name}.svg").write_text(flag(name, v))
    flags = "".join(f'<div class="pole"><object data="flag-{n}.svg" type="image/svg+xml"></object></div>' for n in VARIANTS)
    (HERE / "mockup.html").write_text(f'''<!doctype html><html lang="ko"><meta charset="utf-8">
<title>山寺캠프 깃털배너</title>
<style>
  body {{ margin:0; background:linear-gradient(#5BB8E6 0%, #A9DCF2 70%, #CBE9F5 78%); }}
  .stage {{ position:relative; width:1400px; height:1500px; display:flex; justify-content:center;
           gap:90px; padding-top:70px; box-sizing:border-box; }}
  .stage::after {{ content:""; position:absolute; left:0; right:0; bottom:0; height:190px;
           background:repeating-radial-gradient(circle at 3px 3px, #23804A 0 3px, #2E9B57 3.5px 9px); }}
  .pole {{ position:relative; width:300px; height:1300px; z-index:1; }}
  .pole object {{ width:300px; height:1300px; display:block; filter:drop-shadow(6px 8px 10px rgba(0,0,0,.25)); }}
  .pole::before {{ content:""; position:absolute; left:8px; top:10px; width:10px; height:1380px;
           background:linear-gradient(90deg,#999,#eee,#888); border-radius:5px; z-index:-1; }}
</style>
<div class="stage">{flags}</div></html>''')


if __name__ == "__main__":
    main()
