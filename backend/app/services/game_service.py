import uuid
from typing import Optional
from uuid import UUID
from app.models.game_state import games_db
from app.schemas.game import GameState, CreateGameRequest, AnswerRequest, ConfirmGuessRequest
from app.game.mock_data import MOCK_QUESTIONS, MOCK_CANDIDATES, MOCK_FINAL_GUESS

def create_game(request: CreateGameRequest) -> GameState:
    game_id = uuid.uuid4()
    max_questions = 20 if request.mode == "20-questions" else 10
    
    initial_state = GameState(
        game_id=game_id,
        category=request.category,
        mode=request.mode,
        max_questions=max_questions,
        status="playing",
        current_question=MOCK_QUESTIONS[0]
    )
    
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
    
    # Mock some narrowing down
    game.confidence += 5
    if game.confidence > 100:
        game.confidence = 100
        
    # Just show a random subset of candidates for mock
    candidates_count = max(1, 10 - game.question_number)
    game.candidates = MOCK_CANDIDATES[:candidates_count]
    
    if game.question_number >= game.max_questions or game.confidence > 90:
        game.status = "guessing"
        game.guess = MOCK_FINAL_GUESS
        game.current_question = None
    else:
        # Get next mock question
        next_index = game.question_number % len(MOCK_QUESTIONS)
        game.current_question = MOCK_QUESTIONS[next_index]
        game.status = "playing" # actually it should probably transition from thinking back to playing on frontend, but backend state can just be playing
        
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
