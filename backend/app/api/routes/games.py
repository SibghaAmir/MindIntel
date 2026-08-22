from fastapi import APIRouter, HTTPException
from uuid import UUID
from app.schemas.game import GameState, CreateGameRequest, AnswerRequest, ConfirmGuessRequest
from app.services import game_service

router = APIRouter()

@router.post("", response_model=GameState)
def create_game_endpoint(request: CreateGameRequest):
    return game_service.create_game(request)

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
