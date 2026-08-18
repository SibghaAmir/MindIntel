import os
from dotenv import load_dotenv

# Load env variables to get LLM keys
load_dotenv(".env.example")  # In a real scenario we load .env, but using .env.example since there might be no .env
# Let's see if there is a real .env
if os.path.exists(".env"):
    load_dotenv(".env")

from app.schemas.game import GameState
from app.ai.question_chain import generate_next_question
from app.ai.guess_chain import generate_guess
from app.ai.candidate_service import generate_candidates
import uuid

def test_engine():
    print("Testing LangChain AI Engine independently...")
    
    # We need an API key to test. If not available, we can't fully run the test.
    if not os.environ.get("LLM_API_KEY"):
        print("Skipping real LLM test: no LLM_API_KEY found.")
        return
        
    game = GameState(
        game_id=uuid.uuid4(),
        category="movies",
        mode="20-questions",
        max_questions=20,
        status="playing",
        questions=["Is it an action movie?", "Was it released after 2010?"],
        answers=["Yes", "Yes"]
    )
    
    print("\n--- Generating Next Question ---")
    try:
        q_resp = generate_next_question(game)
        print(f"Action: {q_resp.action}")
        print(f"Question: {q_resp.question}")
        print(f"Confidence: {q_resp.confidence}")
    except Exception as e:
        print(f"Error: {e}")

    print("\n--- Generating Candidates ---")
    try:
        c_resp = generate_candidates(game)
        print(f"Candidates: {c_resp}")
    except Exception as e:
        print(f"Error: {e}")

    print("\n--- Generating Final Guess ---")
    try:
        g_resp = generate_guess(game)
        print(f"Action: {g_resp.action}")
        print(f"Guess: {g_resp.guess}")
        print(f"Confidence: {g_resp.confidence}")
        print(f"Reason: {g_resp.reason}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_engine()
