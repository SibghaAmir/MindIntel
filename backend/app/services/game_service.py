import uuid
from typing import Optional
from uuid import UUID
from app.models.game_state import games_db
from app.schemas.game import GameState, CreateGameRequest, AnswerRequest, ConfirmGuessRequest
from app.ai.graph import app_graph
from app.ai.reverse_graph import reverse_graph

def extract_game_state(graph_state: dict) -> GameState:
    kwargs = {k: v for k, v in graph_state.items() if k not in ['pending_answer', 'pending_confirmation']}
    # Ensure game_id is UUID
    if isinstance(kwargs.get('game_id'), str):
        kwargs['game_id'] = UUID(kwargs['game_id'])
    return GameState(**kwargs)

def get_graph_for_game(game_id: UUID) -> object:
    game = games_db.get(game_id)
    if game and game.mode in ["reverse", "deception"]:
        return reverse_graph
    return app_graph

def get_graph_for_mode(mode: str) -> object:
    if mode in ["reverse", "deception"]:
        return reverse_graph
    return app_graph

def create_game(request: CreateGameRequest) -> GameState:
    game_id = uuid.uuid4()
    if request.difficulty == "easy":
        max_questions = 30
    elif request.difficulty == "expert":
        max_questions = 10
    else:
        max_questions = 20
    
    initial_state = {
        "game_id": str(game_id),
        "category": request.category,
        "mode": request.mode,
        "difficulty": request.difficulty,
        "personality": request.personality,
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
        "target_entity": None,
        "contradiction": None,
        "is_daily": False,
        "has_lied": False,
        "lie_index": -1,
        "lie_caught": False,
        "fact_checks": 1 if request.mode == "deception" else 0,
        "pending_answer": None,
        "pending_confirmation": None
    }
    
    config = {"configurable": {"thread_id": str(game_id)}}
    graph = get_graph_for_mode(request.mode)
    result = graph.invoke(initial_state, config)
    
    game = extract_game_state(result)
    games_db[game_id] = game
    return game

import hashlib
from datetime import date
from app.ai.kb.data import SAMPLE_ENTITIES

def create_daily_game() -> GameState:
    game_id = uuid.uuid4()
    today_str = date.today().isoformat()
    hash_val = int(hashlib.md5(today_str.encode()).hexdigest(), 16)
    target = SAMPLE_ENTITIES[hash_val % len(SAMPLE_ENTITIES)]
    
    initial_state = {
        "game_id": str(game_id),
        "category": target.get("category", "anything"),
        "mode": "reverse",
        "difficulty": "normal",
        "personality": "clinical",
        "max_questions": 20,
        "question_number": 0,
        "status": "playing",
        "confidence": 0,
        "questions": [],
        "answers": [],
        "candidates": [],
        "current_question": None,
        "guess": None,
        "reason": None,
        "target_entity": target["name"],
        "contradiction": None,
        "is_daily": True,
        "pending_answer": None,
        "pending_confirmation": None
    }
    
    config = {"configurable": {"thread_id": str(game_id)}}
    graph = get_graph_for_mode("reverse")
    result = graph.invoke(initial_state, config)
    
    game = extract_game_state(result)
    games_db[game_id] = game
    return game

def get_game(game_id: UUID) -> Optional[GameState]:
    return games_db.get(game_id)

def process_answer(game_id: UUID, request: AnswerRequest) -> Optional[GameState]:
    if game_id not in games_db:
        return None
        
    config = {"configurable": {"thread_id": str(game_id)}}
    graph = get_graph_for_game(game_id)
    
    graph.update_state(config, {"pending_answer": request.answer})
    result = graph.invoke(None, config)
    
    game = extract_game_state(result)
    games_db[game_id] = game
    return game

def fact_check(game_id: UUID) -> Optional[GameState]:
    game = get_game(game_id)
    if not game: return None
    
    if game.fact_checks <= 0:
        return game
        
    last_idx = len(game.answers) - 1
    if game.lie_index == last_idx and not game.lie_caught:
        game.lie_caught = True
        game.max_questions += 3
        game.contradiction = "You caught me! That was a lie. I've penalized myself with 3 extra questions for you."
    else:
        game.question_number = min(game.max_questions, game.question_number + 3)
        game.contradiction = "That was the truth! You doubted me, so I penalized you with 3 questions."
        
    game.fact_checks -= 1
    games_db[game_id] = game
    return game

def process_guess_confirmation(game_id: UUID, request: ConfirmGuessRequest) -> Optional[GameState]:
    if game_id not in games_db:
        return None
        
    config = {"configurable": {"thread_id": str(game_id)}}
    graph = get_graph_for_game(game_id)
    
    graph.update_state(config, {"pending_confirmation": request.correct})
    result = graph.invoke(None, config)
    
    game = extract_game_state(result)
    games_db[game_id] = game
    return game

def process_force_guess(game_id: UUID) -> Optional[GameState]:
    if game_id not in games_db:
        return None
        
    config = {"configurable": {"thread_id": str(game_id)}}
    graph = get_graph_for_game(game_id)
    
    graph.update_state(config, {"force_guess": True, "pending_answer": None})
    result = graph.invoke(None, config)
    
    game = extract_game_state(result)
    games_db[game_id] = game
    return game

from app.ai.hint_chain import generate_hint

def get_game_hint(game_id: UUID) -> Optional[str]:
    game = games_db.get(game_id)
    if not game:
        return None
    return generate_hint(game)

def process_desperation_clue(game_id: UUID, request: DesperationRequest) -> Optional[GameState]:
    if game_id not in games_db:
        return None
        
    config = {"configurable": {"thread_id": str(game_id)}}
    graph = get_graph_for_game(game_id)
    
    graph.update_state(config, {"pending_desperation_clue": request.clue})
    result = graph.invoke(None, config)
    
    game = extract_game_state(result)
    games_db[game_id] = game
    return game

def get_transcript(game_id: UUID) -> Optional[str]:
    game = games_db.get(game_id)
    if not game:
        return None
    if game.transcript:
        return game.transcript
    
    from app.ai.transcript_chain import generate_transcript
    transcript = generate_transcript(game)
    game.transcript = transcript
    games_db[game_id] = game
    return transcript

def process_retcon(game_id: UUID, index: int) -> Optional[GameState]:
    game = games_db.get(game_id)
    if not game or index < 0 or index >= len(game.questions):
        return None
        
    game.questions.pop(index)
    game.answers.pop(index)
    game.question_number -= 1
    
    from app.ai.candidate_service import generate_candidates
    candidates = generate_candidates(game) if game.questions else []
    game.candidates = candidates
    game.snapshot.candidatesRemaining = len(candidates)
    game.snapshot.topPossibilities = candidates[:20]
    
    games_db[game_id] = game
    
    config = {"configurable": {"thread_id": str(game_id)}}
    graph = get_graph_for_game(game_id)
    graph.update_state(config, {
        "questions": game.questions,
        "answers": game.answers,
        "question_number": game.question_number,
        "candidates": candidates,
        "contradiction": None
    })
    
    return game
