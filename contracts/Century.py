# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json
import hashlib

@dataclass
class Player:
    address: str
    xp: int
    streak: int
    games_played: int
    correct_votes: int
    successful_bluffs: int
    successful_appeals: int
    badge: str

@dataclass
class Vote:
    player: str
    commit_hash: str
    vote: str
    stake: int
    bluff: str
    revealed: bool

@dataclass
class Appeal:
    player: str
    xp_spent: int
    resolved: bool
    overturned: bool

@dataclass
class Round:
    round_number: int
    claim: str
    source_url: str
    category: str
    difficulty: str
    difficulty_multiplier: float
    votes: dynarray[Vote]
    verdict: str
    validator_breakdown: str
    appeal: Appeal | None
    phase: str
    phase_deadline: int

@dataclass
class Room:
    room_id: str
    host: str
    players: dynarray[str]
    status: str
    room_type: str
    current_round: int
    total_rounds: int
    rounds: dynarray[Round]
    leader_validator: str
    category_votes: dynarray[str]
    created_at: int
    spectators: dynarray[str]

class GenJury(gl.Contract):
    # State variables must be defined here
    rooms: TreeMap[str, Room]
    players: TreeMap[str, Player]
    global_leaderboard: dynarray[str]
    season_number: int
    season_end: int

    def __init__(self):
        self.rooms = TreeMap()
        self.players = TreeMap()
        self.global_leaderboard = dynarray()
        # Ensure these match the types defined above
        self.season_number = 1
        self.season_end = 0

    @gl.public.write
    def register_player(self) -> None:
        addr = gl.message.sender_address
        if addr not in self.players:
            new_player = Player(
                address=addr,
                xp=100,
                streak=0,
                games_played=0,
                correct_votes=0,
                successful_bluffs=0,
                successful_appeals=0,
                badge="Rookie"
            )
            self.players[addr] = new_player
            self.global_leaderboard.append(addr)
