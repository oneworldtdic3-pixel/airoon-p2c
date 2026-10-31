#!/usr/bin/env python3
"""Cyber 산사캠프 character generator.

Writes one hand-built SVG per character into assets/characters/svg/.
Shared design language (taken from the existing 산사 cat):
  - flat shapes, no outlines, warm cream-friendly palette
  - big white eyes with dark pupils, tiny highlight
  - "fuzzy circle" bodies: soft tufted edges made from a rounded polygon
Run:  python3 tools/generate_characters.py
"""
import math
import os
import random

OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "characters", "svg")

DARK = "#2A1A10"
WHITE = "#FFFFFF"
BLUSH = "#F28B7D"


# ---------------------------------------------------------------- helpers
def fuzz(cx, cy, rx, ry, color, n=40, amp=14, seed=1, jitter=0.35,
         rot=0, extra=""):
    """Fuzzy ellipse: alternating valley/peak points, tufts lean a little
    like brushed fur. Round linejoin stroke in the same colour softens tips."""
    rnd = random.Random(seed)
    amp *= 0.62            # softer, plush tufts instead of spikes
    n = int(n * 1.35)      # more, finer tufts
    pts = []
    for i in range(n * 2):
        t = i * math.pi / n
        if i % 2:
            a = amp * (1 + rnd.uniform(-jitter, jitter))
            t += 0.55 * math.pi / n  # lean
        else:
            a = -amp * 0.15
        pts.append((cx + (rx + a) * math.cos(t), cy + (ry + a) * math.sin(t)))
    d = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + "Z"
    tr = f' transform="rotate({rot} {cx} {cy})"' if rot else ""
    return (f'<path d="{d}" fill="{color}" stroke="{color}" stroke-width="9" '
            f'stroke-linejoin="round"{tr} {extra}/>')


def eye(cx, cy, r=38, dx=0, dy=0, pr=None, iris=None):
    pr = pr or r * 0.46
    s = f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{WHITE}"/>'
    if iris:
        s += f'<circle cx="{cx+dx}" cy="{cy+dy}" r="{pr*1.55:.1f}" fill="{iris}"/>'
    s += f'<circle cx="{cx+dx}" cy="{cy+dy}" r="{pr:.1f}" fill="{DARK}"/>'
    s += (f'<circle cx="{cx+dx-pr*0.32:.1f}" cy="{cy+dy-pr*0.34:.1f}" '
          f'r="{pr*0.28:.1f}" fill="{WHITE}"/>')
    return s


def smile(cx, cy, w=34, color=DARK, sw=6):
    return (f'<path d="M{cx-w} {cy} Q{cx-w/2} {cy+w*0.7} {cx} {cy} '
            f'Q{cx+w/2} {cy+w*0.7} {cx+w} {cy}" fill="none" stroke="{color}" '
            f'stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round"/>')


def blush(cx, cy, r=26, op=0.55):
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{r}" ry="{r*0.68}" fill="{BLUSH}" opacity="{op}"/>'


def stripe(x1, y1, x2, y2, w, color=DARK):
    """Tapered tuft: wide at (x1,y1), pointed at (x2,y2)."""
    dx, dy = x2 - x1, y2 - y1
    L = math.hypot(dx, dy) or 1
    px, py = -dy / L * w / 2, dx / L * w / 2
    return (f'<path d="M{x1+px:.1f} {y1+py:.1f} L{x2:.1f} {y2:.1f} '
            f'L{x1-px:.1f} {y1-py:.1f} Z" fill="{color}" stroke="{color}" '
            f'stroke-width="3" stroke-linejoin="round"/>')


def shadow(cx=512, cy=890, rx=240, ry=24):
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="#2A1A10" opacity="0.10"/>'


def svg(title, desc, body, defs=""):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024" role="img" aria-labelledby="t d">
<title id="t">{title}</title>
<desc id="d">{desc}</desc>
<defs>{defs}</defs>
{body}
</svg>
'''


# ------------------------------------------------------------- 1. 산사 (cat)
def sansa():
    O, OD, OL = "#E8832A", "#D9691C", "#F4A261"
    m = lambda x: 1060 - x  # mirror around body centre x=530
    b = [shadow(530, 756, 215)]
    tail = "M410 700 C250 745 185 520 262 372"
    b.append(f'<path d="{tail}" fill="none" stroke="{O}" stroke-width="72" stroke-linecap="round"/>')
    b.append(f'<path d="{tail}" fill="none" stroke="{DARK}" stroke-width="72" stroke-dasharray="15 47" stroke-dashoffset="-16"/>')
    b.append(f'<circle cx="262" cy="372" r="37" fill="{DARK}"/>')
    # ears
    for sx in (1, -1):
        f = (lambda x: x) if sx == 1 else m
        b.append(f'<path d="M{f(392)} 305 L{f(412)} 238 Q{f(428)} 222 {f(446)} 238 L{f(500)} 296 Z" fill="{OD}" stroke="{OD}" stroke-width="8" stroke-linejoin="round"/>')
        b.append(f'<path d="M{f(416)} 288 L{f(426)} 252 Q{f(434)} 246 {f(442)} 254 L{f(474)} 288 Z" fill="{OL}"/>')
    # body
    b.append(f'<rect x="355" y="285" width="350" height="455" rx="150" fill="{O}"/>')
    # forehead stripes
    for x, l in ((492, 40), (530, 52), (568, 40)):
        b.append(stripe(x, 288, x, 288 + l, 20))
    # side stripes (left, mirrored right)
    for y, l in ((382, 62), (424, 66), (462, 62), (530, 70), (574, 74), (618, 70)):
        b.append(stripe(352, y, 352 + l, y + 4, 17))
        b.append(stripe(708, y, 708 - l, y + 4, 17))
    # face
    b.append(eye(465, 383, 40, 0, 4, 17))
    b.append(eye(595, 383, 40, 0, 4, 17))
    b.append(f'<path d="M514 414 L546 414 L530 434 Z" fill="{DARK}" stroke="{DARK}" stroke-width="4" stroke-linejoin="round"/>')
    b.append(f'<path d="M496 440 Q512 462 530 438 Q548 462 564 440" fill="none" stroke="{DARK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>')
    # paws
    for cx in (462, 598):
        b.append(f'<path d="M{cx-26} 655 L{cx-20} 718 Q{cx-18} 742 {cx} 742 Q{cx+18} 742 {cx+20} 718 L{cx+26} 655" fill="none" stroke="{DARK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>')
        b.append(f'<path d="M{cx} 742 L{cx} 722" stroke="{DARK}" stroke-width="4" stroke-linecap="round"/>')
    for y, l in ((662, 44), (692, 36)):
        b.append(stripe(352, y, 352 + l, y + 2, 13))
        b.append(stripe(708, y, 708 - l, y + 2, 13))
    # scale up so 산사 fills the canvas like the other characters
    body = ('<g transform="translate(512 556) scale(1.22) translate(-445 -482)">'
            + "\n".join(b) + "</g>")
    return svg("산사 — 고양이", "산사캠프의 주인공 주황 줄무늬 고양이 '산사'. 기존 캐릭터를 SVG로 재구성.", body)


# -------------------------------------------------------------- 2. 동글스님
def monk():
    SKIN, SKIN_D = "#F6C9A6", "#E9AE86"
    ROBE, ROBE_D, ROBE_L = "#B9B9B4", "#8E8E89", "#CFCFCA"
    BEAD = "#7B4B2A"
    b = [shadow(512, 912, 250)]
    # robe (fuzzy linen blob)
    b.append(fuzz(512, 735, 255, 185, ROBE, n=34, amp=16, seed=7))
    # sleeves (kept low and narrow so the praying hands stay readable)
    b.append(fuzz(398, 790, 82, 98, ROBE_L, n=18, amp=9, seed=3, rot=-24))
    b.append(fuzz(626, 790, 82, 98, ROBE_L, n=18, amp=9, seed=4, rot=24))
    # lapels
    b.append(f'<path d="M428 585 L512 720" stroke="{ROBE_D}" stroke-width="26" stroke-linecap="round" fill="none"/>')
    b.append(f'<path d="M596 585 L512 720" stroke="{ROBE_D}" stroke-width="26" stroke-linecap="round" fill="none"/>')
    # sash
    b.append(f'<path d="M300 842 Q512 872 724 842" stroke="{ROBE_D}" stroke-width="30" stroke-linecap="round" fill="none"/>')
    b.append(f'<circle cx="512" cy="858" r="24" fill="{ROBE_D}"/>')
    # head
    b.append(f'<circle cx="300" cy="418" r="40" fill="{SKIN}"/><circle cx="300" cy="418" r="20" fill="{SKIN_D}" opacity=".55"/>')
    b.append(f'<circle cx="724" cy="418" r="40" fill="{SKIN}"/><circle cx="724" cy="418" r="20" fill="{SKIN_D}" opacity=".55"/>')
    b.append(fuzz(512, 400, 218, 212, SKIN, n=64, amp=7, seed=11, jitter=0.5))
    b.append('<ellipse cx="420" cy="262" rx="70" ry="34" fill="#fff" opacity=".28" transform="rotate(-24 420 262)"/>')
    # face
    b.append(f'<path d="M392 352 Q432 322 474 346" stroke="{DARK}" stroke-width="15" stroke-linecap="round" fill="none"/>')
    b.append(f'<path d="M550 346 Q592 322 632 352" stroke="{DARK}" stroke-width="15" stroke-linecap="round" fill="none"/>')
    b.append(eye(436, 412, 34, 0, 3, 17))
    b.append(eye(588, 412, 34, 0, 3, 17))
    b.append(f'<ellipse cx="512" cy="452" rx="13" ry="9" fill="{SKIN_D}"/>')
    b.append(smile(512, 482, 32, DARK, 6))
    b.append(blush(372, 468, 30))
    b.append(blush(652, 468, 30))
    # beads (염주) first, so the hands sit in front of them
    n = 11
    for i in range(n):
        t = i / (n - 1)
        x = (1 - t) ** 2 * 400 + 2 * (1 - t) * t * 512 + t ** 2 * 624
        y = (1 - t) ** 2 * 596 + 2 * (1 - t) * t * 780 + t ** 2 * 596
        b.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="15" fill="{BEAD}"/>'
                 f'<circle cx="{x-4:.1f}" cy="{y-5:.1f}" r="4" fill="#fff" opacity=".35"/>')
    # prayer hands (larger, in front)
    b.append(f'<path d="M512 612 Q570 664 562 744 Q512 764 462 744 Q454 664 512 612 Z" fill="{SKIN}"/>')
    b.append(f'<path d="M512 630 L512 748" stroke="{SKIN_D}" stroke-width="6" stroke-linecap="round"/>')
    b.append(f'<path d="M474 700 Q512 712 550 700" stroke="{SKIN_D}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".6"/>')
    return svg("동글스님 — 동자승", "동그란 민머리에 회색 승복, 합장한 어린 스님. 염주를 걸고 있다.", "\n".join(b))


# ------------------------------------------------------------ 3. 다람이 (squirrel)
def squirrel():
    B, BD, BL = "#C97A3A", "#A85F27", "#E39A57"
    CREAM = "#F7E6C6"
    b = [shadow(480, 892, 270)]
    # tail
    b.append(fuzz(770, 520, 130, 250, BD, n=34, amp=18, seed=21, rot=18))
    b.append(fuzz(770, 520, 82, 195, BL, n=26, amp=12, seed=22, rot=18))
    for k, y in enumerate((400, 470, 540, 610)):
        b.append(f'<path d="M{690+k*3} {y} Q770 {y-22} {850-k*3} {y}" stroke="{BD}" stroke-width="16" fill="none" stroke-linecap="round" opacity=".7" transform="rotate(18 770 520)"/>')
    # ears
    for cx, rot in ((338, -14), (622, 14)):
        b.append(fuzz(cx, 292, 62, 76, B, n=18, amp=10, seed=cx, rot=rot))
        b.append(fuzz(cx, 304, 30, 42, "#F2B07C", n=12, amp=5, seed=cx + 1, rot=rot))
        b.append(f'<path d="M{cx-6} 218 Q{cx} 170 {cx+10} 214" stroke="{BD}" stroke-width="16" fill="none" stroke-linecap="round"/>')
    # body
    b.append(fuzz(480, 575, 282, 285, B, n=46, amp=15, seed=31))
    b.append(fuzz(480, 718, 150, 140, CREAM, n=24, amp=8, seed=32))
    b.append(fuzz(480, 524, 118, 84, CREAM, n=22, amp=7, seed=33))
    # face
    b.append(eye(398, 462, 40, 3, 4, 18))
    b.append(eye(562, 462, 40, -3, 4, 18))
    b.append(f'<ellipse cx="480" cy="506" rx="20" ry="15" fill="{DARK}"/><ellipse cx="474" cy="501" rx="6" ry="4" fill="#fff" opacity=".5"/>')
    b.append(f'<path d="M480 520 L480 536" stroke="{DARK}" stroke-width="6" stroke-linecap="round"/>')
    b.append(smile(480, 536, 30, DARK, 6))
    b.append(f'<rect x="466" y="545" width="28" height="30" rx="6" fill="#fff"/><path d="M480 545 V575" stroke="#D9C7A6" stroke-width="3"/>')
    b.append(blush(332, 520, 30))
    b.append(blush(628, 520, 30))
    # acorn in paws
    b.append(f'<ellipse cx="480" cy="708" rx="50" ry="56" fill="#D9A15C"/>')
    b.append(f'<path d="M424 694 Q480 640 536 694 Q536 708 480 708 Q424 708 424 694Z" fill="#7A4B2A"/>')
    b.append(f'<path d="M480 648 V628" stroke="#5A3820" stroke-width="9" stroke-linecap="round"/>')
    for cx in (428, 532):
        b.append(f'<ellipse cx="{cx}" cy="722" rx="30" ry="25" fill="{BD}"/>')
    # feet
    for cx in (384, 576):
        b.append(f'<ellipse cx="{cx}" cy="852" rx="62" ry="32" fill="{BD}"/>')
    return svg("다람이 — 다람쥐", "동그란 털뭉치 몸에 커다란 줄무늬 꼬리, 도토리를 안고 있는 다람쥐.", "\n".join(b))


# -------------------------------------------------------------- 4. 토리 (acorn)
def acorn():
    NUT, NUT_D, NUT_L = "#DDA663", "#C98C47", "#F0C48A"
    CAP, CAP_D, CAP_L = "#7A4B2A", "#5E3820", "#9A6338"
    b = [shadow(512, 892, 230)]
    # stem + leaf
    b.append(f'<path d="M512 270 Q516 214 546 190" stroke="{CAP_D}" stroke-width="30" fill="none" stroke-linecap="round"/>')
    b.append('<path d="M548 196 C600 120 700 140 724 178 C676 226 600 232 548 196 Z" fill="#8DB05C"/>')
    b.append('<path d="M556 192 C610 170 668 168 712 176" stroke="#6E9340" stroke-width="6" fill="none" stroke-linecap="round"/>')
    # nut
    b.append(fuzz(512, 650, 235, 245, NUT, n=44, amp=13, seed=41))
    b.append('<ellipse cx="420" cy="760" rx="70" ry="38" fill="#fff" opacity=".18" transform="rotate(-30 420 760)"/>')
    # cap
    for i in range(7):
        x = 270 + i * 80.7
        b.append(f'<circle cx="{x:.1f}" cy="548" r="44" fill="{CAP}"/>')
    b.append(f'<path d="M244 540 C244 330 380 262 512 262 C644 262 780 330 780 540 Z" fill="{CAP}"/>')
    # cap scale texture, clipped to the dome so nothing spills outside
    b.append('<g clip-path="url(#capclip)">')
    for r, y in enumerate((330, 394, 458, 522)):
        off = 0 if r % 2 == 0 else 32
        for c in range(9):
            x = 276 + c * 64 + off
            b.append(f'<path d="M{x-22} {y} Q{x} {y+26} {x+22} {y}" stroke="{CAP_L}" stroke-width="7" fill="none" stroke-linecap="round" opacity=".75"/>')
    b.append('<ellipse cx="380" cy="352" rx="80" ry="26" fill="#fff" opacity=".16" transform="rotate(-28 380 352)"/>')
    b.append('</g>')
    # face
    b.append(eye(424, 646, 40, 3, 4, 18))
    b.append(eye(600, 646, 40, -3, 4, 18))
    b.append(smile(512, 702, 30, DARK, 6))
    b.append(blush(362, 702, 28))
    b.append(blush(662, 702, 28))
    # feet
    for cx in (420, 604):
        b.append(f'<ellipse cx="{cx}" cy="880" rx="52" ry="26" fill="{NUT_D}"/>')
    defs = ('<clipPath id="capclip"><path d="M244 540 C244 330 380 262 512 262 '
            'C644 262 780 330 780 540 Z"/></clipPath>')
    return svg("토리 — 도토리", "털 보송한 도토리 몸에 밤색 모자를 쓰고 새싹 잎이 돋은 도토리 요정.", "\n".join(b), defs)


# ------------------------------------------------------------ 5. 밤이 (owl)
def owl():
    B, BD, BL = "#8C6C4E", "#6E5238", "#A98764"
    CREAM, FACE = "#F2E2C2", "#E9D4AE"
    LANT, LANT_D = "#F59CB8", "#E5789C"
    defs = ('<radialGradient id="glow"><stop offset="0" stop-color="#FFD9A0" stop-opacity=".95"/>'
            '<stop offset="1" stop-color="#FFD9A0" stop-opacity="0"/></radialGradient>')
    b = [shadow(470, 892, 250)]
    # ear tufts
    b.append(fuzz(352, 312, 52, 84, B, n=16, amp=9, seed=51, rot=-24))
    b.append(fuzz(588, 312, 52, 84, B, n=16, amp=9, seed=52, rot=24))
    # body
    b.append(fuzz(470, 592, 276, 286, B, n=48, amp=15, seed=53))
    # wings
    b.append(fuzz(232, 660, 70, 150, BD, n=20, amp=10, seed=54, rot=12))
    b.append(fuzz(708, 660, 70, 150, BD, n=20, amp=10, seed=55, rot=-12))
    # belly
    b.append(fuzz(470, 718, 158, 168, CREAM, n=26, amp=8, seed=56))
    for r, y in enumerate((636, 692, 748, 804)):
        for c in range(-2, 3):
            x = 470 + c * 54 + (27 if r % 2 else 0)
            if abs(x - 470) < 140:
                b.append(f'<path d="M{x-16} {y} Q{x} {y+20} {x+16} {y}" stroke="#C9AE86" stroke-width="6" fill="none" stroke-linecap="round"/>')
    # face disc
    b.append(f'<circle cx="388" cy="470" r="112" fill="{FACE}"/><circle cx="552" cy="470" r="112" fill="{FACE}"/>')
    b.append(eye(388, 470, 66, 0, 3, 22, iris="#E9A93A"))
    b.append(eye(552, 470, 66, 0, 3, 22, iris="#E9A93A"))
    b.append(f'<path d="M470 520 L450 554 Q470 578 490 554 Z" fill="#F08A24" stroke="#F08A24" stroke-width="6" stroke-linejoin="round"/>')
    b.append(blush(300, 540, 26, .5))
    b.append(blush(640, 540, 26, .5))
    # feet
    for cx in (400, 540):
        for dx in (-22, 0, 22):
            b.append(f'<ellipse cx="{cx+dx}" cy="880" rx="13" ry="22" fill="#F08A24"/>')
    # lantern (연등) held by right wing
    b.append('<path d="M728 640 L818 420" stroke="#6E4A2A" stroke-width="12" stroke-linecap="round"/>')
    b.append('<circle cx="828" cy="520" r="120" fill="url(#glow)"/>')
    b.append('<path d="M828 420 V448" stroke="#6E4A2A" stroke-width="6"/>')
    b.append(f'<ellipse cx="828" cy="510" rx="56" ry="66" fill="{LANT}"/>')
    for dx in (-26, 0, 26):
        b.append(f'<path d="M{828+dx} 446 Q{828+dx*1.9} 510 {828+dx} 574" stroke="{LANT_D}" stroke-width="5" fill="none"/>')
    b.append(f'<rect x="808" y="440" width="40" height="14" rx="6" fill="#6E4A2A"/><rect x="808" y="566" width="40" height="14" rx="6" fill="#6E4A2A"/>')
    for dx in (-14, 0, 14):
        b.append(f'<path d="M{828+dx} 580 V{608+abs(dx)}" stroke="{LANT_D}" stroke-width="5" stroke-linecap="round"/>')
    b.append(f'<ellipse cx="716" cy="660" rx="34" ry="26" fill="{BD}"/>')
    return svg("밤이 — 부엉이", "동그란 털뭉치 부엉이. 오른쪽 날개로 분홍 연등을 들어 밤 숲길을 밝힌다.", "\n".join(b), defs)


CHARACTERS = {
    "sansa-cat": sansa,
    "dongeul-monk": monk,
    "daram-squirrel": squirrel,
    "tori-acorn": acorn,
    "bami-owl": owl,
}

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for name, fn in CHARACTERS.items():
        path = os.path.join(OUT, f"{name}.svg")
        with open(path, "w", encoding="utf-8") as f:
            f.write(fn())
        print("wrote", os.path.normpath(path))
