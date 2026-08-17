from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID

class GameState(BaseModel):
    game_id: UUID
    category: str
    mode: str
    question_number: int = 0
    max_questions: int
    questions: List[str] = Field(default_factory=list)
    answers: List[str] = Field(default_factory=list)
    status: str = "idle"  # idle, playing, thinking, guessing, won, lost
    confidence: int = 0
    candidates: List[str] = Field(default_factory=list)
    current_question: Optional[str] = None
    guess: Optional[str] = None

class CreateGameRequest(BaseModel):
    category: str
    mode: str

class AnswerRequest(BaseModel):
    answer: str

class ConfirmGuessRequest(BaseModel):
    correct: bool
