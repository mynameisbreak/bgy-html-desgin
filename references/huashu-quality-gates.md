# Huashu Quality Gates for BGY HTML Decks

This checklist adapts huashu-design to BGY service report decks.
Use it for brand HTML decks and PPTX handoff.

## A. PPTX Handoff Compatibility

When the HTML deck will later become editable PPTX:

- Keep the HTML slide canvas at `1280 x 720`.
- Hand off to `pptx-design` with `--width 1280 --height 720`.
- Expected PPTX output is standard wide `13.333 x 7.5` inches.
- Do not switch to `960 x 540` or `10 x 5.625`; copied content will look smaller in company templates.
- Use `"Microsoft YaHei", "微软雅黑", Arial, sans-serif` as the default HTML font for all text, including numbers and table labels.
- `pptx-design` follows the HTML computed font by default; use `--force-font-face` only when the user explicitly wants to override the HTML font.
- Keep text in real DOM text elements, not screenshot-only layers.
- Keep tables as semantic HTML tables where possible so `pptx-design` can convert them to native PPT tables.
- Keep ordinary cards, panels, dividers, circles, status tags, metric boxes, and callouts as native-convertible DOM/CSS; do not mark them with `data-ppt-component`.
- Keep simple inline SVG icons primitive-based so `pptx-design` can convert them to native icon shapes. Complex SVG/filter/mask/canvas modules are explicit screenshot exceptions only.
- For multi-file BGY decks, use `export_bgy_pptx.mjs --slides-dir <project>/slides`; do not convert the iframe-based `index.html` overview into PPTX.
- Use `--mode draft` for fast layout iteration, `--mode normal` for normal conversion, and `--mode final` only for delivery audit.
- Final PPTX handoff should pass `audit-pptx --strict` with high text lift, no unintended large image coverage, no high snapshot coverage, and no icon fallback unless explicitly accepted.

## C. Brand Asset And Component Discipline

Asset-first rules:

- BGY logo and watermark must use the built-in image assets or user-provided official replacements.
- Do not redraw BGY logo, partner logos, equipment, buildings, site photos, or product screenshots with CSS/SVG.
- If required assets are missing, use an honest placeholder labeled `待补素材`.
- Do not fabricate photos, customer quotes, KPI screenshots, or operational data.
- Record project-specific assets in `asset-spec.md`.

Recommended `asset-spec.md`:

```markdown
# Asset Spec

- Project:
- Source owner:
- Logo files:
- Site/equipment photos:
- System screenshots:
- Data sources:
- Color/font requirements:
- Forbidden uses:
- Missing assets:
```

Component rules:

- Every module must serve a report task: conclusion, evidence, status, risk, comparison, timeline, responsibility, or action.
- Prefer tables, status tags, metric rows, risk callouts, timelines, and evidence blocks.
- Avoid decorative icon grids and repeated cards that only fill empty space.
- Use red only for real risk, overdue, negative variance, or urgent coordination.
- If a page feels empty, improve composition; do not add filler stats or generic icons.

## D. Delivery Review And Anti-Slop Gate

Score each deck before delivery:

| Dimension | Passing Standard |
|---|---|
| Brand consistency | Looks like a BGY management report, not a generic web page or tech launch deck. |
| Visual hierarchy | Title, key number, evidence, and next action are clear at a glance. |
| Craft quality | Alignment, spacing, tables, font sizes, and colors are consistent. |
| Functionality | Every element helps the business message. |
| Originality | Avoids generic AI decoration and template sameness. |

Any score below `7/10` requires a repair pass.

Anti-slop checks:

- No purple/blue AI gradients unless required by a provided brand system.
- No emoji bullets or emoji section labels.
- No fake SVG hero illustrations for real sites, people, equipment, buildings, or products.
- No made-up metrics, quotes, screenshots, or project images.
- No icon on every bullet.
- No bento/card grid used only to fill space.
- No generic dark SaaS palette for BGY reports.

Repair order:

1. Fix factual, data, and asset problems.
2. Fix HTML/PPTX handoff size, native object routing, editable text, and large screenshot problems.
3. Fix overflow, unreadable tables, low contrast, and blocked logo/watermark.
4. Remove filler content and decorative slop.
5. Tighten alignment, spacing, and repeated component rhythm.
