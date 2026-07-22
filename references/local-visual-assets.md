# Local Visual Assets

This skill includes a small local icon and SVG system for BGY-style PPT pages. Use it before reaching for remote icon CDNs or ad-hoc SVG drawing.

## Asset Folders

```text
assets/icons/line/          Simple line icons for native PPT icon conversion
assets/icons/solid/         Filled status icons for compact labels and alerts
assets/icons/bgy-business/  Property-management business icons
assets/icons/inline/        Sprite sheet for copy/paste inline use
assets/svg/diagrams/        Process arrows, loops, timeline axes, matrix frames
assets/svg/patterns/        Restrained background/corner patterns
assets/svg/empty-states/    Missing material, no data, screenshot placeholders
assets/icon-gallery.html    Local gallery and copy reference
```

## Default Rule

Prefer inline SVG copied from the local files or sprite. Do not load Lucide, Font Awesome, Iconfont, Remix, Bootstrap Icons, or other remote icon libraries in PPTX-bound HTML.

For PPTX export, the safest icon is:

```html
<svg class="bgy-icon" viewBox="0 0 24 24" aria-hidden="true">
  <path d="M20 6 9 17l-5-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

Keep icon color on the wrapper via `color`, not hard-coded random colors:

```css
.bgy-icon {
  width: 24px;
  height: 24px;
  color: #006D9A;
}
```

## Visual Tone

Use icons as quiet signposts, not decoration. A normal report page should use 1-4 icons. A process page may use 5-7 if each icon marks a step. Avoid filling every card with a different symbol.

Recommended mapping:

| Scenario | Icon folder | Examples |
|---|---|---|
| KPI card, note, checklist | `icons/line` | `trendUp`, `chartBar`, `clipboard`, `check` |
| Status tag | `icons/solid` | `statusDone`, `statusRisk`, `statusPending`, `statusProgress` |
| Property service topic | `icons/bgy-business` | `workOrder`, `engineering`, `patrol`, `fire`, `customer`, `fee` |
| Process / framework | `svg/diagrams` | `processArrow`, `closedLoop`, `milestoneAxis`, `matrixFrame` |
| Missing evidence | `svg/empty-states` | `missingMaterial`, `noData`, `screenshotPlaceholder` |

## PPTX Conversion Rules

Native-friendly SVG must use only:

- `path`
- `line`
- `polyline`
- `polygon`
- `rect`
- `circle`
- `ellipse`

Avoid:

- `filter`, `mask`, `clipPath`
- `linearGradient`, `radialGradient`, `pattern`
- SVG `<text>`
- embedded `<image>`
- `foreignObject`
- remote symbol references

If a visual needs any of those, treat it as a deliberate decorative SVG or screenshot exception, and keep all real text outside the SVG.

## Naming Discipline

Use one icon style per slide:

- Line icons for most management pages.
- Solid icons only for status chips and alert markers.
- Business icons when the slide is about a specific operation domain.

Do not mix external CDN icons with local BGY icons. Do not use emoji as icons in PPTX-bound pages.

## Gallery

Open `assets/icon-gallery.html` to preview local icons and copy names. The gallery is static and does not require a server.
