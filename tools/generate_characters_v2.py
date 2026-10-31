#!/usr/bin/env python3
"""Cyber 산사캠프 characters — v2, "모여봐요 동물의 숲" inspired style.

Style rules (original characters, only the *look* is referenced):
  - chibi proportions: huge wide head, tiny stubby body, small oval hands/feet
  - small dark OVAL eyes set wide apart + two tiny white highlights
  - small snout/nose, tiny "ω" mouth, round pink cheeks
  - soft matte radial-gradient shading, no outlines
Writes SVGs to assets/characters/v2/svg/.
Run:  python3 tools/generate_characters_v2.py
"""
import math
import os

from generate_characters import fuzz, stripe, smile, DARK  # reuse helpers

OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "characters", "v2", "svg")
BLUSH = "#F58C8C"


# ---------------------------------------------------------------- helpers
class Doc:
    def __init__(self, p):
        self.p = p
        self.defs = [f'<filter id="{p}soft" x="-30%" y="-80%" width="160%" height="260%">'
                     f'<feGaussianBlur stdDeviation="9"/></filter>']
        self.b = []

    def grad(self, name, light, base):
        gid = f"{self.p}{name}"
        self.defs.append(f'<radialGradient id="{gid}" cx=".36" cy=".28" r=".9">'
                         f'<stop offset="0" stop-color="{light}"/>'
                         f'<stop offset="1" stop-color="{base}"/></radialGradient>')
        return f"url(#{gid})"

    def add(self, *s):
        self.b.extend(s)

    def ground(self, cx, cy, rx):
        self.add(f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="26" fill="#2A1A10" opacity=".13" filter="url(#{self.p}soft)"/>')

    def head_shadow(self, cx, cy, rx):
        """soft shadow the big head throws onto the tiny body"""
        self.add(f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="34" fill="#2A1A10" opacity=".22" filter="url(#{self.p}soft)"/>')

    def render(self, title, desc):
        return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024" '
                f'role="img" aria-labelledby="{self.p}t {self.p}d">\n'
                f'<title id="{self.p}t">{title}</title>\n<desc id="{self.p}d">{desc}</desc>\n'
                f'<defs>{"".join(self.defs)}</defs>\n' + "\n".join(self.b) + "\n</svg>\n")


def ell(cx, cy, rx, ry, fill, rot=0, extra=""):
    tr = f' transform="rotate({rot} {cx} {cy})"' if rot else ""
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{fill}"{tr} {extra}/>'


def ac_eye(cx, cy, rx=19, ry=27):
    """Animal-Crossing-style eye: dark vertical oval, two tiny highlights."""
    return (ell(cx, cy, rx, ry, DARK)
            + f'<circle cx="{cx - rx*0.32:.1f}" cy="{cy - ry*0.36:.1f}" r="{rx*0.42:.1f}" fill="#fff"/>'
            + f'<circle cx="{cx + rx*0.34:.1f}" cy="{cy + ry*0.36:.1f}" r="{rx*0.2:.1f}" fill="#fff" opacity=".85"/>')


def cheek(cx, cy, r=38, op=0.6):
    return ell(cx, cy, r, r * 0.7, BLUSH, extra=f'opacity="{op}"')


def omega(cx, cy, w=24, sw=5, color=DARK):
    return smile(cx, cy, w, color, sw)


# ------------------------------------------------------------ 1. 산사 (cat)
def sansa():
    d = Doc("sa")
    O = d.grad("o", "#FFB45E", "#E8832A")
    OD = d.grad("od", "#F59A48", "#D9691C")
    CR = d.grad("c", "#FFF8E8", "#F5E0B8")
    mx = lambda x: 1024 - x
    d.ground(512, 904, 280)
    # tail (right side, curls up outside the head)
    tail = "M610 810 C900 850 970 610 902 430"
    d.add(f'<path d="{tail}" fill="none" stroke="{O}" stroke-width="64" stroke-linecap="round"/>',
          f'<path d="{tail}" fill="none" stroke="{DARK}" stroke-width="64" stroke-dasharray="14 44" stroke-dashoffset="-10"/>',
          f'<circle cx="902" cy="430" r="32" fill="{DARK}"/>')
    # feet + body
    for cx in (424, 600):
        d.add(ell(cx, 884, 68, 34, OD))
    d.add(ell(512, 762, 178, 132, O), ell(512, 792, 106, 90, CR))
    d.add(ell(350, 762, 44, 66, OD, 18), ell(674, 762, 44, 66, OD, -18))
    d.head_shadow(512, 690, 150)
    # ears
    for f in (lambda x: x, mx):
        d.add(f'<path d="M{f(262)} 340 Q{f(232)} 186 {f(292)} 142 Q{f(386)} 166 {f(446)} 246 Z" fill="{OD}" stroke="{OD}" stroke-width="14" stroke-linejoin="round"/>',
              f'<path d="M{f(292)} 306 Q{f(278)} 214 {f(302)} 188 Q{f(352)} 204 {f(396)} 256 Z" fill="#F8B890"/>')
    # head
    d.add(ell(512, 430, 322, 262, O))
    for x, y2, w in ((512, 252, 34), (442, 246, 26), (582, 246, 26)):
        d.add(stripe(x, 176, x, y2, w))
    for y, l in ((372, 80), (432, 84), (492, 76)):
        d.add(stripe(194, y, 194 + l, y + 6, 26), stripe(830, y, 830 - l, y + 6, 26))
    d.add(ell(512, 524, 132, 84, CR))
    d.add('<path d="M490 476 Q512 466 534 476 Q528 500 512 506 Q496 500 490 476Z" fill="#D9737A" stroke="#D9737A" stroke-width="6" stroke-linejoin="round"/>')
    d.add(f'<path d="M512 506 V520" stroke="{DARK}" stroke-width="5" stroke-linecap="round"/>', omega(512, 520, 26))
    d.add(ac_eye(392, 440), ac_eye(632, 440), cheek(320, 506), cheek(704, 506))
    d.add('<ellipse cx="390" cy="250" rx="100" ry="34" fill="#fff" opacity=".22" transform="rotate(-18 390 250)"/>')
    return d.render("산사 — 고양이 (v2)", "모여봐요 동물의 숲 스타일로 다시 그린 주황 줄무늬 고양이 산사.")


# ----------------------------------------------------------------- 2. 동글스님
def monk():
    d = Doc("mk")
    SK = d.grad("sk", "#FFDDBF", "#F2B58C")
    RB = d.grad("rb", "#D4D4CF", "#A9A9A3")
    RL = d.grad("rl", "#E4E4DF", "#C2C2BC")
    D = "#8E8E89"
    d.ground(512, 910, 250)
    for cx in (424, 600):
        d.add(ell(cx, 888, 68, 32, "#6C5A48"))
    robe = "M336 676 Q512 626 688 676 L728 872 Q512 918 296 872 Z"
    d.add(f'<path d="{robe}" fill="{RB}" stroke="{RB}" stroke-width="18" stroke-linejoin="round"/>')
    d.add(f'<path d="M438 664 L512 790" stroke="{D}" stroke-width="22" stroke-linecap="round"/>',
          f'<path d="M586 664 L512 790" stroke="{D}" stroke-width="22" stroke-linecap="round"/>',
          f'<path d="M312 826 Q512 858 712 826" stroke="{D}" stroke-width="26" stroke-linecap="round" fill="none"/>')
    d.add(ell(414, 776, 60, 74, RL, 28), ell(610, 776, 60, 74, RL, -28))
    # beads then hands (hands in front)
    for i in range(11):
        t = i / 10
        x = (1 - t) ** 2 * 404 + 2 * (1 - t) * t * 512 + t ** 2 * 620
        y = (1 - t) ** 2 * 676 + 2 * (1 - t) * t * 810 + t ** 2 * 676
        d.add(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="13" fill="#7B4B2A"/><circle cx="{x-3.5:.1f}" cy="{y-4:.1f}" r="3.5" fill="#fff" opacity=".4"/>')
    d.add(f'<path d="M512 694 Q556 730 550 796 Q512 814 474 796 Q468 730 512 694 Z" fill="{SK}"/>',
          '<path d="M512 708 V800" stroke="#E4A47C" stroke-width="5" stroke-linecap="round"/>')
    d.head_shadow(512, 692, 160)
    d.add(ell(216, 430, 46, 52, SK), ell(808, 430, 46, 52, SK),
          ell(216, 432, 22, 28, "#E9A07A", extra='opacity=".55"'), ell(808, 432, 22, 28, "#E9A07A", extra='opacity=".55"'))
    d.add(ell(512, 410, 300, 265, SK))
    d.add('<ellipse cx="400" cy="232" rx="96" ry="34" fill="#fff" opacity=".3" transform="rotate(-20 400 232)"/>')
    d.add(f'<path d="M352 358 Q404 326 458 350" stroke="{DARK}" stroke-width="13" stroke-linecap="round" fill="none"/>',
          f'<path d="M566 350 Q620 326 672 358" stroke="{DARK}" stroke-width="13" stroke-linecap="round" fill="none"/>')
    d.add(ac_eye(398, 432, 19, 27), ac_eye(626, 432, 19, 27))
    d.add(ell(512, 478, 15, 11, "#E4977A"), omega(512, 524, 32, 6, "#8B4A33"))
    d.add(cheek(316, 504, 44), cheek(708, 504, 44))
    return d.render("동글스님 — 동자승 (v2)", "모여봐요 동물의 숲 스타일의 동글동글한 동자승. 합장하고 염주를 걸었다.")


# ------------------------------------------------------------ 3. 다람이 (squirrel)
def squirrel():
    d = Doc("sq")
    B = d.grad("b", "#DE9150", "#B86A2E")
    BD = d.grad("bd", "#C97A3A", "#9A5424")
    BL = d.grad("bl", "#F0AE72", "#D98B4A")
    CR = d.grad("c", "#FFF6E0", "#F3DDB4")
    d.ground(480, 906, 280)
    d.add(fuzz(792, 560, 118, 262, BD, n=26, amp=12, seed=21, rot=20),
          fuzz(792, 560, 76, 208, BL, n=20, amp=9, seed=22, rot=20))
    for k, y in enumerate((420, 490, 560, 630)):
        d.add(f'<path d="M{712+k*3} {y} Q792 {y-22} {872-k*3} {y}" stroke="#B86A2E" stroke-width="15" fill="none" stroke-linecap="round" opacity=".65" transform="rotate(20 792 560)"/>')
    for cx in (402, 558):
        d.add(ell(cx, 886, 64, 32, BD))
    d.add(ell(480, 762, 168, 134, B), ell(480, 790, 106, 90, CR))
    # held acorn
    d.add(ell(480, 806, 38, 42, "#DDA663"),
          '<path d="M438 794 Q480 752 522 794 Q522 806 480 806 Q438 806 438 794Z" fill="#7A4B2A"/>',
          ell(432, 812, 28, 24, BD), ell(528, 812, 28, 24, BD))
    d.head_shadow(480, 690, 150)
    for cx, rot in ((316, -12), (644, 12)):
        d.add(ell(cx, 206, 60, 66, B, rot), ell(cx, 214, 30, 36, "#F2B07C", rot),
              f'<path d="M{cx-4} 150 Q{cx+2} 112 {cx+14} 146" stroke="#9A5424" stroke-width="14" fill="none" stroke-linecap="round"/>')
    d.add(ell(480, 420, 306, 252, B))
    for dx in (-52, 0, 52):
        d.add(f'<path d="M{480+dx} {172 + abs(dx)*0.35:.0f} V{234 + abs(dx)*0.2:.0f}" stroke="#9A5424" stroke-width="14" stroke-linecap="round" opacity=".7"/>')
    d.add(ell(480, 508, 152, 108, CR))
    d.add(ell(480, 474, 25, 18, DARK), ell(474, 468, 7, 4, "#fff", extra='opacity=".55"'))
    d.add(f'<path d="M480 490 V504" stroke="{DARK}" stroke-width="5" stroke-linecap="round"/>', omega(480, 504, 28))
    d.add('<rect x="467" y="514" width="26" height="30" rx="6" fill="#fff"/><path d="M480 514 V544" stroke="#D9C7A6" stroke-width="3"/>')
    d.add(ac_eye(372, 432), ac_eye(588, 432), cheek(298, 510), cheek(662, 510))
    d.add('<ellipse cx="370" cy="240" rx="96" ry="30" fill="#fff" opacity=".2" transform="rotate(-18 370 240)"/>')
    return d.render("다람이 — 다람쥐 (v2)", "모여봐요 동물의 숲 스타일 다람쥐. 도토리를 안고 큰 꼬리를 말았다.")


# -------------------------------------------------------------- 4. 토리 (acorn)
def acorn():
    d = Doc("ac")
    NUT = d.grad("n", "#F0C48A", "#D4994F")
    NUTD = d.grad("nd", "#DDA663", "#B97F3A")
    CAP = d.grad("cp", "#9A6338", "#6B4226")
    d.ground(512, 906, 250)
    for cx in (420, 604):
        d.add(ell(cx, 874, 64, 32, NUTD))
    d.add(ell(236, 660, 42, 62, NUTD, -20), ell(788, 660, 42, 62, NUTD, 20))
    d.add(ell(512, 612, 276, 258, NUT))
    d.add('<ellipse cx="400" cy="760" rx="86" ry="40" fill="#fff" opacity=".2" transform="rotate(-28 400 760)"/>')
    cap = "M206 504 C206 282 340 192 512 192 C684 192 818 282 818 504 C700 566 324 566 206 504 Z"
    d.defs.append(f'<clipPath id="accap"><path d="{cap}"/></clipPath>')
    d.add('<path d="M512 204 Q516 142 548 114" stroke="#5E3820" stroke-width="30" fill="none" stroke-linecap="round"/>',
          '<path d="M550 122 C600 42 712 58 738 98 C692 150 606 158 550 122 Z" fill="#8DB05C"/>',
          '<path d="M558 118 C612 96 672 94 716 102" stroke="#6E9340" stroke-width="6" fill="none" stroke-linecap="round"/>')
    d.add(f'<path d="{cap}" fill="{CAP}"/>', '<g clip-path="url(#accap)">')
    for r, y in enumerate((276, 332, 388, 444, 500, 556)):
        off = 0 if r % 2 == 0 else 34
        for c in range(11):
            x = 200 + c * 68 + off
            d.add(f'<path d="M{x-24} {y} Q{x} {y+28} {x+24} {y}" stroke="#9A6338" stroke-width="7" fill="none" stroke-linecap="round" opacity=".8"/>')
    d.add('<ellipse cx="372" cy="296" rx="92" ry="28" fill="#fff" opacity=".18" transform="rotate(-26 372 296)"/>', '</g>')
    d.add('<path d="M206 504 C324 566 700 566 818 504" fill="none" stroke="#5E3820" stroke-width="10" stroke-linecap="round" opacity=".5"/>')
    d.add(ac_eye(420, 622), ac_eye(604, 622), omega(512, 668, 24), cheek(348, 666, 36), cheek(676, 666, 36))
    return d.render("토리 — 도토리 (v2)", "모여봐요 동물의 숲 스타일 도토리 요정. 모자 위에 새싹 잎이 돋았다.")


# ------------------------------------------------------------ 5. 밤이 (owl)
def owl():
    d = Doc("ow")
    B = d.grad("b", "#A98764", "#7C5E42")
    BD = d.grad("bd", "#8A6A4C", "#5E452E")
    CR = d.grad("c", "#FFF3DA", "#EBD6AE")
    FC = d.grad("f", "#F6E7C8", "#E4CDA2")
    d.defs.append('<radialGradient id="owglow"><stop offset="0" stop-color="#FFD9A0" stop-opacity=".95"/>'
                  '<stop offset="1" stop-color="#FFD9A0" stop-opacity="0"/></radialGradient>')
    d.ground(470, 906, 270)
    for cx, rot in ((330, -26), (610, 26)):
        d.add(f'<ellipse cx="{cx}" cy="318" rx="58" ry="92" fill="{BD}" transform="rotate({rot} {cx} 318)"/>')
    d.add(ell(470, 606, 296, 272, B))
    d.add(ell(206, 650, 82, 164, BD, 10), ell(734, 650, 82, 164, BD, -10))
    d.add(ell(470, 724, 176, 150, CR))
    for r, y in enumerate((650, 706, 762, 818)):
        for c in range(-2, 3):
            x = 470 + c * 54 + (27 if r % 2 else 0)
            if abs(x - 470) < 140:
                d.add(f'<path d="M{x-16} {y} Q{x} {y+20} {x+16} {y}" stroke="#C9AE86" stroke-width="6" fill="none" stroke-linecap="round"/>')
    d.add(ell(384, 480, 122, 116, FC), ell(556, 480, 122, 116, FC))
    for cx in (384, 556):
        d.add(ell(cx, 486, 66, 72, "#fff"), ell(cx, 492, 46, 54, DARK),
              f'<circle cx="{cx-16}" cy="{466}" r="17" fill="#fff"/><circle cx="{cx+14}" cy="{516}" r="8" fill="#fff" opacity=".85"/>')
    d.add('<path d="M448 540 Q470 526 492 540 Q482 586 470 592 Q458 586 448 540Z" fill="#F2A03A" stroke="#F2A03A" stroke-width="6" stroke-linejoin="round"/>')
    d.add(cheek(292, 572, 30, .55), cheek(648, 572, 30, .55))
    for cx in (400, 540):
        for dx in (-22, 0, 22):
            d.add(ell(cx + dx, 884, 13, 22, "#F2A03A"))
    # lantern (연등)
    lx = 846
    d.add(f'<path d="M742 650 L{lx-10} 430" stroke="#6E4A2A" stroke-width="12" stroke-linecap="round"/>',
          f'<circle cx="{lx}" cy="526" r="124" fill="url(#owglow)"/>',
          f'<path d="M{lx} 430 V458" stroke="#6E4A2A" stroke-width="6"/>',
          ell(lx, 520, 56, 66, "#F59CB8"))
    for dx in (-26, 0, 26):
        d.add(f'<path d="M{lx+dx} 456 Q{lx+dx*1.9:.0f} 520 {lx+dx} 584" stroke="#E5789C" stroke-width="5" fill="none"/>')
    d.add(f'<rect x="{lx-20}" y="450" width="40" height="14" rx="6" fill="#6E4A2A"/><rect x="{lx-20}" y="576" width="40" height="14" rx="6" fill="#6E4A2A"/>')
    for dx in (-14, 0, 14):
        d.add(f'<path d="M{lx+dx} 590 V{618+abs(dx)}" stroke="#E5789C" stroke-width="5" stroke-linecap="round"/>')
    d.add(ell(734, 664, 40, 30, BD))
    return d.render("밤이 — 부엉이 (v2)", "모여봐요 동물의 숲 스타일 부엉이. 분홍 연등으로 밤길을 밝힌다.")


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
