#!/usr/bin/env python3
"""Expression / pose variants of the v3 character set.

For every character writes:
  - all 4 expressions in the stand pose      ({name}--{expr}--stand.svg)
  - wave and jump poses with the happy face  ({name}--happy--{pose}.svg)
into assets/characters/v3/variants/svg/.  Render with node tools/render_variants.js
Run:  python3 tools/generate_variants.py
"""
import os

from generate_characters_v3 import CHARACTERS, EXPRESSIONS

OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "characters", "v3", "variants", "svg")

VARIANTS = [(e, "stand") for e in EXPRESSIONS] + [("happy", "wave"), ("happy", "jump")]

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for name, fn in CHARACTERS.items():
        for expr, pose in VARIANTS:
            path = os.path.join(OUT, f"{name}--{expr}--{pose}.svg")
            with open(path, "w", encoding="utf-8") as f:
                f.write(fn(expr, pose))
    print(f"wrote {len(CHARACTERS) * len(VARIANTS)} variants to {os.path.normpath(OUT)}")
