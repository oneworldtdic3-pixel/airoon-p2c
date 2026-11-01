#!/usr/bin/env python3
"""Cyber 산사캠프 characters — v3: plush "flocked felt" texture + outfits.

Builds on v2 (chibi proportions, soft gradients) and adds, per the
Animal-Crossing-style key-art reference:
  - plush / flocked texture (feTurbulence speckle clipped to each shape)
  - fuzzy silhouettes and a soft rim light on the heads
  - two eye families: dark ovals (villager) and white+iris eyes (Nook / player)
  - outfits and props: neckerchief, leaf-print shirt, sprout, flag, straps
All characters are original; only the look/feel is referenced.
Writes SVGs to assets/characters/v3/svg/.
Run:  python3 tools/generate_characters_v3.py
"""
import math
import os

from generate_characters import fuzz, stripe, DARK
from generate_characters_v2 import Doc, ell, ac_eye, cheek, omega
from buddhz_logo import logo_group, KO_PATHS, KO_BBOX, LAT_PATHS, LAT_BBOX

OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "characters", "v3", "svg")


# ---------------------------------------------------------------- helpers
EXPRESSIONS = ("smile", "happy", "surprised", "wink")
POSES = ("stand", "wave", "jump")


class Doc3(Doc):
    """v2 Doc + plush texture, rim light, and expression/pose hooks.

    expr: smile (default) | happy (closed ^^ eyes, open mouth) | surprised | wink
    pose: stand (default) | wave (viewer-left arm raised, drawn in front) | jump
    """

    def __init__(self, p, expr="smile", pose="stand"):
        super().__init__(p)
        self.expr, self.pose = expr, pose
        self.shadow_el = ""   # ground shadow, emitted before the figure
        self.front = []       # elements drawn last (raised arm, etc.)
        self.defs.append(
            f'<filter id="{p}plush" filterUnits="userSpaceOnUse" x="-512" y="-512" width="2048" height="2048" '
            f'color-interpolation-filters="sRGB">'
            '<feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="7" result="n1"/>'
            '<feColorMatrix in="n1" type="matrix" values="0 0 0 0 1  0 0 0 0 .96  0 0 0 0 .88  2.6 0 0 0 -1.25" result="light"/>'
            '<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="21" result="n2"/>'
            '<feColorMatrix in="n2" type="matrix" values="0 0 0 0 .25  0 0 0 0 .13  0 0 0 0 .05  2.4 0 0 0 -1.2" result="dark"/>'
            '<feMerge result="m"><feMergeNode in="dark"/><feMergeNode in="light"/></feMerge>'
            '<feComposite in="m" in2="SourceAlpha" operator="in"/></filter>'
            f'<filter id="{p}rim" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>')

    def ground(self, cx, cy, rx):
        # tinted toward grass instead of grey; smaller + lighter when jumping
        k, op = (0.72, 0.14) if self.pose == "jump" else (1, 0.22)
        self.shadow_el = (f'<ellipse cx="{cx}" cy="{cy}" rx="{rx*k:.0f}" ry="{26*k:.0f}" fill="#3B5A2A" '
                          f'opacity="{op}" filter="url(#{self.p}soft)"/>')

    def arm(self, stand, wave):
        """Viewer-left arm: normal position, or raised + drawn in front when waving."""
        if self.pose == "wave":
            self.front.extend(wave)
        else:
            self.add(*stand)

    # ---- expression parts -------------------------------------------------
    def _closed(self, cx, cy, rx, ry, sw=7):
        return (f'<path d="M{cx-rx} {cy+6} Q{cx} {cy-ry*0.85:.0f} {cx+rx} {cy+6}" fill="none" '
                f'stroke="{DARK}" stroke-width="{sw}" stroke-linecap="round"/>')

    def eyes(self, lx, rx_, cy, rx=19, ry=27, style="oval", iris="#5B8FD6", lash=False):
        """Eye pair honoring self.expr. style: oval | iris | owl."""
        e = self.expr
        if style == "owl":
            open_ = lambda cx, k=1: (ell(cx, cy, 66*k, 72*k, "#fff") + ell(cx, cy+6, 46*k, 54*k, DARK)
                                     + f'<circle cx="{cx-16}" cy="{cy-20}" r="{17*k:.0f}" fill="#fff"/>'
                                     f'<circle cx="{cx+14}" cy="{cy+30}" r="8" fill="#fff" opacity=".85"/>')
            closed = lambda cx: self._closed(cx, cy + 10, 50, 40, 9)
        elif style == "iris":
            open_ = lambda cx, k=1, side=0: ac_eye_iris(cx, cy, rx*k, ry*k, iris, side, lash)
            closed = lambda cx: self._closed(cx, cy, rx + 6, ry)
        else:
            open_ = lambda cx, k=1: ac_eye(cx, cy, rx*k, ry*k)
            closed = lambda cx: self._closed(cx, cy, rx + 8, ry)
        if e == "happy":
            self.add(closed(lx), closed(rx_))
        elif e == "wink":
            self.add(open_(lx) if style != "iris" else open_(lx, 1, -1), closed(rx_))
        elif e == "surprised":
            k = 1.28
            self.add(open_(lx, k) if style != "iris" else open_(lx, k, -1),
                     open_(rx_, k) if style != "iris" else open_(rx_, k, 1))
        else:
            self.add(open_(lx) if style != "iris" else open_(lx, 1, -1),
                     open_(rx_) if style != "iris" else open_(rx_, 1, 1))

    def mouth(self, cx, cy, w=24, sw=5, color=DARK):
        e = self.expr
        if e == "happy":   # open laughing mouth with tongue
            self.add(f'<path d="M{cx-w} {cy-2} Q{cx} {cy+w*1.5:.0f} {cx+w} {cy-2} Z" fill="{DARK}" '
                     f'stroke="{DARK}" stroke-width="4" stroke-linejoin="round"/>',
                     f'<ellipse cx="{cx}" cy="{cy+w*0.75:.0f}" rx="{w*0.5:.0f}" ry="{w*0.38:.0f}" fill="#F08A9A"/>')
        elif e == "surprised":
            self.add(ell(cx, cy + 6, w * 0.42, w * 0.55, DARK))
        elif e == "wink":
            self.add(f'<path d="M{cx-w} {cy} Q{cx} {cy+w*0.9:.0f} {cx+w*1.1:.0f} {cy-6}" fill="none" '
                     f'stroke="{color}" stroke-width="{sw}" stroke-linecap="round"/>')
        else:
            self.add(omega(cx, cy, w, sw, color))

    def render(self, title, desc):
        body = "\n".join(self.b + self.front)
        if self.pose == "jump":
            body = '<g transform="translate(0 -70)">\n' + body + "\n</g>"
        suffix = f" · {self.expr} / {self.pose}"
        return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024" '
                f'role="img" aria-labelledby="{self.p}t {self.p}d">\n'
                f'<title id="{self.p}t">{title}{suffix}</title>\n<desc id="{self.p}d">{desc}</desc>\n'
                f'<defs>{"".join(self.defs)}</defs>\n{self.shadow_el}\n{body}\n</svg>\n')

    def plush(self, cx, cy, rx, ry, rot=0, op=0.85):
        tr = f' transform="rotate({rot} {cx} {cy})"' if rot else ""
        self.add(f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="#000" opacity="{op}" '
                 f'filter="url(#{self.p}plush)"{tr}/>')

    def rim(self, cx, cy, rx, ry, a1=198, a2=258, w=9, op=0.3):
        rx2, ry2 = rx - 12, ry - 12
        pt = lambda a: (cx + rx2 * math.cos(math.radians(a)), cy + ry2 * math.sin(math.radians(a)))
        (x1, y1), (x2, y2) = pt(a1), pt(a2)
        self.add(f'<path d="M{x1:.1f} {y1:.1f} A{rx2} {ry2} 0 0 1 {x2:.1f} {y2:.1f}" fill="none" stroke="#fff" '
                 f'stroke-width="{w}" stroke-linecap="round" opacity="{op}" filter="url(#{self.p}rim)"/>')


def leaf(cx, cy, s, rot, color, op=1):
    return (f'<path d="M0 0 C{s*.35:.1f} {-s*.5:.1f} {s*.9:.1f} {-s*.45:.1f} {s*1.2:.1f} 0 '
            f'C{s*.9:.1f} {s*.45:.1f} {s*.35:.1f} {s*.5:.1f} 0 0Z" fill="{color}" opacity="{op}" '
            f'transform="translate({cx} {cy}) rotate({rot})"/>')


def ac_eye_iris(cx, cy, rx=24, ry=30, iris="#5B8FD6", side=0, lash=False):
    """White-sclera eye with coloured iris (Nook / player style)."""
    ir = rx * 0.8
    cy2 = cy + ry * 0.1
    s = ell(cx, cy, rx, ry, "#fff", extra='stroke="#3A2A20" stroke-width="3" stroke-opacity=".55"')
    s += f'<circle cx="{cx}" cy="{cy2:.1f}" r="{ir:.1f}" fill="{iris}"/>'
    s += f'<circle cx="{cx}" cy="{cy2:.1f}" r="{ir*0.52:.1f}" fill="{DARK}"/>'
    s += f'<circle cx="{cx - ir*0.35:.1f}" cy="{cy2 - ir*0.4:.1f}" r="{ir*0.3:.1f}" fill="#fff"/>'
    s += f'<circle cx="{cx + ir*0.38:.1f}" cy="{cy2 + ir*0.4:.1f}" r="{ir*0.14:.1f}" fill="#fff" opacity=".85"/>'
    if lash and side:
        for k, (a, b) in enumerate(((0.95, 0.5), (0.85, 0.82))):
            x1, y1 = cx + side * rx * a, cy - ry * b
            s += (f'<path d="M{x1:.1f} {y1:.1f} L{x1 + side*13:.1f} {y1 - 9 - k*3:.1f}" stroke="{DARK}" '
                  f'stroke-width="4" stroke-linecap="round"/>')
    return s


# ------------------------------------------------------------ 1. 산사 (cat)
def sansa(expr="smile", pose="stand"):
    d = Doc3("sa", expr, pose)
    O = d.grad("o", "#FFB45E", "#E8832A")
    OD = d.grad("od", "#F59A48", "#D9691C")
    CR = d.grad("c", "#FFF8E8", "#F5E0B8")
    mx = lambda x: 1024 - x
    d.ground(512, 904, 280)
    tail = "M610 810 C900 850 970 610 902 430"
    d.add(f'<path d="{tail}" fill="none" stroke="{O}" stroke-width="64" stroke-linecap="round"/>',
          f'<path d="{tail}" fill="none" stroke="{DARK}" stroke-width="64" stroke-dasharray="14 44" stroke-dashoffset="-10"/>',
          f'<circle cx="902" cy="430" r="32" fill="{DARK}"/>')
    for cx in (424, 600):
        d.add(ell(cx, 884, 68, 34, OD))
    d.add(ell(512, 762, 178, 132, O))
    d.plush(512, 762, 176, 130)
    d.add(ell(512, 792, 106, 90, CR))  # belly stays clean (no speckle)
    d.add(ell(674, 762, 44, 66, OD, -18))
    d.arm([ell(350, 762, 44, 66, OD, 18)],
          [ell(246, 612, 44, 66, OD, -52), ell(202, 544, 34, 30, OD)])
    # camp neckerchief with leaf badge
    d.add('<path d="M392 660 Q512 706 632 660 L512 784 Z" fill="#46B8A8" stroke="#46B8A8" stroke-width="12" stroke-linejoin="round"/>',
          '<path d="M392 660 Q512 706 632 660" fill="none" stroke="#2F9C8D" stroke-width="8" stroke-linecap="round" opacity=".6"/>',
          leaf(498, 742, 30, -20, "#E8F7C8"))
    d.head_shadow(512, 690, 150)
    for f in (lambda x: x, mx):
        d.add(f'<path d="M{f(262)} 340 Q{f(232)} 186 {f(292)} 142 Q{f(386)} 166 {f(446)} 246 Z" fill="{OD}" stroke="{OD}" stroke-width="14" stroke-linejoin="round"/>',
              f'<path d="M{f(292)} 306 Q{f(278)} 214 {f(302)} 188 Q{f(352)} 204 {f(396)} 256 Z" fill="#F8B890"/>')
    # cheek fur tufts (behind head)
    for f in (lambda x: x, mx):
        d.add(stripe(f(228), 546, f(186), 566, 44, "#F59A48"), stripe(f(262), 590, f(222), 614, 40, "#F59A48"))
    d.add(fuzz(512, 430, 322, 262, O, n=80, amp=7, seed=5))
    d.plush(512, 430, 318, 258)
    for x, y2, w in ((512, 252, 34), (442, 246, 26), (582, 246, 26)):
        d.add(stripe(x, 176, x, y2, w))
    for y, l in ((372, 80), (432, 84), (492, 76)):
        d.add(stripe(194, y, 194 + l, y + 6, 26), stripe(830, y, 830 - l, y + 6, 26))
    d.add(ell(512, 524, 132, 84, CR))
    d.add('<path d="M490 476 Q512 466 534 476 Q528 500 512 506 Q496 500 490 476Z" fill="#D9737A" stroke="#D9737A" stroke-width="6" stroke-linejoin="round"/>')
    d.add(f'<path d="M512 506 V520" stroke="{DARK}" stroke-width="5" stroke-linecap="round"/>')
    d.mouth(512, 520, 26)
    d.eyes(392, 632, 440)
    d.add(cheek(320, 506), cheek(704, 506))
    d.rim(512, 430, 322, 262)
    return d.render("산사 — 고양이 (v3)", "플러시 질감과 캠프 스카프를 더한 주황 줄무늬 고양이 산사.")


# ----------------------------------------------------------------- 2. 동글스님
def monk(expr="smile", pose="stand"):
    d = Doc3("mk", expr, pose)
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
    # leaf print on the robe
    for x, y, r in ((352, 836, -20), (432, 862, 15), (590, 864, 165), (668, 838, 200), (330, 760, -40), (690, 762, 220)):
        d.add(leaf(x, y, 28, r, "#C9DDB0", .85))
    d.add(ell(610, 776, 60, 74, RL, -28))
    d.arm([ell(414, 776, 60, 74, RL, 28)],
          [ell(322, 640, 60, 74, RL, -48), ell(280, 572, 30, 34, SK)])
    for i in range(11):
        t = i / 10
        x = (1 - t) ** 2 * 404 + 2 * (1 - t) * t * 512 + t ** 2 * 620
        y = (1 - t) ** 2 * 676 + 2 * (1 - t) * t * 810 + t ** 2 * 676
        d.add(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="13" fill="#7B4B2A"/><circle cx="{x-3.5:.1f}" cy="{y-4:.1f}" r="3.5" fill="#fff" opacity=".4"/>')
    if pose != "wave":  # prayer hands only when both hands are free
        d.add(f'<path d="M512 694 Q556 730 550 796 Q512 814 474 796 Q468 730 512 694 Z" fill="{SK}"/>',
              '<path d="M512 708 V800" stroke="#E4A47C" stroke-width="5" stroke-linecap="round"/>')
    d.head_shadow(512, 692, 160)
    d.add(ell(216, 430, 46, 52, SK), ell(808, 430, 46, 52, SK),
          ell(216, 432, 22, 28, "#E9A07A", extra='opacity=".55"'), ell(808, 432, 22, 28, "#E9A07A", extra='opacity=".55"'))
    # sprout on the bald head
    d.add('<path d="M512 156 Q516 124 514 100" stroke="#6E9340" stroke-width="12" fill="none" stroke-linecap="round"/>',
          leaf(514, 108, 52, -28, "#8DB05C"), leaf(512, 114, 46, -152, "#7BA14B"))
    d.add(ell(512, 410, 300, 265, SK))
    d.add('<ellipse cx="400" cy="232" rx="96" ry="34" fill="#fff" opacity=".22" transform="rotate(-20 400 232)"/>')
    d.add(f'<path d="M352 358 Q404 326 458 350" stroke="{DARK}" stroke-width="13" stroke-linecap="round" fill="none"/>',
          f'<path d="M566 350 Q620 326 672 358" stroke="{DARK}" stroke-width="13" stroke-linecap="round" fill="none"/>')
    d.eyes(398, 626, 436, 25, 31, "iris", "#7A5236", True)
    d.add(ell(512, 480, 15, 11, "#E4977A"))
    d.mouth(512, 526, 32, 6, "#8B4A33")
    d.add(cheek(316, 506, 44), cheek(708, 506, 44))
    d.rim(512, 410, 300, 265)
    return d.render("동글스님 — 동자승 (v3)", "정수리에 새싹이 돋고 잎사귀 승복을 입은 동자승.")


# ------------------------------------------------------------ 3. 다람이 (squirrel)
def squirrel(expr="smile", pose="stand"):
    d = Doc3("sq", expr, pose)
    B = d.grad("b", "#DE9150", "#B86A2E")
    BD = d.grad("bd", "#C97A3A", "#9A5424")
    BL = d.grad("bl", "#F0AE72", "#D98B4A")
    CR = d.grad("c", "#FFF6E0", "#F3DDB4")
    T = d.grad("tl", "#7ED3C4", "#3FA898")  # not "t": collides with <title id="sqt">
    d.ground(480, 906, 280)
    d.add(fuzz(792, 560, 118, 262, BD, n=26, amp=12, seed=21, rot=20),
          fuzz(792, 560, 76, 208, BL, n=20, amp=9, seed=22, rot=20))
    d.plush(792, 560, 112, 256, 20)
    for k, y in enumerate((420, 490, 560, 630)):
        d.add(f'<path d="M{712+k*3} {y} Q792 {y-22} {872-k*3} {y}" stroke="#B86A2E" stroke-width="15" fill="none" stroke-linecap="round" opacity=".65" transform="rotate(20 792 560)"/>')
    for cx in (402, 558):
        d.add(ell(cx, 886, 64, 32, BD))
    # leaf-print aloha-style shirt
    d.add(ell(630, 770, 50, 64, T, -18), ell(480, 762, 170, 134, T))
    d.arm([ell(330, 770, 50, 64, T, 18)],
          [ell(254, 646, 50, 64, T, -50), ell(212, 578, 30, 28, BD)])
    for x, y, r in ((378, 740, -20), (572, 744, 160), (350, 812, 20), (610, 816, 200), (432, 866, -10), (532, 866, 170)):
        d.add(leaf(x, y, 28, r, "#C8F0E6", .85))
    d.add('<path d="M444 690 L480 742 L420 716Z M516 690 L480 742 L540 716Z" fill="#F4FFFB"/>')
    d.add(ell(480, 806, 38, 42, "#DDA663"),
          '<path d="M438 794 Q480 752 522 794 Q522 806 480 806 Q438 806 438 794Z" fill="#7A4B2A"/>',
          ell(432, 814, 28, 24, BD), ell(528, 814, 28, 24, BD))
    d.head_shadow(480, 690, 150)
    for cx, rot in ((316, -12), (644, 12)):
        d.add(ell(cx, 206, 60, 66, B, rot), ell(cx, 214, 30, 36, "#F2B07C", rot),
              f'<path d="M{cx-4} 150 Q{cx+2} 112 {cx+14} 146" stroke="#9A5424" stroke-width="14" fill="none" stroke-linecap="round"/>')
    d.add(fuzz(480, 420, 306, 252, B, n=76, amp=7, seed=31))
    d.plush(480, 420, 302, 248)
    for dx in (-52, 0, 52):
        d.add(f'<path d="M{480+dx} {172 + abs(dx)*0.35:.0f} V{234 + abs(dx)*0.2:.0f}" stroke="#9A5424" stroke-width="14" stroke-linecap="round" opacity=".7"/>')
    # dark eye patches + blue-iris eyes
    d.add(ell(372, 440, 56, 64, "#5A3320", -12, 'opacity=".92"'), ell(588, 440, 56, 64, "#5A3320", 12, 'opacity=".92"'))
    d.add(ell(480, 508, 150, 104, CR))
    d.add(ell(480, 474, 25, 18, DARK), ell(474, 468, 7, 4, "#fff", extra='opacity=".55"'))
    d.add(f'<path d="M480 490 V504" stroke="{DARK}" stroke-width="5" stroke-linecap="round"/>')
    d.mouth(480, 504, 28)
    d.add('<rect x="467" y="514" width="26" height="30" rx="6" fill="#fff"/><path d="M480 514 V544" stroke="#D9C7A6" stroke-width="3"/>')
    d.eyes(372, 588, 436, 24, 30, "iris", "#5B8FD6")
    d.add(cheek(298, 520), cheek(662, 520))
    d.rim(480, 420, 306, 252)
    return d.render("다람이 — 다람쥐 (v3)", "잎사귀 무늬 알로하 셔츠를 입고 눈 주위 패치가 있는 플러시 다람쥐.")


# -------------------------------------------------------------- 4. 토리 (acorn)
def acorn(expr="smile", pose="stand"):
    d = Doc3("ac", expr, pose)
    NUT = d.grad("n", "#F0C48A", "#D4994F")
    NUTD = d.grad("nd", "#DDA663", "#B97F3A")
    CAP = d.grad("cp", "#9A6338", "#6B4226")
    d.ground(512, 906, 250)
    for cx in (420, 604):
        d.add(ell(cx, 874, 64, 32, NUTD))
    d.arm([ell(236, 660, 42, 62, NUTD, -20)],
          [ell(222, 540, 42, 62, NUTD, -52), ell(190, 478, 28, 26, NUTD)])
    d.add(ell(512, 612, 276, 258, NUT))
    d.plush(512, 612, 272, 254)
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
    d.plush(512, 380, 300, 180, 0, .6)
    d.add('<path d="M206 504 C324 566 700 566 818 504" fill="none" stroke="#5E3820" stroke-width="10" stroke-linecap="round" opacity=".5"/>')
    d.eyes(420, 604, 622)
    d.mouth(512, 668, 24)
    d.add(cheek(348, 666, 36), cheek(676, 666, 36))
    # right arm in front, holding a leaf-emblem flag
    d.add(ell(788, 664, 42, 62, NUTD, 20),
          '<path d="M800 676 L822 352" stroke="#7A4B2A" stroke-width="11" stroke-linecap="round"/>',
          '<path d="M824 358 L930 398 L824 448 Z" fill="#F2793A" stroke="#F2793A" stroke-width="8" stroke-linejoin="round"/>',
          leaf(846, 404, 30, -8, "#FFF3DA"),
          ell(802, 676, 30, 28, NUTD))
    d.rim(512, 612, 276, 258, 200, 250, 8, .35)
    return d.render("토리 — 도토리 (v3)", "플러시 질감 도토리 요정. 잎사귀 깃발을 들고 있다.")


# ------------------------------------------------------------ 5. 밤이 (owl)
def owl(expr="smile", pose="stand"):
    d = Doc3("ow", expr, pose)
    B = d.grad("b", "#A98764", "#7C5E42")
    BD = d.grad("bd", "#8A6A4C", "#5E452E")
    CR = d.grad("c", "#FFF3DA", "#EBD6AE")
    FC = d.grad("f", "#F6E7C8", "#E4CDA2")
    d.defs.append('<radialGradient id="owglow"><stop offset="0" stop-color="#FFD9A0" stop-opacity=".95"/>'
                  '<stop offset="1" stop-color="#FFD9A0" stop-opacity="0"/></radialGradient>')
    d.ground(470, 906, 270)
    for cx, rot in ((330, -26), (610, 26)):
        d.add(f'<ellipse cx="{cx}" cy="318" rx="58" ry="92" fill="{BD}" transform="rotate({rot} {cx} 318)"/>')
        d.plush(cx, 318, 56, 90, rot, .7)
    d.add(fuzz(470, 606, 296, 272, B, n=64, amp=12, seed=53))
    d.plush(470, 606, 290, 266)
    d.add(ell(734, 650, 82, 164, BD, -10))
    d.plush(734, 650, 80, 162, -10, .7)
    d.arm([ell(206, 650, 82, 164, BD, 10)], [ell(232, 498, 82, 164, BD, -42)])
    if pose != "wave":
        d.plush(206, 650, 80, 162, 10, .7)
    d.add(ell(470, 724, 176, 150, CR))
    for r, y in enumerate((650, 706, 762, 818)):
        for c in range(-2, 3):
            x = 470 + c * 54 + (27 if r % 2 else 0)
            if abs(x - 470) < 140:
                d.add(f'<path d="M{x-16} {y} Q{x} {y+20} {x+16} {y}" stroke="#C9AE86" stroke-width="6" fill="none" stroke-linecap="round"/>')
    # backpack straps
    for x1, x2 in ((366, 410), (574, 530)):
        d.add(f'<path d="M{x1} 612 L{x2} 842" stroke="#D9534F" stroke-width="24" stroke-linecap="round"/>',
              f'<path d="M{x1-6} 612 L{x2-6} 842" stroke="#F07A74" stroke-width="5" stroke-linecap="round" opacity=".7"/>')
    for x in (391, 549):
        d.add(f'<rect x="{x-14}" y="740" width="28" height="20" rx="5" fill="#E8C26A"/>')
    d.add(ell(384, 480, 122, 116, FC), ell(556, 480, 122, 116, FC))
    d.eyes(384, 556, 486, style="owl")
    d.add('<path d="M448 540 Q470 526 492 540 Q482 586 470 592 Q458 586 448 540Z" fill="#F2A03A" stroke="#F2A03A" stroke-width="6" stroke-linejoin="round"/>')
    d.add(cheek(292, 572, 30, .55), cheek(648, 572, 30, .55))
    for cx in (400, 540):
        for dx in (-22, 0, 22):
            d.add(ell(cx + dx, 884, 13, 22, "#F2A03A"))
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
    d.rim(470, 606, 296, 272, 200, 250)
    return d.render("밤이 — 부엉이 (v3)", "깃털 질감에 배낭끈을 멘 부엉이. 분홍 연등으로 밤길을 밝힌다.")


# ----------------------------------------------------------- 6. 둥실이 (balloon)
def balloon(expr="smile", pose="stand"):
    """Hot-air balloon with the camp's green/orange/yellow geometric patchwork.
    No arms: a passenger's mitten hands peek out of the basket (one waves)."""
    d = Doc3("bl", expr, pose)
    G1, G2, G3 = "#5BB847", "#2E8B3A", "#9BD35A"
    OR, YL, CR = "#F26B2B", "#F5C842", "#FBF1D2"
    env = "M512 64 C842 64 862 468 648 672 L606 732 L418 732 L376 672 C162 468 182 64 512 64 Z"
    d.defs.append(f'<clipPath id="blenv"><path d="{env}"/></clipPath>')
    d.defs.append('<radialGradient id="blglow"><stop offset="0" stop-color="#FFE08A" stop-opacity=".9"/>'
                  '<stop offset="1" stop-color="#FFE08A" stop-opacity="0"/></radialGradient>')
    d.ground(512, 906, 190)
    # ropes + burner glow behind the basket
    for x1, x2 in ((430, 448), (594, 576)):
        d.add(f'<path d="M{x1} 728 L{x2} 800" stroke="#6E4A2A" stroke-width="7" stroke-linecap="round"/>')
    d.add('<circle cx="512" cy="770" r="86" fill="url(#blglow)"/>',
          '<path d="M488 790 Q512 716 536 790 Q512 772 488 790Z" fill="#F7A531"/>',
          '<path d="M498 790 Q512 742 526 790 Q512 778 498 790Z" fill="#FFE27A"/>')
    # envelope: base + patchwork clipped to it
    d.add(f'<path d="{env}" fill="{d.grad("g", "#8FD460", G1)}"/>', '<g clip-path="url(#blenv)">')
    pal = (G2, OR, YL, G3, G1, OR)
    k = 0
    for row, y in enumerate(range(40, 760, 90)):
        off = 45 if row % 2 else 0
        for x in range(120 - off, 940, 90):
            c1, c2 = pal[k % 6], pal[(k * 5 + 2) % 6]
            k += 1
            if (row + x // 90) % 3 == 0:      # split cell: two triangles
                d.add(f'<path d="M{x} {y} L{x+90} {y} L{x} {y+90}Z" fill="{c1}"/>',
                      f'<path d="M{x+90} {y} L{x+90} {y+90} L{x} {y+90}Z" fill="{c2}"/>')
            elif (row + x // 90) % 3 == 1:    # cell with a small centred diamond
                d.add(f'<rect x="{x}" y="{y}" width="90" height="90" fill="{c1}"/>',
                      f'<path d="M{x+45} {y+14} L{x+76} {y+45} L{x+45} {y+76} L{x+14} {y+45}Z" fill="{c2}"/>')
            else:
                d.add(f'<rect x="{x}" y="{y}" width="90" height="90" fill="{c1}"/>')
    # gores: soft vertical seams so it reads as a balloon, plus a light sheen
    for x in (300, 406, 512, 618, 724):
        d.add(f'<path d="M{x} 60 Q{x} 400 {512 + (x-512)*0.45:.0f} 736" stroke="#1F5E27" stroke-width="5" fill="none" opacity=".35"/>')
    d.add('<ellipse cx="370" cy="200" rx="110" ry="46" fill="#fff" opacity=".22" transform="rotate(-28 370 200)"/>')
    d.plush(512, 380, 330, 330, 0, .22)  # light (nylon, not fur), clipped to the envelope
    d.add('</g>')
    # neck band
    d.add('<path d="M376 672 Q512 712 648 672" stroke="#1F5E27" stroke-width="14" fill="none" stroke-linecap="round" opacity=".6"/>')
    # face (on the envelope, slightly below centre)
    d.add(ell(512, 470, 150, 108, CR, extra='stroke="#1F5E27" stroke-width="5" stroke-opacity=".35"'))
    d.eyes(438, 586, 448)
    d.mouth(512, 512, 26)
    d.add(cheek(380, 500, 34), cheek(644, 500, 34))
    d.rim(512, 380, 330, 320, 200, 250, 9, .3)
    # basket (wicker) with a passenger's mitten hands
    d.add('<rect x="432" y="796" width="160" height="84" rx="18" fill="#B57A3E"/>',
          '<rect x="432" y="796" width="160" height="20" rx="10" fill="#8C5A2B"/>')
    for y in (834, 854):
        d.add(f'<path d="M444 {y} H580" stroke="#8C5A2B" stroke-width="5" stroke-linecap="round" opacity=".7"/>')
    for x in (470, 512, 554):
        d.add(f'<path d="M{x} 818 V874" stroke="#8C5A2B" stroke-width="4" opacity=".4"/>')
    d.add(ell(598, 814, 30, 24, CR))
    d.arm([ell(426, 814, 30, 24, CR)],
          [f'<path d="M436 808 L334 712" stroke="{CR}" stroke-width="26" stroke-linecap="round"/>', ell(318, 690, 34, 30, CR)])
    return d.render("둥실이 — 열기구 (v3)", "산사캠프 패치워크 외피에 얼굴이 있는 열기구. 바구니에서 작은 손이 인사한다.")


# -------------------------------------------------------- 7. 붓쯔부스 (pop-up booth)
def booth(expr="smile", pose="stand"):
    """BUDDHZ pop-up booth as a character, after the tomato-stand reference:
    wooden posts, brand-green header with the 붓쯔 wordmark, scalloped awning,
    bunting, and a counter whose front panel is the face. Mitten hands rest on
    the countertop; the left one rises to wave."""
    d = Doc3("bt", expr, pose)
    G, GD, GL = "#1E9771", "#157A5A", "#5FC49C"
    W, WD = "#DDAA6E", "#B8844A"
    CR, YL = "#FBF3E0", "#F4B942"
    GG = d.grad("g", "#2FB088", G)
    d.ground(512, 908, 340)
    # posts
    for x in (150, 830):
        d.add(f'<rect x="{x}" y="200" width="44" height="690" rx="16" fill="{W}"/>',
              f'<rect x="{x+8}" y="210" width="10" height="670" rx="5" fill="#fff" opacity=".28"/>')
    # bunting between the posts
    d.add(f'<path d="M194 412 Q512 470 830 412" stroke="{WD}" stroke-width="5" fill="none"/>')
    for i in range(7):
        t = (i + 0.5) / 7
        x = 194 + (830 - 194) * t
        y = (1 - t) ** 2 * 412 + 2 * (1 - t) * t * 441 + t ** 2 * 412
        c = (G, CR, YL)[i % 3]
        d.add(f'<path d="M{x-26:.0f} {y:.0f} L{x+26:.0f} {y:.0f} L{x:.0f} {y+52:.0f}Z" fill="{c}" stroke="{c}" stroke-width="4" stroke-linejoin="round"/>')
    # counter
    d.add(f'<rect x="170" y="562" width="684" height="318" rx="26" fill="{GG}"/>',
          f'<rect x="196" y="590" width="632" height="262" rx="18" fill="none" stroke="{CR}" stroke-width="5" opacity=".45"/>')
    d.add(logo_group(LAT_PATHS, LAT_BBOX, 512, 848, 240, "#fff"))
    d.add(ell(512, 702, 172, 118, CR, extra=f'stroke="{GD}" stroke-width="6" stroke-opacity=".5"'))
    d.eyes(438, 586, 684)
    d.mouth(512, 744, 26)
    d.add(cheek(376, 740, 34), cheek(648, 740, 34))
    # countertop (wood) + hands resting on it
    d.add(f'<rect x="146" y="536" width="732" height="42" rx="14" fill="{W}"/>',
          f'<path d="M180 556 H844" stroke="{WD}" stroke-width="3" opacity=".5"/>')
    mitt = lambda cx, cy, k=1, side=1: (ell(cx, cy, 36*k, 28*k, GL, extra=f'stroke="{GD}" stroke-width="4"')
                                        + ell(cx + side*26*k, cy - 14*k, 14*k, 12*k, GL, extra=f'stroke="{GD}" stroke-width="4"'))
    d.add(mitt(724, 534, 1, 1))
    d.arm([mitt(300, 534, 1, -1)],
          [f'<path d="M304 540 L236 420" stroke="{GD}" stroke-width="30" stroke-linecap="round"/>', mitt(226, 396, 1.1, -1)])
    # header: roof beam, green board with inset frame, Korean wordmark, scalloped awning
    d.add(f'<rect x="100" y="116" width="824" height="24" rx="10" fill="{WD}"/>',
          f'<rect x="120" y="132" width="784" height="232" rx="28" fill="{GG}"/>',
          f'<rect x="138" y="150" width="748" height="196" rx="18" fill="none" stroke="{CR}" stroke-width="5" opacity=".55"/>')
    d.add(logo_group(KO_PATHS, KO_BBOX, 512, 248, 380, "#fff"))
    d.add(f'<rect x="120" y="356" width="784" height="22" fill="{CR}"/>')
    for i in range(8):
        cx = 169 + i * 98
        d.add(f'<path d="M{cx-49} 370 A49 49 0 0 0 {cx+49} 370Z" fill="{CR if i % 2 else G}" stroke="{GD}" stroke-width="3" stroke-opacity=".35"/>')
    d.add(f'<rect x="120" y="364" width="784" height="8" fill="{GD}" opacity=".35"/>')
    return d.render("붓쯔부스 — 팝업 부스 (v3)", "BUDDHZ 팝업 부스 캐릭터. 녹색 간판에 붓쯔 로고, 카운터 앞판이 얼굴이다.")


CHARACTERS = {
    "sansa-cat": sansa,
    "dongeul-monk": monk,
    "daram-squirrel": squirrel,
    "tori-acorn": acorn,
    "bami-owl": owl,
    "dungsil-balloon": balloon,
    "buddhz-booth": booth,
}

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for name, fn in CHARACTERS.items():
        path = os.path.join(OUT, f"{name}.svg")
        with open(path, "w", encoding="utf-8") as f:
            f.write(fn())
        print("wrote", os.path.normpath(path))
