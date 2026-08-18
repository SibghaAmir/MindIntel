import uuid
from typing import Optional
from uuid import UUID
from app.models.game_state import games_db
from app.schemas.game import GameState, CreateGameRequest, AnswerRequest, ConfirmGuessRequest
from app.ai.question_chain import generate_next_question
from app.ai.guess_chain import generate_guess
from app.ai.candidate_service import generate_candidates

def create_game(request: CreateGameRequest) -> GameState:
    game_id = uuid.uuid4()
    max_questions = 20 if request.mode == "20-questions" else 10
    
    initial_state = GameState(
        game_id=game_id,
        category=request.category,
        mode=request.mode,
        max_questions=max_questions,
        status="playing",
        current_question=None
    )
    
    # Generate the very first question
    question_response = generate_next_question(initial_state)
    initial_state.current_question = question_response.question
    initial_state.confidence = question_response.confidence
    
    games_db[game_id] = initial_state
    return initial_state

def get_game(game_id: UUID) -> Optional[GameState]:
    return games_db.get(game_id)

def process_answer(game_id: UUID, request: AnswerRequest) -> Optional[GameState]:
    game = games_db.get(game_id)
    if not game:
        return None
        
    if game.status != "playing":
        return game
        
    game.answers.append(request.answer)
    game.questions.append(game.current_question)
    game.question_number += 1
    
    # Check if we should guess
    if game.question_number >= game.max_questions or game.confidence > 90:
        # Time to guess
        guess_response = generate_guess(game)
        game.status = "guessing"
        game.guess = guess_response.guess
        game.confidence = guess_response.confidence
        game.current_question = None
        # Could potentially store reason if we had a field for it, but for now we just guess
    else:
        # Generate next question
        question_response = generate_next_question(game)
        game.current_question = question_response.question
        game.confidence = question_response.confidence
        game.status = "playing"
        
        # Generate candidates async in real world, but sync here
        candidates = generate_candidates(game)
        game.candidates = candidates
        
    games_db[game_id] = game
    return game

def process_guess_confirmation(game_id: UUID, request: ConfirmGuessRequest) -> Optional[GameState]:
    game = games_db.get(game_id)
    if not game:
        return None
        
    if game.status != "guessing":
        return game
        
    if request.correct:
        game.status = "won" # AI won
    else:
        game.status = "lost" # AI lost
        
    games_db[game_id] = game
    return game
