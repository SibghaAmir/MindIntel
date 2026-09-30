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
    decoy_entity: Optional[str] = None
    syndicate_agents: List[str] = Field(default_factory=list)
    doppelganger_history: List[dict] = Field(default_factory=list)

class CreateGameRequest(BaseModel):
    category: str
    mode: str
    difficulty: str = "normal"
    personality: str = "analytical"
    subject: Optional[str] = None

class AnswerRequest(BaseModel):
    answer: str

class ConfirmGuessRequest(BaseModel):
    correct: bool

class DesperationRequest(BaseModel):
    clue: str

class RetconRequest(BaseModel):
    index: int

class DecoyGuessRequest(BaseModel):
    target: str
    decoy: str

class SyndicateAskRequest(BaseModel):
    question: str
    agent: str

class DoppelgangerTurnRequest(BaseModel):
    player_answer_to_ai: str
    player_question_for_ai: str
    player_is_guessing: bool = False
