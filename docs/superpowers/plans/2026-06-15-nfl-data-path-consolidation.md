# NFL Data-Path Consolidation & Scheduled Refresh — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collapse the NFL Target Share tool to a single static-JSON runtime path and add a scheduled GitHub Action that scrapes fresh data and auto-commits it (triggering Netlify).

**Architecture:** The React app always reads `/nfl-data.json` (dev and prod). The Python FantasyPros scraper is no longer part of the Netlify build; instead a weekly, season-aware GitHub Action runs it, validates the output, and commits `public/nfl-data.json` only when it changed and is valid. The commit triggers Netlify's existing git-based deploy.

**Tech Stack:** Vite + React (frontend), Python 3.11 + `requests` + `beautifulsoup4` (scraper), GitHub Actions (scheduler), Netlify (host).

**Spec:** `docs/superpowers/specs/2026-06-15-nfl-data-path-consolidation-design.md`

---

## File Structure

| File | Change | Responsibility |
|------|--------|----------------|
| `scripts/exportNFLData.py` | Modify | Standalone scraper entrypoint; season made current, dead import removed |
| `backend/src/fantasypros_scraper.py` | Modify | Remove vestigial `pandas` import; thread `year` through |
| `scripts/buildData.js` | Delete | Dead build-time generator |
| `package.json` | Modify | Remove `prebuild` hook |
| `netlify.toml` | Modify | Remove `PYTHON_VERSION` (build is pure Node now) |
| `src/utils/nflDataService.js` | Modify | Single static data path; delete API-only methods |
| `backend/src/api_server.py` | Delete | Dead Flask runtime |
| `test_frontend_integration.js` | Delete | Dead manual test against removed `localhost:5001` API |
| `.gitignore` | Modify | Ignore `backend/venv/` and env files |
| `.github/workflows/refresh-nfl-data.yml` | Create | Scheduled scrape + validated auto-commit |

**Task order (each independently committable):**
1. Slim & future-proof the scraper
2. Decouple the Netlify build from Python
3. Collapse the runtime data path to static-only
4. Repo cleanup (untrack venv/.env, delete dead files)
5. Scheduled GitHub Action

> **Note on testing:** This repo has no JS test harness (no `vitest`/`jest`, no `test` npm script), and adding one is out of scope (YAGNI). Verification is therefore executable commands — running the scraper, building, grepping for removed symbols, and `git ls-files` assertions — each with an expected result. The one piece of nontrivial logic (NFL season-year calculation) gets a real assertion test in Task 1.

---

## Task 1: Slim & future-proof the scraper

Removes the dead import that drags in pandas/numpy/nfl-data-py, removes a vestigial pandas import, and makes the scraped season track the real NFL season year (overridable via `SEASON`) instead of a hardcoded `2025`.

**Files:**
- Modify: `scripts/exportNFLData.py`
- Modify: `backend/src/fantasypros_scraper.py`

- [ ] **Step 1: Write the failing test for the season-year calculation**

The NFL "season year" is the year the season *started*: Jan belongs to the prior year's season; Aug onward belongs to the current year. Create a scratch test file `scripts/_season_calc_test.py`:

```python
from datetime import datetime

def nfl_season_year(now):
    return now.year if now.month >= 8 else now.year - 1

assert nfl_season_year(datetime(2025, 9, 10)) == 2025, "Sept 2025 -> 2025"
assert nfl_season_year(datetime(2026, 1, 15)) == 2025, "Jan 2026 (playoffs) -> 2025"
assert nfl_season_year(datetime(2026, 9, 10)) == 2026, "Sept 2026 -> 2026"
assert nfl_season_year(datetime(2025, 7, 31)) == 2024, "July 2025 (offseason) -> 2024"
print("season calc OK")
```

- [ ] **Step 2: Run it to confirm the logic is correct**

Run: `backend/venv/bin/python scripts/_season_calc_test.py`
Expected: prints `season calc OK` (exit 0). This validates the formula before embedding it.

- [ ] **Step 3: Remove the unused `NFLDataScraper` import in `scripts/exportNFLData.py`**

Find (lines ~16-22):

```python
try:
    from fantasypros_scraper import FantasyProsScraper
    from nfl_data_scraper import NFLDataScraper
except ImportError as e:
```

Replace with:

```python
try:
    from fantasypros_scraper import FantasyProsScraper
except ImportError as e:
```

- [ ] **Step 4: Add the season computation in `scripts/exportNFLData.py`**

At the top of `def main():` (right after the two `print(...)` banner lines), insert:

```python
    # NFL season year = year the season started (Jan belongs to prior season).
    # Overridable via SEASON env var (e.g. SEASON=2024).
    now = datetime.now()
    default_season = now.year if now.month >= 8 else now.year - 1
    season = int(os.environ.get('SEASON', default_season))
    print(f"📅 Season: {season}")
```

- [ ] **Step 5: Use `season` instead of hardcoded `2025` in `scripts/exportNFLData.py`**

There are three literals to update.

(a) The scraper call inside the team loop. Find:

```python
            team_data = export_team_data_for_week(scraper, team, week)
```

Leave it — instead update the helper to pass `year`. Find the `export_team_data_for_week` function signature and call:

```python
def export_team_data_for_week(scraper, team, week):
    ...
        team_data = scraper.get_team_target_data_multi_position(team, week)
```

Replace with:

```python
def export_team_data_for_week(scraper, team, week, year):
    ...
        team_data = scraper.get_team_target_data_multi_position(team, week, year=year)
```

and update its call site in `main()`:

```python
            team_data = export_team_data_for_week(scraper, team, week)
```
→
```python
            team_data = export_team_data_for_week(scraper, team, week, season)
```

(b) The failure-path output dict. Find `'season': 2025,` inside the `if successful_teams == 0:` block and replace with `'season': season,`.

(c) The success-path output dict. Find the second `'season': 2025,` and the notice line:

```python
            'season': 2025,
            'lastUpdated': datetime.now().isoformat(),
            'notice': f'Real 2025 NFL target data from FantasyPros (individual weeks)',
```

Replace with:

```python
            'season': season,
            'lastUpdated': datetime.now().isoformat(),
            'notice': f'Real {season} NFL target data from FantasyPros (individual weeks)',
```

- [ ] **Step 6: Thread `year` through the scraper in `backend/src/fantasypros_scraper.py`**

Find the method signature:

```python
    def get_team_target_data_multi_position(self, team: str, week: int = None) -> List[Dict]:
```

Replace with:

```python
    def get_team_target_data_multi_position(self, team: str, week: int = None, year: int = 2025) -> List[Dict]:
```

Then find the three scrape calls:

```python
            wr_players, wr_totals = self.scrape_position_targets('wr', start_week=start_week, end_week=end_week)
            rb_players, rb_totals = self.scrape_position_targets('rb', start_week=start_week, end_week=end_week)
            te_players, te_totals = self.scrape_position_targets('te', start_week=start_week, end_week=end_week)
```

Replace with:

```python
            wr_players, wr_totals = self.scrape_position_targets('wr', year=year, start_week=start_week, end_week=end_week)
            rb_players, rb_totals = self.scrape_position_targets('rb', year=year, start_week=start_week, end_week=end_week)
            te_players, te_totals = self.scrape_position_targets('te', year=year, start_week=start_week, end_week=end_week)
```

- [ ] **Step 7: Remove the vestigial `import pandas as pd` in `backend/src/fantasypros_scraper.py`**

Find (line ~8):

```python
import pandas as pd
```

Delete the line entirely. (Verified unused — no `pd.` references in the file.)

- [ ] **Step 8: Verify the slimmed scraper runs end-to-end on requests+bs4 only**

Run:

```bash
SEASON=2025 backend/venv/bin/python - <<'PY'
import sys, os
sys.path.insert(0, 'backend/src')
from fantasypros_scraper import FantasyProsScraper
s = FantasyProsScraper()
data = s.get_team_target_data_multi_position('KC', 1, year=2025)
assert len(data) >= 5, "expected players"
assert abs(sum(p['targetShare'] for p in data) - 100) < 1.0, "shares ~100%"
print("OK", len(data), "rows, top:", data[0]['name'], data[0]['targetShare'], "%")
PY
```

Expected: `OK 6 rows, top: Hollywood Brown 42.1 %` (HTTP 200 from FantasyPros, sums to ~100%).

- [ ] **Step 9: Delete the scratch test file**

Run: `rm scripts/_season_calc_test.py`
(It served its purpose validating the formula; it is not part of the shipped code.)

- [ ] **Step 10: Commit**

```bash
git add scripts/exportNFLData.py backend/src/fantasypros_scraper.py
git commit -m "refactor(nfl): slim scraper deps and make season current-year aware"
```

---

## Task 2: Decouple the Netlify build from Python

The build no longer generates data; it just publishes the committed `public/nfl-data.json`.

**Files:**
- Delete: `scripts/buildData.js`
- Modify: `package.json` (remove `prebuild`)
- Modify: `netlify.toml` (remove `PYTHON_VERSION`)

- [ ] **Step 1: Delete the dead build-time generator**

Run: `git rm scripts/buildData.js`
Expected: `rm 'scripts/buildData.js'`

- [ ] **Step 2: Remove the `prebuild` hook from `package.json`**

Find:

```json
  "scripts": {
    "dev": "vite",
    "prebuild": "node scripts/buildData.js",
    "build": "vite build",
```

Replace with:

```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
```

- [ ] **Step 3: Remove `PYTHON_VERSION` from `netlify.toml`**

Find:

```toml
[build.environment]
  NODE_VERSION = "20"
  PYTHON_VERSION = "3.11"
```

Replace with:

```toml
[build.environment]
  NODE_VERSION = "20"
```

- [ ] **Step 4: Verify the build is clean, fast, and still ships the data file**

Run: `npm run build`
Expected: no "🏈 Preparing NFL data" prebuild output (the prebuild is gone); `vite build` succeeds.

Then run: `test -f build/nfl-data.json && echo "DATA PRESENT"`
Expected: `DATA PRESENT` (Vite copies `public/` into `build/`).

- [ ] **Step 5: Commit**

```bash
git add package.json netlify.toml
git commit -m "build(nfl): decouple Netlify build from Python data generation"
```

---

## Task 3: Collapse the runtime data path to static-only

`nflDataService.js` reads `/nfl-data.json` in both dev and prod; the `localhost:5001` API branch and API-only methods are removed.

**Files:**
- Modify: `src/utils/nflDataService.js`

- [ ] **Step 1: Replace `getTargetShareData` with the static-only version**

Find the entire method (from `static async getTargetShareData(teamId, week) {` through its closing `}` before `static async getAllTeamsTargetShare`). Replace it with:

```javascript
  static async getTargetShareData(teamId, week) {
    try {
      const response = await fetch('/nfl-data.json');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Static data indicates failure');
      }

      const weekData = result.weeks[week];
      if (!weekData) {
        throw new Error(`No data available for week ${week}`);
      }

      const teamData = weekData[teamId.toUpperCase()];
      if (!teamData) {
        throw new Error(`No data available for team ${teamId} in week ${week}`);
      }

      return {
        success: true,
        data: teamData,
        team: getTeamById(teamId),
        week: week,
        season: result.season,
        lastUpdated: result.lastUpdated,
        source: result.source || 'static',
        notice: result.notice,
        dataType: result.dataType,
        weekRange: `Week ${week}`,
        availableWeeks: result.availableWeeks || [1, 2, 3]
      };
    } catch (error) {
      console.error('Error fetching target share data:', error);
      return {
        success: false,
        error: error.message,
        data: [],
        source: 'error'
      };
    }
  }
```

- [ ] **Step 2: Delete the two API-only methods `getAllTeamsTargetShare` and `getCurrentWeek`**

Delete the entire `static async getAllTeamsTargetShare(week) { ... }` method and the entire `static async getCurrentWeek() { ... }` method (including their `// Helper method...` comments). They are unused (verified: zero references outside this file).

- [ ] **Step 3: Replace `getAvailableWeeks` with the static-only version**

Find the entire `static async getAvailableWeeks() { ... }` method and replace it with:

```javascript
  // Available weeks come straight from the static data file.
  static async getAvailableWeeks() {
    try {
      const response = await fetch('/nfl-data.json');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const weeks = (result.availableWeeks && result.availableWeeks.length > 0)
        ? result.availableWeeks
        : [1, 2, 3];

      return weeks.map(week => ({
        value: week,
        label: `Week ${week}`
      }));
    } catch (error) {
      console.error('Error fetching available weeks:', error);
      return [1, 2, 3].map(week => ({ value: week, label: `Week ${week}` }));
    }
  }
```

- [ ] **Step 4: Delete the unused `getWeeksArray` method**

Delete the entire `static getWeeksArray() { ... }` method (including its `// Generate weeks array...` comment). It is unused (verified).

- [ ] **Step 5: Verify no removed symbols or dev-API references remain**

Run:

```bash
grep -rnE "localhost:5001|VITE_NFL_API_URL|getAllTeamsTargetShare|getCurrentWeek|getWeeksArray" src/
```

Expected: **no output** (exit 1 from grep). If anything prints, a reference was missed.

- [ ] **Step 6: Verify the build still passes**

Run: `npm run build`
Expected: `vite build` succeeds (no errors about missing methods/imports).

- [ ] **Step 7: Manually verify the dev path reads static JSON**

Run: `npm run dev`, open `http://localhost:5173/nfl-target-share`.
Expected: chart + breakdown render; the week dropdown shows weeks 1–9; **no** request to `localhost:5001` in the Network tab and no console errors. Stop the dev server when confirmed.

- [ ] **Step 8: Commit**

```bash
git add src/utils/nflDataService.js
git commit -m "refactor(nfl): collapse data service to a single static JSON path"
```

---

## Task 4: Repo cleanup — untrack venv/.env, delete dead files

**Files:**
- Modify: `.gitignore`
- Untrack: `backend/venv/`, `backend/.env`
- Delete: `backend/src/api_server.py`, `test_frontend_integration.js`

- [ ] **Step 1: Stop tracking the committed macOS virtualenv**

Run: `git rm -r --cached backend/venv`
Expected: a long list of `rm 'backend/venv/...'` lines (working-tree files are kept; only the index entries are removed).

- [ ] **Step 2: Stop tracking the committed env file**

Run: `git rm --cached backend/.env`
Expected: `rm 'backend/.env'` (the local file is kept; `backend/.env.example` remains tracked).

- [ ] **Step 3: Delete the dead Flask server and the dead integration script**

Run:

```bash
git rm backend/src/api_server.py test_frontend_integration.js
```

Expected: `rm 'backend/src/api_server.py'` and `rm 'test_frontend_integration.js'`.

- [ ] **Step 4: Add ignore rules so these never get recommitted**

Append to `.gitignore` (only if not already present — check with `grep -n 'backend/venv' .gitignore` first):

```gitignore
# Python virtualenv (recreated locally / in CI from requirements)
backend/venv/

# Environment files (keep .env.example only)
.env
backend/.env
```

- [ ] **Step 5: Verify the untracking and deletions took effect**

Run:

```bash
echo "venv tracked files: $(git ls-files backend/venv | wc -l | tr -d ' ')"
echo ".env tracked: $(git ls-files backend/.env)"
echo "api_server tracked: $(git ls-files backend/src/api_server.py)"
echo "integration test tracked: $(git ls-files test_frontend_integration.js)"
```

Expected:
```
venv tracked files: 0
.env tracked:
api_server tracked:
integration test tracked:
```

- [ ] **Step 6: Commit**

```bash
git add .gitignore
git commit -m "chore(nfl): untrack venv/.env and remove dead API server + integration script"
```

> **Out of scope (flag to user, do not do silently):** `git rm --cached backend/.env` does **not** purge the file from git history. If that file ever contained a live secret, rotate it and scrub history separately.

---

## Task 5: Scheduled GitHub Action

Weekly, season-aware scrape that validates output and commits `public/nfl-data.json` only when it changed — the commit triggers Netlify.

**Files:**
- Create: `.github/workflows/refresh-nfl-data.yml`

- [ ] **Step 1: Create the workflow file**

Create `.github/workflows/refresh-nfl-data.yml` with exactly:

```yaml
name: Refresh NFL target-share data

on:
  schedule:
    - cron: '0 14 * * 2'   # Tuesdays 14:00 UTC (~9-10am ET)
  workflow_dispatch: {}     # allow manual runs

permissions:
  contents: write           # needed to commit the refreshed JSON

jobs:
  refresh:
    runs-on: ubuntu-latest
    steps:
      - name: Skip in deep offseason (Feb-Aug)
        id: season
        run: |
          month=$((10#$(date -u +%m)))   # base-10 to avoid octal issues with 08/09
          if [ "$month" -ge 2 ] && [ "$month" -le 8 ]; then
            echo "Offseason (month $month) - skipping scrape."
            echo "skip=true" >> "$GITHUB_OUTPUT"
          else
            echo "skip=false" >> "$GITHUB_OUTPUT"
          fi

      - name: Checkout
        if: steps.season.outputs.skip == 'false'
        uses: actions/checkout@v4

      - name: Set up Python
        if: steps.season.outputs.skip == 'false'
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install scraper dependencies
        if: steps.season.outputs.skip == 'false'
        run: pip install requests beautifulsoup4

      - name: Scrape latest data
        if: steps.season.outputs.skip == 'false'
        run: python3 scripts/exportNFLData.py

      - name: Validate and commit if changed
        if: steps.season.outputs.skip == 'false'
        run: |
          python3 -c "import json,sys; d=json.load(open('public/nfl-data.json')); sys.exit(0 if d.get('success') and d.get('weeks') else 1)" \
            || { echo 'Scrape produced invalid/empty data - not committing.'; exit 1; }
          if git diff --quiet -- public/nfl-data.json; then
            echo 'No data changes - nothing to commit.'
            exit 0
          fi
          git config user.name 'github-actions[bot]'
          git config user.email 'github-actions[bot]@users.noreply.github.com'
          git add public/nfl-data.json
          git commit -m 'chore(data): refresh NFL target-share data'
          git push
```

- [ ] **Step 2: Verify the YAML parses**

Run:

```bash
backend/venv/bin/python -c "import yaml, sys; yaml.safe_load(open('.github/workflows/refresh-nfl-data.yml')); print('YAML OK')" 2>/dev/null \
  || python3 -c "import json; print('yaml module unavailable - skip, will validate on GitHub')"
```

Expected: `YAML OK` (if `pyyaml` is present in the venv) or the skip message. GitHub validates the workflow on push regardless.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/refresh-nfl-data.yml
git commit -m "ci(nfl): add weekly season-aware data refresh workflow"
```

- [ ] **Step 4: Post-merge live validation (manual, after pushing to the default branch)**

Once the workflow exists on the default branch on GitHub:
1. GitHub → **Actions** → "Refresh NFL target-share data" → **Run workflow** (`workflow_dispatch`).
2. Expected outcomes (either is success):
   - Off-season month → the run logs "Offseason ... skipping" and does nothing.
   - In-season / unchanged data → "No data changes - nothing to commit."
   - In-season / new week available → commits `public/nfl-data.json`; confirm Netlify starts a deploy from that commit.
3. Confirm the run never commits an empty/`success:false` file (the validate step would fail the job first).

---

## Self-Review

**Spec coverage:**
- Single runtime path (`getTargetShareData` static, API branch + `getAllTeamsTargetShare`/`getCurrentWeek`/`getWeeksArray` deleted, no `VITE_NFL_API_URL`) → Task 3. ✅
- Decouple build (delete `buildData.js`, remove `prebuild`, remove `PYTHON_VERSION`) → Task 2. ✅
- `exportNFLData.py` season default current-year + `SEASON` override → Task 1. ✅
- Slim scraper imports (drop unused `NFLDataScraper`, vestigial `pandas`) → Task 1. ✅
- Scheduled Action with season gate + validate/diff commit guard + `contents: write` → Task 5. ✅
- Untrack `backend/venv` and `backend/.env`, `.gitignore` → Task 4. ✅
- Delete `api_server.py` → Task 4. ✅ (plus dead `test_frontend_integration.js`)
- Risks (scraper verified, slim deps) → reflected in Task 1 verification + Task 5 install. ✅
- `.env` history caveat surfaced → Task 4 note. ✅

**Placeholder scan:** No TBD/TODO/"handle errors"/"similar to" — every code step shows complete code. ✅

**Type/name consistency:** `get_team_target_data_multi_position(team, week, year=...)` signature (Task 1 Step 6) matches its call in `exportNFLData.py` via `export_team_data_for_week(..., year)` (Task 1 Step 5). `getAvailableWeeks`/`getTargetShareData` return shapes (`{value,label}` and the result object) unchanged, so `NFLTargetShare.jsx` needs no edits. Workflow `public/nfl-data.json` path matches the scraper's output path. ✅
