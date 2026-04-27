# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json
import hashlib

@allow_storage
@dataclass
class Player:
    address: str
    xp: u256  # Changed int to u256
    streak: u256
    games_played: u256
    correct_votes: u256
    successful_bluffs: u256
    successful_appeals: u256
    badge: str

@allow_storage
@dataclass
class Vote:
    player: str
    commit_hash: str
    vote: str
    stake: u256
    bluff: str
    revealed: bool

@allow_storage
@dataclass
class Appeal:
    player: str
    xp_spent: u256
    resolved: bool
    overturned: bool

@allow_storage
@dataclass
class Round:
    round_number: u256
    claim: str
    source_url: str
    category: str
    difficulty: str
    difficulty_multiplier: float
    votes: DynArray[Vote]  # Use DynArray
    verdict: str
    validator_breakdown: str
    appeal: Appeal | None
    phase: str
    phase_deadline: u256

@allow_storage
@dataclass
class Room:
    room_id: str
    host: str
    players: DynArray[str]
    status: str
    room_type: str
    current_round: u256
    total_rounds: u256
    rounds: DynArray[Round]
    leader_validator: str
    category_votes: DynArray[str]
    created_at: u256
    spectators: DynArray[str]

class GenJury(gl.Contract):
    # Fixed lines 75 & 76: Use u256 and provide default values
    rooms: TreeMap[str, Room]
    players: TreeMap[str, Player]
    global_leaderboard: DynArray[str]
    season_number: u256 = u256(1)
    season_end: u256 = u256(0)

    def __init__(self):
        self.rooms = TreeMap()
        self.players = TreeMap()
        self.global_leaderboard = DynArray()
        self.season_number = u256(1)
        self.season_end = u256(0)

    @gl.public.write
    def register_player(self) -> None:
        addr = gl.message.sender_address
        if addr not in self.players:
            # Note: 100 becomes u256(100)
            self.players[addr] = Player(
                address=addr, xp=u256(100), streak=u256(0), games_played=u256(0),
                correct_votes=u256(0), successful_bluffs=u256(0), successful_appeals=u256(0), 
                badge="Rookie"
            )
            self.global_leaderboard.append(addr)
