from typing import TypedDict, List, Optional
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

from app.schemas.game import GameState
from app.ai.question_chain import generate_next_question
from app.ai.guess_chain import generate_guess as generate_guess_chain
from app.ai.candidate_service import generate_candidates

class GraphState(TypedDict):
    game_id: str
    category: str
    mode: str
    difficulty: str
    question_number: int
    max_questions: int
    questions: List[str]
    answers: List[str]
    status: str
    confidence: int
    candidates: List[str]
    current_question: Optional[str]
    guess: Optional[str]
    reason: Optional[str]
    
    pending_answer: Optional[str]
    pending_confirmation: Optional[bool]
    force_guess: Optional[bool]

def analyze_state(state: GraphState) -> dict:
    # Passthrough for initialization/logging
    return {}

def retrieve_candidates(state: GraphState) -> dict:
    # Only retrieve if we have history, otherwise empty
    if not state.get("questions"):
        return {"candidates": []}
        
    game_kwargs = {k: v for k, v in state.items() if k not in ['pending_answer', 'pending_confirmation']}
    game_state = GameState(**game_kwargs)
    candidates = generate_candidates(game_state)
    return {"candidates": candidates}

def decide_action(state: GraphState) -> str:
    # The deterministic backend controls game flow logic here
    difficulty = state.get("difficulty", "normal")
    if difficulty == "easy":
        threshold = 80
    elif difficulty == "expert":
        threshold = 95
    else:
        threshold = 90

    if state.get("force_guess") or state["question_number"] >= state["max_questions"] or state["confidence"] > threshold:
        return "generate_guess"
    return "generate_question"

def generate_question(state: GraphState) -> dict:
    game_kwargs = {k: v for k, v in state.items() if k not in ['pending_answer', 'pending_confirmation']}
    game_state = GameState(**game_kwargs)
    resp = generate_next_question(game_state)
    return {
        "current_question": resp.question,
        "confidence": resp.confidence,
        "status": "playing"
    }

def generate_guess(state: GraphState) -> dict:
    game_kwargs = {k: v for k, v in state.items() if k not in ['pending_answer', 'pending_confirmation']}
    game_state = GameState(**game_kwargs)
    resp = generate_guess_chain(game_state)
    return {
        "guess": resp.guess,
        "confidence": resp.confidence,
        "reason": resp.reason,
        "current_question": None,
        "status": "guessing"
    }

def process_answer(state: GraphState) -> dict:
    if state.get("force_guess"):
        return {"force_guess": False}

    ans = state.get("pending_answer")
    if not ans:
        return {}
    
    questions = list(state.get("questions", [])) + [state.get("current_question")]
    answers = list(state.get("answers", [])) + [ans]
    return {
        "questions": questions,
        "answers": answers,
        "question_number": state.get("question_number", 0) + 1,
        "pending_answer": None
    }

def process_confirmation(state: GraphState) -> dict:
    correct = state.get("pending_confirmation")
    if correct is None:
        return {}
        
    status = "won" if correct else "lost"
    return {
        "status": status,
        "pending_confirmation": None
    }

def finish_game(state: GraphState) -> dict:
    return {}

workflow = StateGraph(GraphState)

workflow.add_node("analyze_state", analyze_state)
workflow.add_node("retrieve_candidates", retrieve_candidates)
workflow.add_node("generate_question", generate_question)
workflow.add_node("generate_guess", generate_guess)
workflow.add_node("process_answer", process_answer)
workflow.add_node("process_confirmation", process_confirmation)
workflow.add_node("finish_game", finish_game)

workflow.set_entry_point("analyze_state")

workflow.add_edge("analyze_state", "retrieve_candidates")
workflow.add_conditional_edges(
    "retrieve_candidates",
    decide_action,
    {
        "generate_question": "generate_question",
        "generate_guess": "generate_guess"
    }
)

# Graph interrupts before processing answers/confirmations (WAIT)
workflow.add_edge("generate_question", "process_answer")
workflow.add_edge("process_answer", "analyze_state")

workflow.add_edge("generate_guess", "process_confirmation")
workflow.add_edge("process_confirmation", "finish_game")
workflow.add_edge("finish_game", END)

memory = MemorySaver()
app_graph = workflow.compile(
    checkpointer=memory, 
    interrupt_before=["process_answer", "process_confirmation"]
)
