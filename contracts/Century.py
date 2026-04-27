# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json
import hashlib

# 1. Added @allow_storage to all dataclasses
@allow_storage
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

@allow_storage
@dataclass
class Vote:
    player: str
    commit_hash: str
    vote: str
    stake: int
    bluff: str
    revealed: bool

@allow_storage
@dataclass
class Appeal:
    player: str
    xp_spent: int
    resolved: bool
    overturned: bool

@allow_storage
@dataclass
class Round:
    round_number: int
    claim: str
    source_url: str
    category: str
    difficulty: str
    difficulty_multiplier: float
    votes: DynArray[Vote] # Use DynArray
    verdict: str
    validator_breakdown: str
    appeal: Appeal | None
    phase: str
    phase_deadline: int

@allow_storage
@dataclass
class Room:
    room_id: str
    host: str
    players: DynArray[str] # Use DynArray
    status: str
    room_type: str
    current_round: int
    total_rounds: int
    rounds: DynArray[Round]
    leader_validator: str
    category_votes: DynArray[str]
    created_at: int
    spectators: DynArray[str]

class GenJury(gl.Contract):
    # 2. Used DynArray for state variables
    rooms: TreeMap[str, Room]
    players: TreeMap[str, Player]
    global_leaderboard: DynArray[str]
    season_number: int
    season_end: int

    def __init__(self):
        self.rooms = TreeMap()
        self.players = TreeMap()
        self.global_leaderboard = DynArray()
        self.season_number = 1
        self.season_end = 0

    @gl.public.write
    def register_player(self) -> None:
        addr = gl.message.sender_address
        if addr not in self.players:
            self.players[addr] = Player(
                address=addr, xp=100, streak=0, games_played=0,
                correct_votes=0, successful_bluffs=0, successful_appeals=0, badge="Rookie"
            )
            self.global_leaderboard.append(addr)

    @gl.public.write
    def create_room(self, room_id: str, room_type: str, total_rounds: int) -> None:
        addr = gl.message.sender_address
        if addr not in self.players:
            raise gl.vm.UserError("Register first")
        
        # 3. Initialize DynArrays as empty, then append
        room = Room(
            room_id=room_id,
            host=addr,
            players=DynArray(),
            status="waiting",
            room_type=room_type,
            current_round=0,
            total_rounds=total_rounds,
            rounds=DynArray(),
            leader_validator=addr,
            category_votes=DynArray(),
            created_at=gl.message.timestamp,
            spectators=DynArray()
        )
        room.players.append(addr)
        self.rooms[room_id] = room

    @gl.public.view
    def get_room(self, room_id: str) -> dict:
        if room_id not in self.rooms:
            return {}
        r = self.rooms[room_id]
        return {"id": r.room_id, "host": r.host, "player_count": len(r.players)}
