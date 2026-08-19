import os
import uuid
from dotenv import load_dotenv

# Load env variables to get LLM keys
load_dotenv(".env.example")  # fallback
if os.path.exists(".env"):
    load_dotenv(".env")

from app.ai.graph import app_graph

def test_engine():
    print("Testing LangGraph AI Orchestration...")
    
    if not os.environ.get("LLM_API_KEY"):
        print("Skipping real LLM test: no LLM_API_KEY found.")
        return
        
    game_id = str(uuid.uuid4())
    config = {"configurable": {"thread_id": game_id}}
    
    initial_state = {
        "game_id": game_id,
        "category": "movies",
        "mode": "20-questions",
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
        "pending_answer": None,
        "pending_confirmation": None
    }
    
    print("\n--- Starting Game (Generates Question 1) ---")
    result = app_graph.invoke(initial_state, config)
    print(f"Current Question: {result.get('current_question')}")
    print(f"Confidence: {result.get('confidence')}")
    
    print("\n--- Simulating User Answer ---")
    app_graph.update_state(config, {"pending_answer": "Yes"})
    result = app_graph.invoke(None, config)
    
    print(f"Candidates: {result.get('candidates')}")
    print(f"Next Question: {result.get('current_question')}")
    
    print("\n--- Forcing Guess ---")
    # We update question_number to trick the rule engine into guessing
    app_graph.update_state(config, {"question_number": 20, "pending_answer": "No"})
    result = app_graph.invoke(None, config)
    
    print(f"Action triggered Guess?: {result.get('status') == 'guessing'}")
    print(f"Guess: {result.get('guess')}")
    print(f"Reason: {result.get('reason')}")
    
    print("\n--- Simulating Confirmation ---")
    app_graph.update_state(config, {"pending_confirmation": True})
    result = app_graph.invoke(None, config)
    
    print(f"Final Status: {result.get('status')}")

if __name__ == "__main__":
    test_engine()
