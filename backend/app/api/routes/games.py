from fastapi import APIRouter, HTTPException
from uuid import UUID
from app.schemas.game import GameState, CreateGameRequest, AnswerRequest, ConfirmGuessRequest, HintResponse, DesperationRequest
from app.services import game_service

router = APIRouter()

@router.post("", response_model=GameState)
def create_game_endpoint(request: CreateGameRequest):
    return game_service.create_game(request)

@router.post("/daily", response_model=GameState)
def create_daily_game_endpoint():
    return game_service.create_daily_game()

@router.get("/{game_id}", response_model=GameState)
def get_game_endpoint(game_id: UUID):
    game = game_service.get_game(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game

@router.post("/{game_id}/answers", response_model=GameState)
def submit_answer_endpoint(game_id: UUID, request: AnswerRequest):
    game = game_service.process_answer(game_id, request)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game

@router.post("/{game_id}/fact_check", response_model=GameState)
def fact_check_endpoint(game_id: UUID):
    return game_service.fact_check(game_id)

@router.post("/{game_id}/bribe", response_model=GameState)
def apply_bribe_endpoint(game_id: UUID):
    from app.services.economy_service import apply_bribe
    game = apply_bribe(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game

@router.post("/{game_id}/guess/confirm", response_model=GameState)
def confirm_guess_endpoint(game_id: UUID, request: ConfirmGuessRequest):
    game = game_service.process_guess_confirmation(game_id, request)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game

@router.post("/{game_id}/force-guess", response_model=GameState)
def force_guess_endpoint(game_id: UUID):
    game = game_service.process_force_guess(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game

@router.post("/{game_id}/desperation", response_model=GameState)
def desperation_endpoint(game_id: UUID, request: DesperationRequest):
    game = game_service.process_desperation_clue(game_id, request)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game

@router.get("/{game_id}/hint", response_model=HintResponse)
def get_hint_endpoint(game_id: UUID):
    hint = game_service.get_game_hint(game_id)
    if not hint:
        raise HTTPException(status_code=404, detail="Game not found")
    return HintResponse(hint=hint)

@router.get("/{game_id}/transcript")
def get_transcript_endpoint(game_id: UUID):
    transcript = game_service.get_transcript(game_id)
    if not transcript:
        raise HTTPException(status_code=404, detail="Game not found")
    return {"transcript": transcript}

from pydantic import BaseModel
class LearnRequest(BaseModel):
    subject: str
    category: str

@router.post("/learn/subject")
def learn_subject_endpoint(request: LearnRequest):
    from app.ai.kb.data import SAMPLE_ENTITIES
    
    # Check if already exists
    if any(e["name"].lower() == request.subject.lower() for e in SAMPLE_ENTITIES):
        return {"status": "skipped", "message": "Already known"}
        
    SAMPLE_ENTITIES.append({
        "name": request.subject,
        "category": request.category if request.category else "anything",
        "description": "User-submitted entity from simulated global learning.",
        "attributes": {}
    })
    return {"status": "success", "message": f"Learned {request.subject}"}
