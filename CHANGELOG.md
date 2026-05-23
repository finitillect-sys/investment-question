# Changelog

All notable changes to this project are documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Entries are written in English; the Russian `README.md` reflects the current
state, this file reflects the path that led there.

## [Unreleased] - 2026-05-23

### Added
- Cursor agent rules in `.cursor/rules/`:
  - `global-conventions.mdc` — always-apply project conventions (stack,
    data contract, English-in-code / Russian-in-UI policy).
  - `change-context.mdc` — mandates appending an entry to this file after
    every substantive code change.
  - `readme-maintenance.mdc` — keeps `README.md` (Russian) in sync with
    code, run commands, dependencies and the `/calculate` API shape.
- Initial Russian `README.md` describing the investment questionnaire,
  quick start, project structure and the `/calculate` API.
- Initial `CHANGELOG.md` (this file) as the persistent change-context store.
- Root `.cursorrules` as a global, single-file summary of agent policy
  (language policy, stack boundaries, `/calculate` data contract,
  editing workflow, code style, frontend conventions, safety). Mirrors
  and consolidates the per-concern rules in `.cursor/rules/`.
- Three new agent rules in `.cursor/rules/`:
  - `scope-discipline.mdc` — highest-priority always-apply rule: do only
    what was asked, ask clarifying questions on ambiguity, no unilateral
    decisions, no "while I'm here" edits.
  - `lead-agent.mdc` — Lead role that validates incoming tasks against a
    checklist, asks clarifying questions, then dispatches a concrete
    brief with explicit acceptance criteria.
  - `developer-tester-agent.mdc` — Developer-Tester role with two strict
    phases: Develop (minimal implementation, no drive-by edits) and
    Test (verifies acceptance criteria, contract integrity, numerical
    sanity, edge cases, language policy, lints, and bookkeeping).
- `.cursorrules` extended with a "Scope Discipline" section and an
  "Agent Roles & Workflow" section so the global summary reflects the
  Lead → Developer-Tester → Lead acceptance loop.
- Root `.gitignore` covering Node.js (`node_modules/`, debug logs),
  environment/secrets (`.env*`, keys), Python (`__pycache__`, virtualenvs,
  caches — `pyproject.toml` is present), logs/coverage, macOS, common
  IDEs, and project-specific `zipFile.zip` / `*.zip`. `package-lock.json`
  intentionally remains tracked (this is an app, not a library).

### Changed (2026-05-23 — analysis fixes batch)
- `server.js` **S-C4**: `startYear` now derived from `A.startDate` via
  `parseRussianDate`; falls back to `new Date().getFullYear()` when absent.
  Previously hardcoded to 2026.
- `server.js` **S-C1**: removed dead `totalInvestment` variable (accumulated
  but never used in response or downstream logic).
- `server.js` **S-C2**: wrapped entire route handler body in try/catch;
  unexpected errors now return `HTTP 500 { error: 'Calculation failed' }`
  instead of crashing or hanging.
- `server.js` **S-C3**: `pi` in response changed from `string` (`.toFixed(2)`)
  to `number | null` (null = н/д). Eliminates mixed-type API field; client
  now formats display. `public/script.js` updated in the same change.
- `server.js` **S-S1**: route handler decomposed into 9 named pure functions
  (`computeRevenueAndQuantity`, `computeDirectCosts`, `computePeriodCosts`,
  `computePayroll`, `computeInvestments`, `computePnL`, `computeFinancing`,
  `computeFinalCashFlow`, `computeIndicators`). Route is now an orchestrator.
- `server.js` **S-S2**: `seasonKeyForMonth`, `seasonCoef`,
  `productMonthsFactor` hoisted to module level (were re-created on every
  request).
- `server.js` **S-S3**: `pluralYears`, `genitiveYears` hoisted to module
  level; `computePeriodCosts` shared for C2 and D (were duplicated
  ~20-line blocks).
- `public/script.js` **C-S4**: `MONTHS_RU` and `MONTHS_SHORT` now derived
  from a single `MONTHS` table — one place to add/change month display names.
- `public/script.js` **C-S1**: `parseRussianDateParts` added as shared
  helper; `russianToMonthInput`, `getPlanningRange`, `validateDateInRange`,
  and `openMonthPicker` now delegate to it instead of inlining the same
  4-line parse logic.
- `public/script.js` **C-S2**: `makeCostSectionConfig` factory added;
  C2 and D `SECTION_CONFIG` entries replaced with factory calls.
- `public/script.js` **C-C1**: `loadFromStorage` wrapped in try/catch —
  corrupt localStorage no longer breaks the page on load.
- `public/script.js` **C-C2**: `description` textarea value no longer
  interpolated into `innerHTML`; set via `.value` after insertion to prevent
  layout-breaking injection.
- `public/script.js` **C-C4**: `addEmptyRow` no longer strips `<tr>` tags
  via regex; parses HTML through a real `<table>` context instead.
- `public/script.js` **C-S3**: `bgPlugin` moved to module level; reads
  dark-mode at draw time instead of capturing a stale `cardBg` closure.
- `public/script.js` **C-C5**: JSON import validates that array sections
  (B, C1, C2, D, E, F) are actually arrays and G is an object before
  accepting the file.
- `public/script.js` **S-C3**: `renderKPI` and Excel export sheet updated
  for `pi` as `number | null` (display: `.toFixed(2)` or `'н/д'`).

### Changed
- `README.md`: project structure tree updated to list `.cursorrules`,
  every `.mdc` rule file, and `.gitignore`. Added a new "Агенты и
  правила" section (Russian) describing the Lead / Developer-Tester
  workflow, a short summary of the global rules (scope discipline,
  language policy, `/calculate` contract, changelog, README, safety),
  and a per-file table of `.cursorrules` + `.cursor/rules/*.mdc`.
