---
name: awesome-design-md
description: Apply a brand design system from the Awesome DESIGN.md collection (VoltAgent/awesome-design-md) when building or restyling UI. Use when the user asks for UI that "looks like Claude" (or another listed brand), asks to apply a DESIGN.md, or wants consistent, production-grade visual styling for web pages, components, dashboards, or PWAs.
---

# Awesome DESIGN.md

This skill ships ready-to-use DESIGN.md files extracted from real brand websites
(source: https://github.com/VoltAgent/awesome-design-md). A DESIGN.md is a plain
markdown design-system spec (Google Stitch format): color tokens, typography scale,
component rules, spacing, elevation, do/don't guardrails, and an agent prompt guide.

## Installed design systems

| Brand  | File                          | Feel |
| ------ | ----------------------------- | ---- |
| Claude | `design-md/claude/DESIGN.md` | Warm cream canvas, serif display headlines, coral (#cc785c) CTAs, dark navy product surfaces |

Default: **Claude**. If the user names a different brand, check the table first; if it
is not installed, fetch it from
`https://raw.githubusercontent.com/VoltAgent/awesome-design-md/main/design-md/<brand>/DESIGN.md`
and save it under `design-md/<brand>/DESIGN.md` in this skill folder, then add a row above.
Available brand slugs include: claude, notion, stripe, apple, vercel, linear.app, figma,
lovable, supabase, airbnb, nike, spotify, tesla, and ~60 more (see the repo README).

## Workflow

1. Read the chosen DESIGN.md fully before writing any UI code. Do not rely on memory of the brand.
2. If the project root does not already contain a DESIGN.md, copy the chosen one to
   `./DESIGN.md` so future sessions and other agents pick it up automatically.
3. Build UI strictly from the tokens in the file:
   - Use the exact hex values from `colors` (define them as CSS variables / Tailwind theme tokens; never invent new colors).
   - Follow the `typography` scale (font family, size, weight, line-height, letter-spacing) for every text role.
   - Follow component rules (buttons, inputs, cards, nav) including hover/active/disabled states.
   - Respect spacing scale, border radius, shadow/elevation rules, and responsive breakpoints.
4. Check the "Do's and Don'ts" section and self-review the output against it before finishing.
5. When the brand fonts are proprietary (e.g. Copernicus, StyreneB), use the listed fallbacks
   (Tiempos Headline / serif, Inter / sans-serif) and say so.

## Scope notes

- These files describe publicly visible CSS values; they are inspiration for consistent UI,
  not a license to reproduce a brand's logo or identity. Do not copy logos or wordmarks.
- Dark mode: use the `surface-dark*` / `on-dark*` tokens defined in the file rather than
  inventing a separate palette.
