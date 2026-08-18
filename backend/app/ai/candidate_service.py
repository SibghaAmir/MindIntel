from langchain_core.prompts import ChatPromptTemplate
from app.ai.llm import get_llm
from app.ai.prompts import CANDIDATES_PROMPT
from app.ai.schemas import CandidatesResponse
from app.models.game_state import GameState
from app.ai.question_chain import format_history
from typing import List

def generate_candidates(game: GameState) -> List[str]:
    # Only generate candidates if there are questions asked
    if not game.questions:
        return []

    llm = get_llm()
    structured_llm = llm.with_structured_output(CandidatesResponse)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", CANDIDATES_PROMPT),
        ("human", "List the candidates.")
    ])
    
    chain = prompt | structured_llm
    
    history_text = format_history(game)
    try:
        response = chain.invoke({
            "category": game.category,
            "history": history_text
        })
        return response.candidates
    except Exception as e:
        print(f"Error generating candidates: {e}")
        return []
