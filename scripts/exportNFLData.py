#!/usr/bin/env python3
"""
Build-time NFL Data Exporter
Uses the real FantasyPros scraper to export 2025 NFL target share data for all teams
"""

import sys
import os
import json
from datetime import datetime

# Add the backend src directory to the Python path
backend_src = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'backend', 'src')
sys.path.insert(0, backend_src)

try:
    from fantasypros_scraper import FantasyProsScraper
except ImportError as e:
    print(f"❌ Error importing scraper modules: {e}")
    print(f"Backend src path: {backend_src}")
    sys.exit(1)

# All NFL teams
NFL_TEAMS = [
    'ARI', 'ATL', 'BAL', 'BUF', 'CAR', 'CHI', 'CIN', 'CLE', 'DAL', 'DEN',
    'DET', 'GB', 'HOU', 'IND', 'JAX', 'KC', 'LV', 'LAC', 'LAR', 'MIA',
    'MIN', 'NE', 'NO', 'NYG', 'NYJ', 'PHI', 'PIT', 'SF', 'SEA', 'TB',
    'TEN', 'WAS'
]

def export_team_data_for_week(scraper, team, week, year):
    """Export target share data for a specific team and week"""
    try:
        print(f"  📊 Scraping {team} Week {week}...")

        # Use the multi-position scraper to get WR, RB, and TE data for specific week
        team_data = scraper.get_team_target_data_multi_position(team, week, year=year)

        if team_data:
            print(f"  ✅ {team} Week {week}: {len(team_data)} players")
            return team_data
        else:
            print(f"  ⚠️  {team} Week {week}: No data found")
            return []

    except Exception as e:
        print(f"  ❌ {team} Week {week}: Error - {e}")
        return []

def main():
    # NFL season year = year the season started (Jan belongs to prior season).
    # Overridable via SEASON env var (e.g. SEASON=2024).
    now = datetime.now()
    default_season = now.year if now.month >= 8 else now.year - 1
    season = int(os.environ.get('SEASON', default_season))
    print(f"📅 Season: {season}")
    print(f'🏈 Exporting real {season} NFL target share data...')
    print('📡 Using FantasyPros scraper - auto-detecting available weeks')

    # Initialize the scraper
    scraper = FantasyProsScraper()

    # Export data for all teams and weeks
    weeks_data = {}
    total_players = 0
    successful_teams = 0

    # Auto-detect available weeks by incrementing until no data found
    week = 1
    max_week = 18  # NFL regular season is 18 weeks max
    consecutive_empty_weeks = 0
    max_consecutive_empty = 2  # Stop after 2 consecutive weeks with no data

    while week <= max_week and consecutive_empty_weeks < max_consecutive_empty:
        print(f"\n🔄 Scraping Week {week} data...")
        week_teams_data = {}
        week_successful = 0

        for team in NFL_TEAMS:
            team_data = export_team_data_for_week(scraper, team, week, season)
            if team_data:
                week_teams_data[team] = team_data
                total_players += len(team_data)
                week_successful += 1

            # Add a small delay to be respectful to FantasyPros
            import time
            time.sleep(0.3)

        # Check if this week has any data
        if week_successful == 0:
            print(f"⚠️  Week {week}: No data found for any team")
            consecutive_empty_weeks += 1
        else:
            weeks_data[week] = week_teams_data
            print(f"Week {week}: {week_successful}/{len(NFL_TEAMS)} teams successful")
            successful_teams = max(successful_teams, week_successful)
            consecutive_empty_weeks = 0  # Reset counter on successful week

        week += 1

    if consecutive_empty_weeks >= max_consecutive_empty:
        print(f"\n🛑 Stopped scraping after {consecutive_empty_weeks} consecutive weeks with no data")

    if successful_teams == 0:
        print("❌ No team data was successfully scraped")
        # Create fallback structure
        output_data = {
            'success': False,
            'source': 'fantasypros_build_time_failed',
            'dataType': 'error',
            'error': 'No team data could be scraped',
            'season': season,
            'lastUpdated': datetime.now().isoformat(),
            'notice': 'Real scraping failed - no data available',
            'weeks': {},
            'totalPlayers': 0,
            'availableTeams': [],
            'availableWeeks': []
        }
    else:
        # Get list of weeks that actually have data
        available_weeks = sorted([int(week) for week in weeks_data.keys() if weeks_data[week]])

        print(f"\n✅ Successfully scraped data for weeks {available_weeks}")
        print(f"📊 Total players across all weeks: {total_players}")

        # Get list of teams that have data in at least one week
        all_teams = set()
        for week_data in weeks_data.values():
            all_teams.update(week_data.keys())

        # Create the output data structure
        output_data = {
            'success': True,
            'source': 'fantasypros_build_time',
            'dataType': 'real',
            'season': season,
            'lastUpdated': datetime.now().isoformat(),
            'notice': f'Real {season} NFL target data from FantasyPros (individual weeks)',
            'weeks': weeks_data,
            'totalPlayers': total_players,
            'availableTeams': sorted(list(all_teams)),
            'availableWeeks': available_weeks,
            'scrapingStats': {
                'successfulTeams': successful_teams,
                'totalTeams': len(NFL_TEAMS),
                'successRate': f"{(successful_teams/len(NFL_TEAMS)*100):.1f}%"
            }
        }

    # Ensure public directory exists
    public_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'public')
    os.makedirs(public_dir, exist_ok=True)

    # Write data to public directory for static serving
    output_path = os.path.join(public_dir, 'nfl-data.json')

    try:
        with open(output_path, 'w') as f:
            json.dump(output_data, f, indent=2)

        print(f"📁 Data exported to: {output_path}")

        if successful_teams > 0:
            print(f"🎯 Available teams: {', '.join(sorted(list(all_teams)))}")
            print(f"📈 Success rate: {(successful_teams/len(NFL_TEAMS)*100):.1f}%")

    except Exception as e:
        print(f"❌ Error writing output file: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()