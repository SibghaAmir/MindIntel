from typing import List
from app.models.game_state import GameState
from app.ai.question_chain import format_history
from app.ai.attribute_extractor import extract_attributes
from app.ai.kb.retriever import LocalCandidateRetriever

# We can instantiate the retriever once
retriever = LocalCandidateRetriever()

def generate_candidates(game: GameState) -> List[str]:
    # Only generate candidates if there are questions asked
    if not game.questions:
        return []

    # 1. Extract known attributes deterministically from history
    attributes = extract_attributes(game)
    
    # 2. Retrieve candidates from knowledge base
    history_text = format_history(game)
    candidates = retriever.retrieve(
        category=game.category,
        extracted_attributes=attributes,
        query=history_text
    )
    
    # Limit to top 5 for UI consistency
    return candidates[:5]
