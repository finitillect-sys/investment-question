# Visual Regulator Baseline

This document is the persistent visual reference for frontend changes.
All new UI features should align with this baseline unless the user requests
an explicit redesign.

## Product Visual Identity

- App style: compact B2B dashboard with left sidebar, sticky topbar, and card surfaces.
- Typography: `Inter` first, then `Segoe UI`, then system sans-serif.
- Density target: information-rich but readable (`13px`/`14px` body controls).
- Language: user-facing labels in Russian.

## Core Color and Theme Contract

- Semantic tokens are defined in `:root` and mirrored in `body.dark`.
- Primary action color is based on `--primary` with hover via `--primary-hover`.
- Surface hierarchy uses `--bg` (page) and `--card` (containers/cards/modals).
- Borders and separators use `--border`.
- State colors:
  - Positive: `--success`
  - Destructive: `--danger`
  - Warning: `--warning`

## Layout Contract

- Sidebar width: `--sidebar-w: 240px`, fixed on the left.
- Topbar height: `--topbar-h: 64px`, sticky in main area.
- Primary content pattern:
  - `content-card` and results cards use rounded corners and light border/shadow.
  - Internal spacing is medium/compact (typically 14–32px).

## Component Patterns

- **Buttons**
  - Primary CTA: filled (`btn-primary`).
  - Secondary actions: outlined (`btn-secondary`).
  - Utility/destructive sidebar actions: ghost variants.
- **Forms**
  - Inputs/selects use 1.5px border, rounded corners, visible focus ring.
  - Labels are uppercase micro-labels (`~12px`, semibold).
- **Tables**
  - Header background uses neutral surface (`var(--bg)`).
  - Hover rows use soft primary tint (`var(--primary-light)`).
  - Numeric columns are right-aligned where applicable.
- **Overlays**
  - Modals and popups use elevated card surfaces with controlled backdrop blur.

## Motion and Feedback

- Transitions are subtle and short (~0.12s to 0.3s).
- Hover feedback should be present on clickable elements.
- Focus feedback must remain clearly visible and keyboard-friendly.

## Visual QA Checklist (Must Pass)

1. New UI element uses existing token-driven palette and spacing system.
2. New control has hover/focus states and does not break dark theme.
3. Existing layout (sidebar/topbar/cards) stays visually stable.
4. Russian UI text style and terminology remain consistent with current screens.
5. No visual regression in KPI cards, chart card, results table, and modals.
