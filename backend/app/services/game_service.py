import uuid
from typing import Optional
from uuid import UUID
from app.models.game_state import games_db
from app.schemas.game import GameState, CreateGameRequest, AnswerRequest, ConfirmGuessRequest
from app.ai.graph import app_graph

def extract_game_state(graph_state: dict) -> GameState:
    kwargs = {k: v for k, v in graph_state.items() if k not in ['pending_answer', 'pending_confirmation']}
    # Ensure game_id is UUID
    if isinstance(kwargs.get('game_id'), str):
        kwargs['game_id'] = UUID(kwargs['game_id'])
    return GameState(**kwargs)

def create_game(request: CreateGameRequest) -> GameState:
    game_id = uuid.uuid4()
    max_questions = 20 if request.mode == "20-questions" else 10
    
    initial_state = {
        "game_id": str(game_id),
        "category": request.category,
        "mode": request.mode,
        "max_questions": max_questions,
        "question_number": 0,
        "status": "playing",
        "confidence": 0,
        "questions": [],
        "answers": [],
        "candidates": [],
        "current_question": None,
        "guess": None,
        "reason": None,
        "pending_answer": None,
        "pending_confirmation": None
    }
    
    config = {"configurable": {"thread_id": str(game_id)}}
    # Run the graph until the first interrupt (which will be before process_answer)
    result = app_graph.invoke(initial_state, config)
    
    game = extract_game_state(result)
    games_db[game_id] = game
    return game

def get_game(game_id: UUID) -> Optional[GameState]:
    return games_db.get(game_id)

def process_answer(game_id: UUID, request: AnswerRequest) -> Optional[GameState]:
    if game_id not in games_db:
        return None
        
    config = {"configurable": {"thread_id": str(game_id)}}
    
    # Update the graph state with the user's answer
    app_graph.update_state(config, {"pending_answer": request.answer})
    
    # Resume the graph
    result = app_graph.invoke(None, config)
    
    game = extract_game_state(result)
    games_db[game_id] = game
    return game

def process_guess_confirmation(game_id: UUID, request: ConfirmGuessRequest) -> Optional[GameState]:
    if game_id not in games_db:
        return None
        
    config = {"configurable": {"thread_id": str(game_id)}}
    
    # Update the graph state with the confirmation
    app_graph.update_state(config, {"pending_confirmation": request.correct})
    
    # Resume the graph
    result = app_graph.invoke(None, config)
    
    game = extract_game_state(result)
    games_db[game_id] = game
    return game
