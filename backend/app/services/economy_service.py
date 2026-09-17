from uuid import UUID
from typing import Optional
from app.models.game_state import games_db
from app.schemas.game import GameState

def apply_bribe(game_id: UUID) -> Optional[GameState]:
    game = games_db.get(game_id)
    if not game:
        return None
    game.max_questions += 3
    games_db[game_id] = game
    return game
