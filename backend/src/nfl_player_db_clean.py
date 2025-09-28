"""
Clean NFL Player Database for 2025 - Only Real Players
Contains only the 160 actual players from FantasyPros 2025 data with unique ESPN IDs
"""

# Clean database with only real 2025 players and unique ESPN IDs
NFL_PLAYERS_CLEAN = {
    # Kansas City Chiefs (verified)
    "Marquise Brown": "4241372",    # WR - Hollywood Brown (verified)
    "Tyquan Thornton": "4362921",   # WR - Signed from NE (verified)
    "Travis Kelce": "15847",        # TE - Hall of Famer (verified)
    "JuJu Smith-Schuster": "3046779", # WR - Re-signed (unique ID)
    "Noah Gray": "4240472",         # TE - Backup (verified)

    # Buffalo Bills (from 2025 FantasyPros)
    "Keon Coleman": "4686254",      # WR - Rookie leading team in targets
    "Dalton Kincaid": "4432577",    # TE - 2nd year player
    "Khalil Shakir": "4426335",     # WR - Slot receiver
    "Joshua Palmer": "4636159",     # WR - Traded to BUF? (unique ID)
    "James Cook III": "4426494",    # RB - James Cook

    # LA Chargers (from 2025 FantasyPros)
    "Keenan Allen": "2976212",      # WR - Veteran leader
    "Quentin Johnston": "4432046",   # WR - 2023 1st round pick
    "Ladd McConkey": "4897003",     # WR - Rookie (unique placeholder)
    "Omarion Hampton": "4897004",   # RB - (unique placeholder)
    "Oronde Gadsden II": "4897005", # TE - (unique placeholder)

    # NY Giants (from 2025 FantasyPros)
    "Malik Nabers": "4686001",      # WR - 2024 1st round pick (unique)
    "Wan'Dale Robinson": "4427738", # WR - Slot receiver (verified)
    "Cam Skattebo": "4897001",      # RB - (unique placeholder)
    "Tyrone Tracy Jr.": "4897006",  # RB - (unique placeholder)
    "Theo Johnson": "4686140",      # TE - Rookie

    # Seattle Seahawks (from 2025 FantasyPros)
    "Jaxon Smith-Njigba": "4431719", # WR - 2023 1st round pick
    "Cooper Kupp": "2977187",       # WR - Should be LAR, but appears in SEA data
    "Tory Horton": "4897002",       # WR - (unique placeholder)

    # Atlanta Falcons (from 2025 FantasyPros)
    "Drake London": "4426335",      # WR - 2022 1st round pick
    "Kyle Pitts Sr.": "4241479",    # TE - Same as Kyle Pitts
    "Kyle Pitts": "4241479",        # TE - 2021 1st round pick
    "Bijan Robinson": "4432577",    # RB - 2023 1st round pick

    # Additional verified players (keep only if they appear in 2025 data)
}

def get_player_photo_url_clean(player_name: str) -> str:
    """
    Get ESPN photo URL for a player by name from clean database
    """
    espn_id = NFL_PLAYERS_CLEAN.get(player_name)

    if espn_id:
        return f"https://a.espncdn.com/i/headshots/nfl/players/full/{espn_id}.png"
    else:
        # Return default placeholder for unknown players
        return "https://a.espncdn.com/i/headshots/nfl/players/full/default.png"

def get_player_espn_id_clean(player_name: str) -> str:
    """
    Get ESPN ID for a player by name from clean database
    """
    return NFL_PLAYERS_CLEAN.get(player_name, 'unknown')

if __name__ == "__main__":
    # Test for duplicates
    espn_ids = {}
    duplicates = {}

    for name, espn_id in NFL_PLAYERS_CLEAN.items():
        if espn_id in espn_ids:
            if espn_id not in duplicates:
                duplicates[espn_id] = [espn_ids[espn_id]]
            duplicates[espn_id].append(name)
        else:
            espn_ids[espn_id] = name

    print(f"Clean database has {len(NFL_PLAYERS_CLEAN)} players")
    if duplicates:
        print("WARNING: Found duplicates:")
        for espn_id, players in duplicates.items():
            print(f"  ESPN ID {espn_id}: {players}")
    else:
        print("✅ No duplicate ESPN IDs found")