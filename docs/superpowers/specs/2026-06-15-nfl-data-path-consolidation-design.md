# NFL Target Share: Data-Path Consolidation & Scheduled Refresh

**Date:** 2026-06-15
**Status:** Approved (design) — pending implementation plan
**Area:** `src/utils/nflDataService.js`, `src/components/NFLTargetShare.jsx`, `scripts/`, `backend/`, `netlify.toml`, `.github/workflows/`

---

## Problem

The NFL Target Share Analyzer (`/nfl-target-share`) has two runtime data paths and a build-time data generator that has never worked in production:

1. **Dual runtime path.** `nflDataService.js` reads from a dev-only Flask API at `http://localhost:5001/api` in development and a static `public/nfl-data.json` in production (gated on `import.meta.env.PROD` / `VITE_NFL_API_URL`). Only the static file ever serves real users.
2. **Dead build-time generation.** `scripts/buildData.js` (the `prebuild` hook) shells into `backend/venv` via `source venv/bin/activate`. That venv is a **committed macOS virtualenv** (~8,000+ tracked files) that cannot execute on Netlify's Linux build runner, so every production build silently falls back to the committed JSON. The Python scraper has never run in prod.
3. **Stale data with no refresh mechanism.** `public/nfl-data.json` is frozen at the 2025 season, weeks 1–9 (`lastUpdated: 2025-11-05`). There is no automation to refresh it.
4. **Incidental debt in the blast radius.** `backend/.env` is committed (possible secret leak). `backend/src/api_server.py` is the now-pointless Flask runtime.

### Confirmed facts (investigation)

- Host: **Netlify** (`netlify.toml`), build command `npm ci && npm run build`, publish `build/`, git-based auto-deploy from GitHub `aramberg4/portfolio-site`.
- No GitHub Actions exist yet.
- The data metric itself is **correct** (target share = player targets ÷ real team total targets, with an "Other" remainder slice). Verified across all 270 team-weeks (sums 99.8–100.2%). This spec does **not** change the metric or scraper math.

### Scraper live-verification (2026-06-15)

Ran the real scraper against the live FantasyPros URLs for the 2025 season, week 1:

- `wr.php` / `rb.php` / `te.php` all return **HTTP 200**; table structure unchanged — WR/RB = 8 columns (`Team, {pos}1, Targets, {pos}2, Targets, {pos}3, Targets, Total Targets`), TE = 6 columns. This matches the parser's `len(cells) >= 8` / `>= 6` expectations.
- `get_team_target_data_multi_position()` produces valid output end-to-end (ARI & KC both sum to 100%, "Other" remainder correct), reproducing the committed `nfl-data.json` exactly.
- **Dependency footprint confirmed minimal:** the FantasyPros path uses only `requests` + `beautifulsoup4`. The heavy `pandas`/`numpy`/`nfl-data-py` stack is pulled in *only* by (a) an **unused** `from nfl_data_scraper import NFLDataScraper` in `exportNFLData.py` and (b) a **vestigial** `import pandas as pd` in `fantasypros_scraper.py` (never referenced). Removing both lets CI install just two lightweight packages.

---

## Goals

- **One runtime path:** the app reads `/nfl-data.json` in both dev and prod. Delete the Flask/API branch.
- **Working scheduled refresh:** a GitHub Action regenerates and commits `public/nfl-data.json` on a weekly, season-aware cadence; the commit auto-triggers a Netlify deploy.
- **Decouple data from build:** the Netlify build no longer runs (or depends on) Python.
- **Fold in adjacent cleanup:** untrack the committed venv and `.env`, delete the dead Flask server.

## Non-Goals

- Changing the target-share metric, the scraper's scraping logic, or the JSON schema.
- Building a hosted backend/API service.
- Purging `.env` from git history (flagged as a separate security decision, not executed silently here).
- Refactoring unrelated backend scraper modules.

---

## Design

### 1. Runtime data path (`src/utils/nflDataService.js`)

Collapse to a single static path. Dev and prod both `fetch('/nfl-data.json')` (Vite serves `public/` at the web root in dev).

- **`getTargetShareData(teamId, week)`** — remove the `import.meta.env.PROD` gate and the entire `localhost:5001` development branch (current lines ~102–128). Keep only the static fetch + week/team extraction + the existing error handling (`{ success: false, error, data: [], source: 'error' }`).
- **`getAvailableWeeks()`** — remove the API branch; keep only the static read added in the prior fix. Returns `[{ value, label }]` from `result.availableWeeks` (fallback `[1,2,3]`).
- **Delete** `getAllTeamsTargetShare()`, `getCurrentWeek()`, `getWeeksArray()` (API-only or unused).
- **Remove** every `VITE_NFL_API_URL` reference.
- `formatForPieChart()` and `getPlayerColor()` are unchanged.

**Consumer impact:** `NFLTargetShare.jsx` calls `getAvailableWeeks()` and `getTargetShareData()` with unchanged signatures and return shapes — **no component changes required**.

### 2. Data generation (decoupled from build)

- The scraper stays as a standalone script: `scripts/exportNFLData.py` → `backend/src/{fantasypros_scraper,nfl_data_scraper}.py`. It writes `public/nfl-data.json`.
- **Delete `scripts/buildData.js`** and remove the `prebuild` script from `package.json`. The build publishes the committed JSON as-is.
- **`netlify.toml`:** remove `PYTHON_VERSION = "3.11"` from `[build.environment]` (build is now pure Node). Leave `NODE_VERSION`, redirects, and publish dir unchanged.
- **`exportNFLData.py` season:** default the season to the current calendar year, overridable via `SEASON` env var (e.g. `season = int(os.environ.get('SEASON', datetime.now().year))`), so it does not rot at a hardcoded 2025. The `notice`/`season` fields use the same value.
- **Slim the scraper imports** (enables the lightweight CI install): remove the unused `from nfl_data_scraper import NFLDataScraper` from `exportNFLData.py` and the vestigial `import pandas as pd` from `fantasypros_scraper.py`. After this, the FantasyPros path imports only `requests` + `beautifulsoup4`.

### 3. Scheduled Action — `.github/workflows/refresh-nfl-data.yml`

```yaml
name: Refresh NFL target-share data
on:
  schedule:
    - cron: '0 14 * * 2'      # Tuesdays 14:00 UTC (~9-10am ET)
  workflow_dispatch: {}        # manual trigger
permissions:
  contents: write              # commit the refreshed JSON
```

Single job `refresh` on `ubuntu-latest`:

1. **Season gate** — read current month; if Feb–Aug (`02`–`08`), set an output `skip=true` and short-circuit the remaining steps (deep offseason; nothing new to scrape).
2. `actions/checkout@v4`.
3. `actions/setup-python@v5` with `python-version: '3.11'`.
4. `pip install requests beautifulsoup4` — the verified minimal footprint (see live-verification above). Do **not** install the full `backend/requirements.txt` (pandas/numpy/nfl-data-py are unused on this path). Prereq: remove the unused `NFLDataScraper` import from `exportNFLData.py` and the vestigial `import pandas` from `fantasypros_scraper.py` so the slim install is sufficient.
5. `python3 scripts/exportNFLData.py` (writes `public/nfl-data.json` in the workspace).
6. **Validate + commit guard (critical):**
   - Validate the freshly written file: `success === true` and `weeks` is a non-empty object. If invalid → fail the job, **do not commit** (the committed-in-repo file is untouched, so good data is preserved).
   - If `git diff --quiet public/nfl-data.json` (no change) → exit 0 without committing (covers offseason / no-new-week).
   - Otherwise commit as `github-actions[bot]` with message `chore(data): refresh NFL target-share data` and `git push` to the default branch. **The commit message must NOT contain `[skip ci]` / `[skip netlify]`** — Netlify honors those to skip builds, and we need this commit to trigger a deploy.

The push to the default branch triggers Netlify's existing git-based deploy. No build hook required.

### 4. Cleanup

- **Untrack `backend/venv/`**: `git rm -r --cached backend/venv` and add `backend/venv/` to `.gitignore`.
- **Untrack `backend/.env`**: `git rm --cached backend/.env`, add `backend/.env` (and `.env`) to `.gitignore`, keep `backend/.env.example`.
- **Delete `backend/src/api_server.py`** (dead Flask runtime). Keep scraper modules imported by `exportNFLData.py`.

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| FantasyPros HTML structure drifted; scraper returns nothing | **Verified working 2026-06-15** (see live-verification). The Action's validate step refuses to commit empty/failed output, so a future break degrades to "stale but valid" rather than "wiped." |
| ~~Heavy pinned deps fail to build in CI~~ | **Resolved.** Confirmed the FantasyPros path needs only `requests`+`beautifulsoup4`; the Action installs just those two. No pandas/numpy/nfl-data-py wheel-build risk. |
| `.env` already in git history | Removing from tracking does not purge history. Flag to user: if it held a live secret, rotate + history-scrub separately. Not done silently in this change. |
| Action commit loop / Netlify rebuild storms | Commit guard ensures **zero commits** when data is unchanged; season gate prevents offseason runs. At most one commit/deploy per week during season. |

---

## Testing / Acceptance

- `npm run build` completes clean with **no `prebuild`** step and no Python invocation.
- `npm run dev` → `/nfl-target-share` loads target-share data and the week dropdown from the static JSON (no `localhost:5001` request in the network tab, no console errors).
- `grep -r "localhost:5001\|VITE_NFL_API_URL\|getCurrentWeek\|getAllTeamsTargetShare\|getWeeksArray" src/` returns nothing.
- `git ls-files backend/venv | wc -l` → `0`; `git ls-files backend/.env` → empty.
- The workflow runs successfully via `workflow_dispatch`: either commits a valid updated JSON or no-ops with "no changes," and never commits an empty/`success:false` file.

---

## Out-of-scope follow-ups (noted, not in this change)

- Purge `backend/.env` from git history + secret rotation (if warranted).
- Prune other unused `backend/` scripts (`debug_nfl_data.py`, `espn_data_scraper.py`, `quick_test.py`, etc.) once confirmed dead.
- Revisit the `/nfl-target-share → /nfl-target-share.html` redirect in `netlify.toml` (suspect, but unrelated to the data path).
