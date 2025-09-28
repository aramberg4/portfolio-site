"""
NFL Data Scraper for Target Share Analysis
Uses nfl-data-py to fetch real NFL statistics and calculate target shares
"""

import nfl_data_py as nfl
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import os
from typing import Dict, List, Optional, Tuple


class NFLDataScraper:
    """Handles fetching and processing NFL data for target share analysis"""

    def __init__(self, data_dir: str = "./data"):
        self.data_dir = data_dir
        self.current_season = self._get_current_season()
        self.team_mapping = self._get_team_mapping()

        # Ensure data directory exists
        os.makedirs(data_dir, exist_ok=True)

    def _get_current_season(self) -> int:
        """Determine current NFL season based on date and data availability"""
        today = datetime.now()

        # Calculate what season we should be in based on date
        if today.month < 3:
            expected_season = today.year - 1
        elif today.month < 9:
            expected_season = today.year - 1
        else:
            expected_season = today.year

        # Check if expected season data is actually available
        try:
            test_data = nfl.import_weekly_data(years=[expected_season], columns=['player_id'])
            if not test_data.empty:
                print(f"✅ {expected_season} season data is available")
                return expected_season
        except Exception as e:
            print(f"⚠️ {expected_season} season data not available: {e}")

        # Fall back to 2024 if current season isn't available
        print(f"📅 Falling back to 2024 season data")
        return 2024

    def _get_team_mapping(self) -> Dict[str, str]:
        """Map frontend team IDs to nfl-data-py team codes"""
        return {
            'KC': 'KC', 'BUF': 'BUF', 'LAR': 'LA', 'TB': 'TB', 'DAL': 'DAL',
            'GB': 'GB', 'SF': 'SF', 'MIA': 'MIA', 'MIN': 'MIN', 'CHI': 'CHI',
            'CIN': 'CIN', 'NE': 'NE', 'NYJ': 'NYJ', 'LV': 'LV', 'LAC': 'LAC',
            'DEN': 'DEN', 'PIT': 'PIT', 'CLE': 'CLE', 'BAL': 'BAL', 'TEN': 'TEN',
            'IND': 'IND', 'HOU': 'HOU', 'JAX': 'JAX', 'WAS': 'WAS', 'NYG': 'NYG',
            'PHI': 'PHI', 'SEA': 'SEA', 'ARI': 'ARI', 'ATL': 'ATL', 'CAR': 'CAR',
            'NO': 'NO', 'DET': 'DET'
        }

    def _get_nfl_team_code(self, frontend_team_id: str) -> str:
        """Convert frontend team ID to nfl-data-py team code"""
        return self.team_mapping.get(frontend_team_id, frontend_team_id)

    def fetch_weekly_stats(self, season: int, week: int) -> pd.DataFrame:
        """Fetch weekly receiving statistics from nfl-data-py"""
        try:
            print(f"Fetching week {week} stats for {season} season...")

            # Get weekly data - includes receiving stats
            weekly_data = nfl.import_weekly_data(
                years=[season],
                columns=[
                    'player_id', 'player_name', 'player_display_name', 'position',
                    'recent_team', 'week', 'targets', 'receptions', 'receiving_yards',
                    'receiving_tds', 'target_share', 'air_yards_share',
                    'wopr', 'racr', 'headshot_url'
                ]
            )

            # Filter for specific week and relevant positions
            week_data = weekly_data[
                (weekly_data['week'] == week) &
                (weekly_data['position'].isin(['WR', 'TE', 'RB'])) &
                (weekly_data['targets'] > 0)  # Only players with targets
            ].copy()

            return week_data

        except Exception as e:
            print(f"Error fetching weekly stats: {e}")
            return pd.DataFrame()

    def calculate_team_target_shares(self, week_data: pd.DataFrame, team: str) -> List[Dict]:
        """Calculate target share percentages for a specific team"""
        try:
            # Convert frontend team ID to nfl-data-py team code
            nfl_team_code = self._get_nfl_team_code(team)

            # Filter for specific team
            team_data = week_data[week_data['recent_team'] == nfl_team_code].copy()

            if team_data.empty:
                return []

            # Calculate total team targets
            total_targets = team_data['targets'].sum()

            if total_targets == 0:
                return []

            # Calculate target share percentages
            team_data['target_share_pct'] = (team_data['targets'] / total_targets * 100).round(1)

            # Sort by target share descending
            team_data = team_data.sort_values('target_share_pct', ascending=False)

            # Convert to our frontend format
            players = []
            for _, player in team_data.iterrows():
                players.append({
                    'name': player['player_display_name'] or player['player_name'],
                    'position': player['position'],
                    'targets': int(player['targets']),
                    'receptions': int(player['receptions']) if pd.notna(player['receptions']) else 0,
                    'receiving_yards': int(player['receiving_yards']) if pd.notna(player['receiving_yards']) else 0,
                    'targetShare': float(player['target_share_pct']),
                    'player_id': player['player_id'],
                    'photo': player.get('headshot_url', f"https://a.espncdn.com/i/headshots/nfl/players/full/{player['player_id']}.png")
                })

            return players

        except Exception as e:
            print(f"Error calculating target shares for {team}: {e}")
            return []

    def get_current_week(self) -> int:
        """Determine current NFL week based on date"""
        # For 2024 data demo, return week 4 (has good data)
        # TODO: Update to dynamic logic when using current season data
        return 4

        # Original logic (commented out until using current season):
        # try:
        #     schedule = nfl.import_schedules([self.current_season])
        #     today = datetime.now().date()
        #     current_week = 1
        #     for week in range(1, 19):
        #         week_games = schedule[schedule['week'] == week]
        #         if not week_games.empty:
        #             latest_game = pd.to_datetime(week_games['gameday']).max().date()
        #             if today <= latest_game + timedelta(days=3):
        #                 current_week = week
        #                 break
        #             elif week == 18:
        #                 current_week = 18
        #     return current_week
        # except Exception as e:
        #     print(f"Error determining current week: {e}")
        #     season_start = datetime(self.current_season, 9, 5)
        #     weeks_elapsed = (datetime.now() - season_start).days // 7
        #     return max(1, min(18, weeks_elapsed + 1))

    def get_team_target_data(self, team: str, week: int, season: Optional[int] = None) -> Dict:
        """Get target share data for a specific team and week"""
        if season is None:
            season = self.current_season

        try:
            # Check cache first
            cache_file = f"{self.data_dir}/week_{week}_{season}.json"
            if os.path.exists(cache_file):
                # Check if cache is recent (less than 6 hours old)
                cache_age = datetime.now() - datetime.fromtimestamp(os.path.getmtime(cache_file))
                if cache_age < timedelta(hours=6):
                    with open(cache_file, 'r') as f:
                        cached_data = json.load(f)
                        if team in cached_data:
                            response_data = {
                                'success': True,
                                'data': cached_data[team],
                                'week': week,
                                'season': season,
                                'lastUpdated': datetime.fromtimestamp(os.path.getmtime(cache_file)).isoformat(),
                                'source': 'cache'
                            }

                            # Add notice if we're not showing current season data
                            current_year = datetime.now().year
                            if season < current_year:
                                response_data['notice'] = f'Showing {season} season data - {current_year} season not yet available'

                            return response_data

            # Fetch fresh data
            week_data = self.fetch_weekly_stats(season, week)

            if week_data.empty:
                return {
                    'success': False,
                    'error': f'No data available for week {week} of {season} season',
                    'data': []
                }

            # Calculate target shares for the specific team
            team_targets = self.calculate_team_target_shares(week_data, team)

            # Cache the data for all teams
            all_teams_data = {}
            for team_abbr in self.team_mapping.keys():
                all_teams_data[team_abbr] = self.calculate_team_target_shares(week_data, team_abbr)

            with open(cache_file, 'w') as f:
                json.dump(all_teams_data, f, indent=2)

            response_data = {
                'success': True,
                'data': team_targets,
                'week': week,
                'season': season,
                'lastUpdated': datetime.now().isoformat(),
                'source': 'fresh'
            }

            # Add notice if we're not showing current season data
            current_year = datetime.now().year
            if season < current_year:
                response_data['notice'] = f'Showing {season} season data - {current_year} season not yet available'

            return response_data

        except Exception as e:
            print(f"Error getting team target data: {e}")
            return {
                'success': False,
                'error': str(e),
                'data': []
            }

    def get_all_teams_data(self, week: int, season: Optional[int] = None) -> Dict:
        """Get target share data for all teams for a specific week"""
        if season is None:
            season = self.current_season

        try:
            week_data = self.fetch_weekly_stats(season, week)

            if week_data.empty:
                return {
                    'success': False,
                    'error': f'No data available for week {week} of {season} season',
                    'data': []
                }

            all_teams = []
            for team_abbr in self.team_mapping.keys():
                team_targets = self.calculate_team_target_shares(week_data, team_abbr)
                if team_targets:  # Only include teams with data
                    all_teams.append({
                        'team': team_abbr,
                        'data': team_targets
                    })

            return {
                'success': True,
                'data': all_teams,
                'week': week,
                'season': season,
                'lastUpdated': datetime.now().isoformat()
            }

        except Exception as e:
            print(f"Error getting all teams data: {e}")
            return {
                'success': False,
                'error': str(e),
                'data': []
            }

    def refresh_data(self) -> Dict:
        """Refresh data for current week"""
        current_week = self.get_current_week()

        try:
            # Clear cache for current week
            cache_file = f"{self.data_dir}/week_{current_week}_{self.current_season}.json"
            if os.path.exists(cache_file):
                os.remove(cache_file)

            # Fetch fresh data for all teams
            result = self.get_all_teams_data(current_week)

            return {
                'success': result['success'],
                'message': f'Data refreshed for week {current_week}',
                'week': current_week,
                'teams_updated': len(result.get('data', [])),
                'lastUpdated': datetime.now().isoformat()
            }

        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to refresh data: {str(e)}'
            }


# Test the scraper
if __name__ == "__main__":
    scraper = NFLDataScraper()

    # Test with current week and KC
    current_week = scraper.get_current_week()
    print(f"Current week: {current_week}")

    # Test data fetching
    result = scraper.get_team_target_data('KC', current_week)
    print(f"KC target data: {json.dumps(result, indent=2)}")