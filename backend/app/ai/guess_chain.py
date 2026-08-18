from langchain_core.prompts import ChatPromptTemplate
from app.ai.llm import get_llm
from app.ai.prompts import GUESS_PROMPT
from app.ai.schemas import GuessResponse
from app.models.game_state import GameState
from app.ai.question_chain import format_history

def generate_guess(game: GameState) -> GuessResponse:
    llm = get_llm()
    structured_llm = llm.with_structured_output(GuessResponse)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", GUESS_PROMPT),
        ("human", "Make your final guess.")
    ])
    
    chain = prompt | structured_llm
    
    history_text = format_history(game)
    response = chain.invoke({
        "category": game.category,
        "history": history_text
    })
    
    return response
