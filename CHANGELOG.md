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

### Changed
- `README.md`: project structure tree updated to list `.cursorrules`,
  every `.mdc` rule file, and `.gitignore`. Added a new "Агенты и
  правила" section (Russian) describing the Lead / Developer-Tester
  workflow, a short summary of the global rules (scope discipline,
  language policy, `/calculate` contract, changelog, README, safety),
  and a per-file table of `.cursorrules` + `.cursor/rules/*.mdc`.
