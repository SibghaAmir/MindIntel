import os
import uuid
from dotenv import load_dotenv

# Load env variables to get LLM keys
load_dotenv(".env.example")  # fallback
if os.path.exists(".env"):
    load_dotenv(".env")

from app.ai.graph import app_graph

def test_engine():
    print("Testing LangGraph AI Orchestration with Knowledge Base...")
    
    if not os.environ.get("LLM_API_KEY"):
        print("Skipping real LLM test: no LLM_API_KEY found.")
        return
        
    game_id = str(uuid.uuid4())
    config = {"configurable": {"thread_id": game_id}}
    
    # Pre-populate history to test attribute extraction immediately
    initial_state = {
        "game_id": game_id,
        "category": "person",
        "mode": "20-questions",
        "max_questions": 20,
        "question_number": 2,
        "status": "playing",
        "confidence": 0,
        "questions": ["Is this a real person?", "Is this person alive?", "Is this person male?"],
        "answers": ["Yes", "True", "Yes"],
        "candidates": [],
        "current_question": None,
        "guess": None,
        "reason": None,
        "pending_answer": "Yes", # Resume by processing the 3rd answer
        "pending_confirmation": None
    }
    
    print("\n--- Simulating User Answer to trigger Attribute Extraction ---")
    print("History: Is this a real person? -> Yes | Is this person alive? -> True | Is this person male? -> Yes")
    # Using 'pending_answer' above kicks it into process_answer, then retrieve_candidates
    result = app_graph.invoke(initial_state, config)
    
    print(f"Candidates Retrieved: {result.get('candidates')}")
    print(f"Next Question: {result.get('current_question')}")
    
    print("\n--- Forcing Guess ---")
    app_graph.update_state(config, {"question_number": 20, "pending_answer": "Yes"})
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
