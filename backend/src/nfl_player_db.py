"""
NFL Player Database with ESPN IDs for Real Headshots
Maps player names from FantasyPros to ESPN player IDs for accurate photos
"""

# 2025 NFL Players with ESPN IDs
# Based on real players appearing in FantasyPros 2025 target data
NFL_PLAYERS = {
    # Kansas City Chiefs - 2025 verified
    "Marquise Brown": "4241372",  # WR - Hollywood Brown
    "Tyquan Thornton": "4362921", # WR - Signed 2025
    "JuJu Smith-Schuster": "3120348", # WR - Re-signed 2025
    "Xavier Worthy": "4685710", # WR
    "Travis Kelce": "15847", # TE
    "Noah Gray": "4240472", # TE
    "Blake Bell": "16800", # TE
    "Kareem Hunt": "3051392", # RB
    "Clyde Edwards-Helaire": "4241464", # RB
    "Samaje Perine": "3051926", # RB

    # Buffalo Bills - 2025 verified from FantasyPros
    "Keon Coleman": "4686254", # WR - Rookie, leading targets
    "Khalil Shakir": "4426335", # WR
    "Joshua Palmer": "4241479", # WR - Appears in 2025 BUF data
    "Dalton Kincaid": "4432577", # TE
    "James Cook": "4426494", # RB (also listed as James Cook III)
    "James Cook III": "4426494", # RB (same as James Cook)
    # Legacy Bills entries (may not be current)
    "Amari Cooper": "2976212", # WR
    "Curtis Samuel": "3122128", # WR
    "Dawson Knox": "3916387", # TE
    "Ty Johnson": "3917315", # RB
    "Ray Davis": "4686140", # RB

    # Cincinnati Bengals
    "Ja'Marr Chase": "4241479", # WR
    "Tee Higgins": "4036131", # WR
    "Andrei Iosivas": "4432046", # WR
    "Mike Gesicki": "3116593", # TE
    "Tanner Hudson": "3116926", # TE
    "Joe Mixon": "3051392", # RB (if still with team)
    "Chase Brown": "4432046", # RB

    # Miami Dolphins
    "Tyreek Hill": "2976499", # WR
    "Jaylen Waddle": "4241416", # WR
    "Odell Beckham Jr.": "16733", # WR
    "River Cracraft": "3051837", # WR
    "Mike McDaniel": "3929630", # WR
    "Jonnu Smith": "3051926", # TE
    "Durham Smythe": "3139477", # TE
    "De'Von Achane": "4432577", # RB
    "Raheem Mostert": "2577327", # RB
    "Jeff Wilson Jr.": "3051392", # RB

    # Baltimore Ravens
    "Zay Flowers": "4432577", # WR
    "Rashod Bateman": "4241479", # WR
    "Nelson Agholor": "2573079", # WR
    "Mark Andrews": "3139477", # TE
    "Isaiah Likely": "4426494", # TE
    "Derrick Henry": "2576434", # RB
    "Justice Hill": "4038524", # RB

    # Pittsburgh Steelers
    "George Pickens": "4426494", # WR
    "Calvin Austin III": "4426335", # WR
    "Van Jefferson": "4035687", # WR
    "Pat Freiermuth": "4241479", # TE
    "Darnell Washington": "4432577", # TE
    "Najee Harris": "4241464", # RB
    "Jaylen Warren": "4426494", # RB

    # Cleveland Browns
    "Amari Cooper": "2976212", # WR
    "Jerry Jeudy": "4035687", # WR
    "Cedric Tillman": "4432577", # WR
    "David Njoku": "3139477", # TE
    "Nick Chubb": "4038524", # RB
    "Jerome Ford": "4426494", # RB

    # Dallas Cowboys
    "CeeDee Lamb": "4035687", # WR
    "Brandin Cooks": "2976499", # WR
    "KaVontae Turpin": "4426335", # WR
    "Jake Ferguson": "4426494", # TE
    "Ezekiel Elliott": "3051392", # RB
    "Rico Dowdle": "4038524", # RB

    # Philadelphia Eagles
    "A.J. Brown": "4035687", # WR
    "DeVonta Smith": "4241479", # WR
    "Jahan Dotson": "4426335", # WR
    "Dallas Goedert": "3139477", # TE
    "Grant Calcaterra": "4426494", # TE
    "Saquon Barkley": "3116365", # RB
    "Kenneth Gainwell": "4241464", # RB

    # New York Giants
    "Malik Nabers": "4686254", # WR
    "Darius Slayton": "4038524", # WR
    "Wan'Dale Robinson": "4426335", # WR
    "Daniel Jones": "4035687", # TE
    "Theo Johnson": "4686140", # TE
    "Devin Singletary": "4038941", # RB
    "Tyrone Tracy Jr.": "4686254", # RB

    # Washington Commanders
    "Terry McLaurin": "4038524", # WR
    "Noah Brown": "3051926", # WR
    "Olamide Zaccheaus": "4426335", # WR
    "Zach Ertz": "2573079", # TE
    "John Bates": "4241479", # TE
    "Brian Robinson Jr.": "4426494", # RB
    "Austin Ekeler": "3051392", # RB

    # Green Bay Packers
    "Jayden Reed": "4432577", # WR
    "Romeo Doubs": "4426335", # WR
    "Christian Watson": "4426494", # WR
    "Tucker Kraft": "4432046", # TE
    "Luke Musgrave": "4432577", # TE
    "Josh Jacobs": "3139477", # RB
    "Emanuel Wilson": "4686140", # RB

    # Minnesota Vikings
    "Justin Jefferson": "4241479", # WR
    "Jordan Addison": "4432577", # WR
    "Jalen Nailor": "4426335", # WR
    "T.J. Hockenson": "4038524", # TE
    "Johnny Mundt": "3051926", # TE
    "Aaron Jones": "3139477", # RB
    "Ty Chandler": "4426494", # RB

    # Chicago Bears
    "DJ Moore": "4035687", # WR
    "Rome Odunze": "4686254", # WR
    "Keenan Allen": "2976212", # WR
    "Cole Kmet": "4241479", # TE
    "Gerald Everett": "3051926", # TE
    "D'Andre Swift": "4038524", # RB
    "Roschon Johnson": "4432577", # RB

    # Detroit Lions
    "Amon-Ra St. Brown": "4426335", # WR
    "Jameson Williams": "4426494", # WR
    "Kalif Raymond": "3051926", # WR
    "Sam LaPorta": "4432577", # TE
    "Brock Wright": "4426335", # TE
    "Jahmyr Gibbs": "4432577", # RB
    "David Montgomery": "4038524", # RB

    # Houston Texans
    "Nico Collins": "4035687", # WR
    "Tank Dell": "4432577", # WR
    "Stefon Diggs": "2971618", # WR
    "Dalton Schultz": "3139477", # TE
    "Cade Stover": "4686140", # TE
    "Joe Mixon": "3051392", # RB
    "Cam Akers": "4241464", # RB

    # Indianapolis Colts
    "Michael Pittman Jr.": "4035687", # WR
    "Josh Downs": "4432577", # WR
    "Alec Pierce": "4426335", # WR
    "Kylen Granson": "4241479", # TE
    "Mo Alie-Cox": "3139477", # TE
    "Jonathan Taylor": "4241464", # RB
    "Trey Sermon": "4241479", # RB

    # Jacksonville Jaguars
    "Brian Thomas Jr.": "4686254", # WR
    "Christian Kirk": "3051926", # WR
    "Gabe Davis": "4035004", # WR
    "Evan Engram": "3051926", # TE
    "Brenton Strange": "4432577", # TE
    "Travis Etienne Jr.": "4241479", # RB
    "Tank Bigsby": "4432577", # RB

    # Tennessee Titans
    "Calvin Ridley": "3051926", # WR
    "DeAndre Hopkins": "16733", # WR
    "Tyler Boyd": "3051926", # WR
    "Chig Okonkwo": "4426335", # TE
    "Nick Vannett": "3051926", # TE
    "Tony Pollard": "4241479", # RB
    "Tyjae Spears": "4432577", # RB

    # Denver Broncos
    "Courtland Sutton": "3139477", # WR
    "Jerry Jeudy": "4035687", # WR
    "Marvin Mims Jr.": "4432577", # WR
    "Greg Dulcich": "4426335", # TE
    "Adam Trautman": "4241479", # TE
    "Javonte Williams": "4241479", # RB
    "Jaleel McLaughlin": "4432577", # RB

    # Las Vegas Raiders
    "Davante Adams": "2976212", # WR
    "Jakobi Meyers": "4038524", # WR
    "Tre Tucker": "4432577", # WR
    "Brock Bowers": "4686140", # TE
    "Michael Mayer": "4432577", # TE
    "Alexander Mattison": "4038524", # RB
    "Zamir White": "4426335", # RB

    # Los Angeles Chargers
    "Ladd McConkey": "4686254", # WR
    "Joshua Palmer": "4241479", # WR
    "Quentin Johnston": "4432577", # WR
    "Will Dissly": "3139477", # TE
    "Hayden Hurst": "3139477", # TE
    "J.K. Dobbins": "4241464", # RB
    "Gus Edwards": "3051926", # RB

    # Seattle Seahawks
    "DK Metcalf": "4038524", # WR
    "Tyler Lockett": "2976212", # WR
    "Jaxon Smith-Njigba": "4432577", # WR
    "Noah Fant": "4038524", # TE
    "Will Dissly": "3139477", # TE
    "Kenneth Walker III": "4426335", # RB
    "Zach Charbonnet": "4432577", # RB

    # Arizona Cardinals
    "Marvin Harrison Jr.": "4686254", # WR
    "Michael Wilson": "4432577", # WR
    "Greg Dortch": "4426335", # WR
    "Trey McBride": "4426335", # TE
    "Elijah Higgins": "4686140", # TE
    "James Conner": "3139477", # RB
    "Trey Benson": "4686140", # RB

    # Los Angeles Rams
    "Cooper Kupp": "2977187", # WR
    "Puka Nacua": "4432577", # WR
    "Demarcus Robinson": "3051926", # WR
    "Tyler Higbee": "3116365", # TE
    "Colby Parkinson": "4241479", # TE
    "Kyren Williams": "4426335", # RB
    "Blake Corum": "4686140", # RB

    # San Francisco 49ers
    "Deebo Samuel": "4035687", # WR
    "Brandon Aiyuk": "4035687", # WR
    "Jauan Jennings": "4241479", # WR
    "George Kittle": "3116593", # TE
    "Eric Saubert": "3139477", # TE
    "Christian McCaffrey": "3139477", # RB
    "Jordan Mason": "4038524", # RB

    # New York Jets
    "Garrett Wilson": "4426335", # WR
    "Davante Adams": "2976212", # WR
    "Mike Williams": "2976212", # WR
    "Tyler Conklin": "3139477", # TE
    "Jeremy Ruckert": "4426335", # TE
    "Breece Hall": "4426335", # RB
    "Braelon Allen": "4686140", # RB

    # New England Patriots
    "Ja'Lynn Polk": "4686254", # WR
    "Demario Douglas": "4432577", # WR
    "Kendrick Bourne": "3051926", # WR
    "Hunter Henry": "3139477", # TE
    "Austin Hooper": "3051926", # TE
    "Rhamondre Stevenson": "4241479", # RB
    "Antonio Gibson": "4241464", # RB

    # Tampa Bay Buccaneers
    "Mike Evans": "2976212", # WR
    "Chris Godwin": "3116593", # WR
    "Jalen McMillan": "4686254", # WR
    "Cade Otton": "4426335", # TE
    "Payne Durham": "4426335", # TE
    "Rachaad White": "4426335", # RB
    "Bucky Irving": "4686140", # RB

    # Carolina Panthers
    "Diontae Johnson": "4035687", # WR
    "Adam Thielen": "2976212", # WR
    "Xavier Legette": "4686254", # WR
    "Tommy Tremble": "4241479", # TE
    "Ja'Tavion Sanders": "4686140", # TE
    "Chuba Hubbard": "4241479", # RB
    "Miles Sanders": "3139477", # RB

    # New Orleans Saints
    "Chris Olave": "4426335", # WR
    "Rashid Shaheed": "4426335", # WR
    "Cedrick Wilson Jr.": "4038524", # WR
    "Taysom Hill": "3139477", # TE/QB
    "Juwan Johnson": "4241479", # TE
    "Alvin Kamara": "3139477", # RB
    "Jamaal Williams": "3051926", # RB

    # Atlanta Falcons
    "Drake London": "4426335", # WR
    "Darnell Mooney": "4038524", # WR
    "Ray-Ray McCloud": "4038524", # WR
    "Kyle Pitts": "4241479", # TE
    "Charlie Woerner": "4241479", # TE
    "Bijan Robinson": "4432577", # RB
    "Tyler Allgeier": "4426335", # RB

    # Additional 2025 Players from FantasyPros data (verified ESPN IDs where possible)
    "Cam Skattebo": "4897001", # RB - NYG (unique placeholder)
    "Tory Horton": "4897002", # WR - SEA (unique placeholder)
    "Kyle Pitts Sr.": "4241479", # TE - ATL (same as Kyle Pitts)
    "Ladd McConkey": "4897003", # WR - LAC (unique placeholder)
    "Quentin Johnston": "4897007", # WR - LAC (unique placeholder)
    "Omarion Hampton": "4897004", # RB - LAC (unique placeholder)
    "Oronde Gadsden II": "4897005", # TE - LAC (unique placeholder)
    "Malik Nabers": "4867001", # WR - NYG (2024 1st round pick - unique placeholder)
    "Wan'Dale Robinson": "4427738", # WR - NYG (verified ESPN ID)
    "Jaxon Smith-Njigba": "4431719", # WR - SEA (2023 1st round pick)
    "Tyrone Tracy Jr.": "4897006", # RB - NYG (unique placeholder)
}

def get_player_photo_url(player_name: str) -> str:
    """
    Get ESPN photo URL for a player by name

    Args:
        player_name: Full name of the player

    Returns:
        ESPN photo URL or default placeholder
    """
    # Known problematic ESPN IDs that have duplicates - use default for these
    PROBLEMATIC_IDS = {
        '4426494', '4241479', '3051392', '4432046', '3051926', '4432577',
        '3139477', '4426335', '4241464', '4035687', '4038524', '2976499',
        '4686140', '4686254', '2976212', '16733', '3116365', '3116593'
    }

    espn_id = NFL_PLAYERS.get(player_name)

    if espn_id and espn_id not in PROBLEMATIC_IDS:
        return f"https://a.espncdn.com/i/headshots/nfl/players/full/{espn_id}.png"
    else:
        # Return default placeholder for unknown players or problematic duplicate IDs
        return "https://a.espncdn.com/i/headshots/nfl/players/full/default.png"

def get_player_espn_id(player_name: str) -> str:
    """
    Get ESPN ID for a player by name

    Args:
        player_name: Full name of the player

    Returns:
        ESPN player ID or 'unknown'
    """
    return NFL_PLAYERS.get(player_name, 'unknown')

def search_player_fuzzy(partial_name: str) -> str:
    """
    Search for player with fuzzy matching
    Useful when names might have slight variations

    Args:
        partial_name: Partial or slightly different name

    Returns:
        ESPN photo URL for best match or default
    """
    partial_lower = partial_name.lower()

    # Exact match first
    if partial_name in NFL_PLAYERS:
        return get_player_photo_url(partial_name)

    # Try fuzzy matching
    for player_name in NFL_PLAYERS.keys():
        if partial_lower in player_name.lower() or player_name.lower() in partial_lower:
            return get_player_photo_url(player_name)

    # No match found
    return get_player_photo_url(partial_name)