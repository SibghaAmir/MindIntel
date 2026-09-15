from typing import TypedDict, List, Optional
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

from app.schemas.game import GameState
from app.ai.reverse_chain import pick_target_entity, evaluate_player_question

class GraphState(TypedDict):
    game_id: str
    category: str
    mode: str
    difficulty: str
    personality: str
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
    target_entity: Optional[str]
    has_lied: Optional[bool]
    lie_index: Optional[int]
    
    pending_answer: Optional[str]
    pending_confirmation: Optional[bool]
    force_guess: Optional[bool]

def init_reverse_state(state: GraphState) -> dict:
    if not state.get("target_entity"):
        target = pick_target_entity(state["category"])
        return {"target_entity": target, "status": "playing"}
    return {}

def evaluate_question(state: GraphState) -> dict:
    question = state.get("pending_answer")
    if not question:
        return {}
    
    target = state.get("target_entity")
    ans = evaluate_player_question(target, question)
    
    # Deception mechanic
    mode = state.get("mode", "reverse")
    has_lied = state.get("has_lied", False)
    lie_index = state.get("lie_index", -1)
    
    if mode == "deception" and not has_lied and ans in ["yes", "no"]:
        import random
        question_number = state.get("question_number", 0)
        max_questions = state.get("max_questions", 20)
        # Lie if random 15% chance, or if only 3 questions left and haven't lied yet
        if random.random() < 0.15 or question_number >= max_questions - 3:
            ans = "no" if ans == "yes" else "yes"
            has_lied = True
            lie_index = len(state.get("answers", []))
    
    # ans is 'yes', 'no', 'maybe', 'guess_correct', 'guess_incorrect'
    questions = list(state.get("questions", [])) + [question]
    answers = list(state.get("answers", [])) + [ans]
    
    status = "playing"
    if ans == "guess_correct":
        status = "won"
    elif state["question_number"] + 1 >= state["max_questions"]:
        status = "lost"
        
    return {
        "questions": questions,
        "answers": answers,
        "question_number": state.get("question_number", 0) + 1,
        "pending_answer": None,
        "status": status,
        "guess": target if status != "playing" else None,
        "has_lied": has_lied,
        "lie_index": lie_index
    }

def finish_game(state: GraphState) -> dict:
    return {}

workflow = StateGraph(GraphState)

workflow.add_node("init_reverse_state", init_reverse_state)
workflow.add_node("evaluate_question", evaluate_question)
workflow.add_node("finish_game", finish_game)

workflow.set_entry_point("init_reverse_state")

workflow.add_edge("init_reverse_state", "evaluate_question")
# In reverse mode, the AI waits for the user's question before evaluating
# Evaluate question goes to finish if done, else waits for another question by returning to wait state
workflow.add_edge("evaluate_question", "init_reverse_state")

memory = MemorySaver()
reverse_graph = workflow.compile(
    checkpointer=memory, 
    interrupt_before=["evaluate_question"]
)
