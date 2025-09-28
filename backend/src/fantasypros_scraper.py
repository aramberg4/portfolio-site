"""
FantasyPros Scraper for Real 2025 NFL Target Share Data
Scrapes actual target distribution data from FantasyPros for weeks 1-3 of 2025 season
"""

import requests
from bs4 import BeautifulSoup
import pandas as pd
import json
from typing import Dict, List, Optional
import time
try:
    from .nfl_player_db import get_player_photo_url, get_player_espn_id
except ImportError:
    from nfl_player_db import get_player_photo_url, get_player_espn_id


class FantasyProsScraper:
    """Scraper for real 2025 target share data from FantasyPros"""

    def __init__(self):
        self.base_url = "https://www.fantasypros.com"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })

    def scrape_position_targets(self, position: str, year: int = 2025, start_week: int = 1, end_week: int = 3) -> List[Dict]:
        """
        Scrape target distribution data for a specific position from FantasyPros
        Position can be 'wr', 'rb', or 'te'
        """
        url = f"{self.base_url}/nfl/reports/targets-distribution/{position}.php?year={year}&start={start_week}&end={end_week}&show=totals"

        print(f"Scraping FantasyPros {position.upper()} target data: {url}")

        try:
            response = self.session.get(url, timeout=15)

            if response.status_code != 200:
                print(f"Failed to fetch {position.upper()} data: HTTP {response.status_code}")
                return []

            soup = BeautifulSoup(response.content, 'html.parser')

            # Look for the data table
            table = soup.find('table')

            if not table:
                print(f"Could not find data table on {position.upper()} page")
                return []

            players = []
            team_totals = {}  # Store total targets per team
            rows = table.find_all('tr')[1:]  # Skip header row

            # Team abbreviation mapping for FantasyPros full team names
            team_mapping = {
                'Arizona Cardinals': 'ARI', 'Atlanta Falcons': 'ATL', 'Baltimore Ravens': 'BAL',
                'Buffalo Bills': 'BUF', 'Carolina Panthers': 'CAR', 'Chicago Bears': 'CHI',
                'Cincinnati Bengals': 'CIN', 'Cleveland Browns': 'CLE', 'Dallas Cowboys': 'DAL',
                'Denver Broncos': 'DEN', 'Detroit Lions': 'DET', 'Green Bay Packers': 'GB',
                'Houston Texans': 'HOU', 'Indianapolis Colts': 'IND', 'Jacksonville Jaguars': 'JAX',
                'Kansas City Chiefs': 'KC', 'Las Vegas Raiders': 'LV', 'Los Angeles Chargers': 'LAC',
                'Los Angeles Rams': 'LAR', 'Miami Dolphins': 'MIA', 'Minnesota Vikings': 'MIN',
                'New England Patriots': 'NE', 'New Orleans Saints': 'NO', 'New York Giants': 'NYG',
                'New York Jets': 'NYJ', 'Philadelphia Eagles': 'PHI', 'Pittsburgh Steelers': 'PIT',
                'San Francisco 49ers': 'SF', 'Seattle Seahawks': 'SEA', 'Tampa Bay Buccaneers': 'TB',
                'Tennessee Titans': 'TEN', 'Washington Commanders': 'WAS'
            }

            for row in rows:
                cells = row.find_all('td')

                # Handle different table structures for different positions
                if position in ['wr', 'rb'] and len(cells) >= 8:
                    # WR/RB table: Team | Player1 | Targets | Player2 | Targets | Player3 | Targets | Total Targets
                    team_name = cells[0].get_text(strip=True)
                    team_abbr = team_mapping.get(team_name, team_name)
                    total_team_targets = int(cells[7].get_text(strip=True) or 0)
                    team_totals[team_abbr] = total_team_targets

                    # Extract Player1, Player2, Player3 data
                    player_data = [
                        {'name': cells[1].get_text(strip=True), 'targets': int(cells[2].get_text(strip=True) or 0)},
                        {'name': cells[3].get_text(strip=True), 'targets': int(cells[4].get_text(strip=True) or 0)},
                        {'name': cells[5].get_text(strip=True), 'targets': int(cells[6].get_text(strip=True) or 0)}
                    ]

                    # Add each player to our players list
                    for player in player_data:
                        if player['name'] and player['targets'] > 0:
                            players.append({
                                'name': player['name'],
                                'team': team_abbr,
                                'position': position.upper(),
                                'targets': player['targets'],
                                'season': year,
                                'weeks': f"{start_week}-{end_week}",
                                'total_team_targets': total_team_targets
                            })

                elif position == 'te' and len(cells) >= 6:
                    # TE table: Team | TE1 | Targets | TE2 | Targets | Total Targets
                    team_name = cells[0].get_text(strip=True)
                    team_abbr = team_mapping.get(team_name, team_name)
                    total_team_targets = int(cells[5].get_text(strip=True) or 0)
                    team_totals[team_abbr] = total_team_targets

                    # Extract TE1, TE2 data
                    player_data = [
                        {'name': cells[1].get_text(strip=True), 'targets': int(cells[2].get_text(strip=True) or 0)},
                        {'name': cells[3].get_text(strip=True), 'targets': int(cells[4].get_text(strip=True) or 0)}
                    ]

                    # Add each player to our players list
                    for player in player_data:
                        if player['name'] and player['targets'] > 0:
                            players.append({
                                'name': player['name'],
                                'team': team_abbr,
                                'position': position.upper(),
                                'targets': player['targets'],
                                'season': year,
                                'weeks': f"{start_week}-{end_week}",
                                'total_team_targets': total_team_targets
                            })

            print(f"Successfully scraped {len(players)} {position.upper()} players from FantasyPros")
            return players, team_totals

        except Exception as e:
            print(f"Error scraping FantasyPros {position.upper()}: {e}")
            return [], {}

    def scrape_target_distribution(self, year: int = 2025, start_week: int = 1, end_week: int = 3) -> List[Dict]:
        """
        Scrape target distribution data from FantasyPros
        Table structure: Team | WR1 | Targets | WR2 | Targets | WR3 | Targets | Total Targets
        """
        url = f"{self.base_url}/nfl/reports/targets-distribution/wr.php?year={year}&start={start_week}&end={end_week}&show=totals"

        print(f"Scraping FantasyPros target data: {url}")

        try:
            response = self.session.get(url, timeout=15)

            if response.status_code != 200:
                print(f"Failed to fetch data: HTTP {response.status_code}")
                return []

            soup = BeautifulSoup(response.content, 'html.parser')

            # Look for the data table
            table = soup.find('table')

            if not table:
                print("Could not find data table on page")
                return []

            players = []
            rows = table.find_all('tr')[1:]  # Skip header row

            # Team abbreviation mapping for FantasyPros full team names
            team_mapping = {
                'Arizona Cardinals': 'ARI', 'Atlanta Falcons': 'ATL', 'Baltimore Ravens': 'BAL',
                'Buffalo Bills': 'BUF', 'Carolina Panthers': 'CAR', 'Chicago Bears': 'CHI',
                'Cincinnati Bengals': 'CIN', 'Cleveland Browns': 'CLE', 'Dallas Cowboys': 'DAL',
                'Denver Broncos': 'DEN', 'Detroit Lions': 'DET', 'Green Bay Packers': 'GB',
                'Houston Texans': 'HOU', 'Indianapolis Colts': 'IND', 'Jacksonville Jaguars': 'JAX',
                'Kansas City Chiefs': 'KC', 'Las Vegas Raiders': 'LV', 'Los Angeles Chargers': 'LAC',
                'Los Angeles Rams': 'LAR', 'Miami Dolphins': 'MIA', 'Minnesota Vikings': 'MIN',
                'New England Patriots': 'NE', 'New Orleans Saints': 'NO', 'New York Giants': 'NYG',
                'New York Jets': 'NYJ', 'Philadelphia Eagles': 'PHI', 'Pittsburgh Steelers': 'PIT',
                'San Francisco 49ers': 'SF', 'Seattle Seahawks': 'SEA', 'Tampa Bay Buccaneers': 'TB',
                'Tennessee Titans': 'TEN', 'Washington Commanders': 'WAS'
            }

            for row in rows:
                cells = row.find_all('td')
                if len(cells) >= 8:  # Ensure we have all columns
                    try:
                        # Extract team name and convert to abbreviation
                        team_name = cells[0].get_text(strip=True)
                        team_abbr = team_mapping.get(team_name, team_name)

                        # Extract WR1, WR2, WR3 data
                        wr_data = [
                            {'name': cells[1].get_text(strip=True), 'targets': int(cells[2].get_text(strip=True) or 0)},
                            {'name': cells[3].get_text(strip=True), 'targets': int(cells[4].get_text(strip=True) or 0)},
                            {'name': cells[5].get_text(strip=True), 'targets': int(cells[6].get_text(strip=True) or 0)}
                        ]

                        total_team_targets = int(cells[7].get_text(strip=True) or 0)

                        # Add each WR to our players list
                        for wr in wr_data:
                            if wr['name'] and wr['targets'] > 0:  # Only add players with targets
                                # Calculate target share
                                target_share = (wr['targets'] / total_team_targets * 100) if total_team_targets > 0 else 0

                                players.append({
                                    'name': wr['name'],
                                    'team': team_abbr,
                                    'targets': wr['targets'],
                                    'receptions': 0,  # Not provided in this table
                                    'receiving_yards': 0,  # Not provided in this table
                                    'target_share': round(target_share, 1),
                                    'weeks': f"{start_week}-{end_week}",
                                    'season': year,
                                    'total_team_targets': total_team_targets
                                })

                    except (ValueError, IndexError) as e:
                        print(f"Error parsing row: {e}")
                        continue

            print(f"Successfully scraped {len(players)} players from FantasyPros")
            return players

        except Exception as e:
            print(f"Error scraping FantasyPros: {e}")
            return []

    def get_team_target_data_multi_position(self, team: str, week: int = None) -> List[Dict]:
        """
        Get target share data for a specific team from all positions (WR, RB, TE)
        Returns top 5 target leaders plus "Other" slice for remaining targets
        """
        try:
            # If specific week requested, use that week; otherwise default to aggregated weeks 1-3
            if week is not None:
                start_week = week
                end_week = week
                print(f"Scraping FantasyPros data for week {week} (individual week)")
            else:
                start_week = 1
                end_week = 3
                print(f"Scraping FantasyPros data for weeks {start_week}-{end_week} (aggregated)")

            # Scrape data from all three position tables with specific week parameters
            wr_players, wr_totals = self.scrape_position_targets('wr', start_week=start_week, end_week=end_week)
            rb_players, rb_totals = self.scrape_position_targets('rb', start_week=start_week, end_week=end_week)
            te_players, te_totals = self.scrape_position_targets('te', start_week=start_week, end_week=end_week)

            # Combine all players for the specified team
            all_team_players = []
            team_upper = team.upper()

            # Add WR players
            for player in wr_players:
                if player['team'] == team_upper:
                    all_team_players.append(player)

            # Add RB players
            for player in rb_players:
                if player['team'] == team_upper:
                    all_team_players.append(player)

            # Add TE players
            for player in te_players:
                if player['team'] == team_upper:
                    all_team_players.append(player)

            if not all_team_players:
                return []

            # Sort by targets descending and take top 5
            all_team_players.sort(key=lambda x: x['targets'], reverse=True)
            top_5_players = all_team_players[:5]

            # Calculate total_team_targets from all position tables
            total_team_targets = 0
            if team_upper in wr_totals:
                total_team_targets += wr_totals[team_upper]
            if team_upper in rb_totals:
                total_team_targets += rb_totals[team_upper]
            if team_upper in te_totals:
                total_team_targets += te_totals[team_upper]

            # Calculate total_named_targets (sum of top 5 players)
            total_named_targets = sum(player['targets'] for player in top_5_players)

            # Calculate remainder_targets for "Other" slice
            remainder_targets = total_team_targets - total_named_targets

            # Convert to API format
            result_players = []
            for player in top_5_players:
                # Calculate target share as percentage of total team targets
                target_share = (player['targets'] / total_team_targets * 100) if total_team_targets > 0 else 0

                result_players.append({
                    'name': player['name'],
                    'position': player['position'],
                    'targets': player['targets'],
                    'receptions': 0,  # Not provided in FantasyPros target distribution
                    'receiving_yards': 0,  # Not provided in FantasyPros target distribution
                    'targetShare': round(target_share, 1),
                    'player_id': get_player_espn_id(player['name']),
                    'photo': get_player_photo_url(player['name'])
                })

            # Add "Other" slice if there are remainder targets
            if remainder_targets > 0:
                other_target_share = (remainder_targets / total_team_targets * 100) if total_team_targets > 0 else 0
                result_players.append({
                    'name': 'Other',
                    'position': 'OTHER',
                    'targets': remainder_targets,
                    'receptions': 0,
                    'receiving_yards': 0,
                    'targetShare': round(other_target_share, 1),
                    'player_id': 'other',
                    'photo': "https://a.espncdn.com/i/headshots/nfl/players/full/default.png"
                })

            print(f"Team {team}: Total targets={total_team_targets}, Named targets={total_named_targets}, Other targets={remainder_targets}")

            return result_players

        except Exception as e:
            print(f"Error getting multi-position team target data for {team}: {e}")
            return []

    def get_team_target_data(self, team: str, weeks: str = "1-3") -> List[Dict]:
        """
        Get target share data for a specific team from scraped data (WR only - legacy method)
        """
        # First scrape all data
        all_players = self.scrape_target_distribution()

        # Filter by team
        team_players = []
        for player in all_players:
            if player['team'].upper() == team.upper():
                # Convert to our API format
                team_players.append({
                    'name': player['name'],
                    'position': 'WR',  # FantasyPros WR page only has WRs
                    'targets': player['targets'],
                    'receptions': player['receptions'],
                    'receiving_yards': player['receiving_yards'],
                    'targetShare': round(player['target_share'], 1),
                    'player_id': get_player_espn_id(player['name']),
                    'photo': get_player_photo_url(player['name'])
                })

        # Sort by target share descending
        team_players.sort(key=lambda x: x['targetShare'], reverse=True)

        return team_players

    def save_scraped_data(self, filename: str = "fantasypros_2025_weeks_1_3.json"):
        """
        Scrape and save all target data to a JSON file
        """
        data = self.scrape_target_distribution()

        output = {
            'source': 'fantasypros',
            'year': 2025,
            'weeks': '1-3',
            'scraped_at': time.time(),
            'players': data
        }

        with open(filename, 'w') as f:
            json.dump(output, f, indent=2)

        print(f"Saved {len(data)} players to {filename}")
        return data


if __name__ == "__main__":
    scraper = FantasyProsScraper()

    # Test scraping
    data = scraper.scrape_target_distribution()
    print(f"Scraped {len(data)} players")

    if data:
        # Show sample
        print("\nSample data:")
        for player in data[:5]:
            print(f"{player['name']} ({player['team']}): {player['targets']} targets, {player['target_share']}%")

        # Test team filtering
        print(f"\nKC players:")
        kc_players = scraper.get_team_target_data('KC')
        for player in kc_players:
            print(f"{player['name']}: {player['targets']} targets, {player['targetShare']}%")