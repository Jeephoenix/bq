# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json
import hashlib

# ─────────────────────────────────────────────
#  GenJury — Intelligent Contract
# ─────────────────────────────────────────────

@allow_storage
@dataclass
class Player:
    address: str
    xp: u256
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
    votes: DynArray[Vote]
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

CATEGORIES = ["crypto", "sports", "tech", "politics", "entertainment", "science"]

CLAIM_SOURCES = {
    "crypto": "https://cryptonews.com/news/",
    "sports":  "https://www.espn.com/",
    "tech":    "https://techcrunch.com/",
    "politics": "https://apnews.com/",
    "entertainment": "https://variety.com/",
    "science": "https://www.sciencenews.org/"
}

class GenJury(gl.Contract):
    # Simple types declared first for schema stability
    season_number: u256
    season_end: u256
    rooms: TreeMap[str, Room]
    players: TreeMap[str, Player]
    global_leaderboard: DynArray[str]

    def __init__(self):
        self.season_number = u256(1)
        self.season_end = u256(0)
        self.rooms = TreeMap()
        self.players = TreeMap()
        self.global_leaderboard = DynArray()

    @gl.public.write
    def register_player(self) -> None:
        addr = gl.message.sender_address
        if addr not in self.players:
            self.players[addr] = Player(
                address=addr,
                xp=u256(100),
                streak=u256(0),
                games_played=u256(0),
                correct_votes=u256(0),
                successful_bluffs=u256(0),
                successful_appeals=u256(0),
                badge="Rookie"
            )
            self.global_leaderboard.append(addr)

    @gl.public.write
    def create_room(self, room_id: str, room_type: str, total_rounds: u256) -> None:
        addr = gl.message.sender_address
        if addr not in self.players:
            raise gl.vm.UserError("Register first")
        if room_id in self.rooms:
            raise gl.vm.UserError("Room ID already exists")

        room = Room(
            room_id=room_id,
            host=addr,
            players=DynArray(),
            status="waiting",
            room_type=room_type,
            current_round=u256(0),
            total_rounds=total_rounds,
            rounds=DynArray(),
            leader_validator=addr,
            category_votes=DynArray(),
            created_at=gl.message.timestamp,
            spectators=DynArray()
        )
        room.players.append(addr)
        self.rooms[room_id] = room

    @gl.public.write
    def join_room(self, room_id: str) -> None:
        addr = gl.message.sender_address
        if room_id not in self.rooms:
            raise gl.vm.UserError("Room not found")
        room = self.rooms[room_id]
        if room.status != "waiting":
            raise gl.vm.UserError("Game already started")
        if len(room.players) >= 8:
            raise gl.vm.UserError("Room is full")
        
        is_member = False
        for p in room.players:
            if p == addr:
                is_member = True
        if not is_member:
            room.players.append(addr)

    @gl.public.view
    def get_room(self, room_id: str) -> dict:
        if room_id not in self.rooms:
            return {}
        room = self.rooms[room_id]
        return {
            "room_id": room.room_id,
            "host": room.host,
            "status": room.status,
            "current_round": room.current_round,
