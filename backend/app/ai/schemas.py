from pydantic import BaseModel, Field
from typing import List

class QuestionResponse(BaseModel):
    action: str = Field(description="Must be 'question'")
    question: str = Field(description="The question to ask the user")
    confidence: int = Field(description="Confidence percentage (0-100) that you know the target")

class GuessResponse(BaseModel):
    action: str = Field(description="Must be 'guess'")
    guess: str = Field(description="The final guess of the target")
    confidence: int = Field(description="Confidence percentage (0-100) of this guess")
    reason: str = Field(description="A short user-facing explanation for this guess. E.g., 'Your answers suggest this is a living person primarily known for acting.'")

class CandidatesResponse(BaseModel):
    candidates: List[str] = Field(description="List of 3 to 5 candidate names based on current answers")

class ExtractedAttributes(BaseModel):
    attributes: dict[str, str | bool | int | float] = Field(description="A dictionary of confirmed attributes based on the Q&A history (e.g., {'is_real': True, 'gender': 'male'}). Only include definitively confirmed facts.")
