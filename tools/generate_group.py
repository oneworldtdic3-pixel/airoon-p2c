#!/usr/bin/env python3
"""Group photo of the v3 cast in an Animal-Crossing-style meadow.

Composes the character SVGs (each with its own expression/pose) into one
2400x1200 scene with sky, pine tree line, hills, grass and flowers.
Writes assets/characters/v3/group/group-photo.svg; render the PNG with
  node -e "..." (see tools/render_group.js) or any SVG renderer.
Run:  python3 tools/generate_group.py
"""
import os
import random
import re

from generate_characters_v3 import CHARACTERS

OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "characters", "v3", "group")
W, H = 2400, 1200
HORIZON = 560


def place(name, expr, pose, x, ground, s, shadow=True):
    """Nest a character SVG at (x, ground) scaled by s; figure feet sit on `ground`."""
    svg = CHARACTERS[name](expr, pose)
    body = re.search(r"<svg[^>]*>(.*)</svg>", svg, re.S).group(1)
    if not shadow:
        body = re.sub(r'<ellipse[^>]*fill="#3B5A2A"[^>]*/>', "", body)
    size = 1024 * s
    y = ground - 906 * s
    return f'<svg x="{x:.0f}" y="{y:.0f}" width="{size:.0f}" height="{size:.0f}" viewBox="0 0 1024 1024">{body}</svg>'


def pine(x, base, h, dark):
    c1, c2 = ("#3F8A5C", "#2F6E47") if dark else ("#6FB27C", "#4F9663")
    w = h * 0.55
    return (f'<rect x="{x-h*0.05:.0f}" y="{base-h*0.12:.0f}" width="{h*0.1:.0f}" height="{h*0.14:.0f}" fill="#7A5230"/>'
            + "".join(f'<path d="M{x-w*(1-k*0.22):.0f} {base-h*k*0.3:.0f} L{x:.0f} {base-h*(0.42+k*0.3):.0f} '
                      f'L{x+w*(1-k*0.22):.0f} {base-h*k*0.3:.0f}Z" fill="{c2 if k % 2 else c1}"/>' for k in range(3)))


def cloud(x, y, s):
    return "".join(f'<circle cx="{x+dx*s:.0f}" cy="{y+dy*s:.0f}" r="{r*s:.0f}" fill="#fff" opacity=".95"/>'
                   for dx, dy, r in ((0, 0, 60), (70, -18, 76), (150, 0, 58), (60, 30, 56), (120, 28, 50)))


def flower(x, y, color, s=1):
    petals = "".join(f'<circle cx="{x+9*s*dx:.0f}" cy="{y+9*s*dy:.0f}" r="{7*s:.0f}" fill="{color}"/>'
                     for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1), (0.7, 0.7), (-0.7, 0.7), (0.7, -0.7), (-0.7, -0.7)))
    return petals + f'<circle cx="{x}" cy="{y}" r="{5*s:.0f}" fill="#FFD95A"/>'


def scene():
    rnd = random.Random(3)
    parts = [f'''<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5FB5EC"/><stop offset="1" stop-color="#CDEBFA"/></linearGradient>
<linearGradient id="grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FD35F"/><stop offset="1" stop-color="#5FAE3F"/></linearGradient>
<filter id="gsoft"><feGaussianBlur stdDeviation="12"/></filter>
</defs>
<rect width="{W}" height="{H}" fill="url(#sky)"/>''']
    parts += [cloud(160, 120, 1.1), cloud(760, 70, 0.8), cloud(1500, 110, 1.0), cloud(2080, 60, 0.9)]
    # far hills + two tree rows
    parts.append(f'<ellipse cx="500" cy="{HORIZON+40}" rx="900" ry="150" fill="#A9DCA4"/>')
    parts.append(f'<ellipse cx="1900" cy="{HORIZON+50}" rx="1000" ry="170" fill="#9CD69A"/>')
    for x in range(-40, W + 80, 118):
        parts.append(pine(x + rnd.randint(-12, 12), HORIZON + 10, rnd.randint(170, 230), True))
    for x in range(20, W + 80, 150):
        parts.append(pine(x + rnd.randint(-20, 20), HORIZON + 62, rnd.randint(200, 260), False))
    # ground
    parts.append(f'<rect x="0" y="{HORIZON+40}" width="{W}" height="{H-HORIZON-40}" fill="url(#grass)"/>')
    parts.append(f'<ellipse cx="1200" cy="{HORIZON+70}" rx="1500" ry="60" fill="#B6E39A" opacity=".8"/>')
    for i in range(14):   # soft lighter patches on the grass
        parts.append(f'<ellipse cx="{rnd.randint(0, W)}" cy="{rnd.randint(HORIZON+120, H)}" rx="{rnd.randint(120, 260)}" '
                     f'ry="{rnd.randint(16, 34)}" fill="#A6E07A" opacity=".5" filter="url(#gsoft)"/>')
    # path of light dirt across the middle
    parts.append(f'<path d="M-50 {H-180} Q{W/2} {H-320} {W+50} {H-150} L{W+50} {H-80} Q{W/2} {H-230} -50 {H-100}Z" fill="#E8D7A8" opacity=".55"/>')
    # mid-ground grass tufts (behind the cast)
    for i in range(44):
        x, y = rnd.randint(0, W), rnd.randint(HORIZON + 130, H - 60)
        parts.append(f'<path d="M{x} {y} q-10 -30 -4 -52 M{x} {y} q6 -34 18 -48 M{x} {y} q-2 -26 10 -40" '
                     f'stroke="#4E9A33" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>')
    # cast (back to front), spread across the meadow
    parts.append(place("dungsil-balloon", "happy", "jump", 90, 640, 0.52, shadow=False))
    parts.append(place("buddhz-booth", "smile", "stand", 1570, 1105, 0.8))
    parts.append(place("sansa-cat", "happy", "wave", 170, 1130, 0.62))
    parts.append(place("dongeul-monk", "smile", "stand", 740, 1135, 0.64))
    parts.append(place("daram-squirrel", "happy", "jump", 1230, 1135, 0.6))
    parts.append(place("tori-acorn", "wink", "stand", 545, 1172, 0.5))
    parts.append(place("bami-owl", "surprised", "stand", 1040, 1178, 0.52))
    # foreground flowers along the bottom edge
    cols = ("#FF7B8A", "#FFFFFF", "#FFB84D", "#FF7B8A", "#FFFFFF")
    for i in range(30):
        x, y = rnd.randint(20, W - 20), rnd.randint(H - 110, H - 16)
        parts.append(flower(x, y, cols[i % 5], rnd.choice((0.9, 1.1, 1.3))))
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="산사캠프 단체 사진">\n'
            + "\n".join(parts) + "\n</svg>\n")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    p = os.path.join(OUT, "group-photo.svg")
    with open(p, "w", encoding="utf-8") as f:
        f.write(scene())
    print("wrote", os.path.normpath(p))
