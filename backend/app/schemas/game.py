from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID

class GameState(BaseModel):
    game_id: UUID
    category: str
    mode: str
    difficulty: str = "normal"
    personality: str = "analytical"
    question_number: int = 0
    max_questions: int
    questions: List[str] = Field(default_factory=list)
    answers: List[str] = Field(default_factory=list)
    status: str = "idle"  # idle, playing, thinking, guessing, won, lost
    confidence: int = 0
    candidates: List[str] = Field(default_factory=list)
    current_question: Optional[str] = None
    guess: Optional[str] = None
    reason: Optional[str] = None
    target_entity: Optional[str] = None
    contradiction: Optional[str] = None
    is_daily: bool = False
    has_lied: bool = False
    lie_index: int = -1
    lie_caught: bool = False
    fact_checks: int = 1
    desperation_clue: Optional[str] = None
    pending_desperation_clue: Optional[str] = None
    transcript: Optional[str] = None

class CreateGameRequest(BaseModel):
    category: str
    mode: str
    difficulty: str = "normal"
    personality: str = "analytical"

class AnswerRequest(BaseModel):
    answer: str

class ConfirmGuessRequest(BaseModel):
    correct: bool

class DesperationRequest(BaseModel):
    clue: str
