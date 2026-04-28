import genlayer_sdk as gl

@gl.contract
class GenJury:
    def __init__(self):
        # Stores player XP: {wallet_address: total_xp}
        self.leaderboard = gl.StateDict(int)
        
        # Stores active game data: {game_id: {data}}
        self.active_games = gl.StateDict(dict)

    @gl.public
    def submit_testimony(self, game_id: str, statements: list[str]):
        """
        The Deceiver (Defendant) submits their 2 truths and 1 lie.
        """
        if len(statements) != 3:
            raise Exception("You must provide exactly 3 statements.")
            
        self.active_games[game_id] = {
            "statements": statements,
            "status": "AWAITING_VERDICT",
            "verdict": None,
            "objection_raised": False
        }

    @gl.public
    def get_ai_verdict(self, game_id: str) -> str:
        """
        The Intelligent Contract acts as the Judge.
        It uses multiple AI nodes to reach consensus on the lie.
        """
        game = self.active_games.get(game_id)
        if not game:
            raise Exception("Game session not found.")

        statements_str = " | ".join(game["statements"])
        
        # This prompt is sent to GenLayer's AI Validators
        prompt = (
            f"You are a forensic expert in a game called GenJury. "
            f"The following three statements were provided by a player: {statements_str}. "
            "One of these is a lie. Use your internal knowledge and logic to "
            "identify which index (0, 1, or 2) is the lie. "
            "Return your answer in this format: 'Index: [X]. Reason: [One sentence explanation].'"
        )
        
        # gl.nondet.exec_prompt triggers the Intelligent Contract's AI consensus
        verdict = gl.nondet.exec_prompt(prompt)
        
        # Update the game state with the AI's decision
        game["status"] = "VERDICT_RENDERED"
        game["verdict"] = verdict
        self.active_games[game_id] = game
        
        return verdict

    @gl.public
    def resolve_objection(self, game_id: str, player: str, proof_provided: bool):
        """
        The 'Optimistic Democracy' phase. 
        If a player objects to the AI verdict and proves the truth, rewards are updated.
        """
        game = self.active_games.get(game_id)
        if not game or game["status"] != "VERDICT_RENDERED":
            raise Exception("No verdict to object to.")

        if proof_provided:
            self.leaderboard[player] += 150  # High reward for successful appeal
            game["status"] = "OVERTURNED"
        else:
            self.leaderboard[player] -= 20   # Small penalty for frivolous appeals
            game["status"] = "VERDICT_UPHELD"
            
        self.active_games[game_id] = game

    @gl.public
    def get_leaderboard(self, player_address: str) -> int:
        """
        Utility function to check XP.
        """
        return self.leaderboard[player_address]
