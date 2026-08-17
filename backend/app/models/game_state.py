from typing import Dict
from uuid import UUID
from app.schemas.game import GameState

# In-memory mock database
games_db: Dict[UUID, GameState] = {}
