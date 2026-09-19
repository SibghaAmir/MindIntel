from langchain_core.prompts import ChatPromptTemplate
from app.ai.llm import get_llm
from app.ai.prompts import GUESS_PROMPT
from app.ai.schemas import GuessResponse
from app.models.game_state import GameState
from app.ai.question_chain import format_history, get_personality_prompt

def generate_guess(game: GameState) -> GuessResponse:
    llm = get_llm()
    structured_llm = llm.with_structured_output(GuessResponse)
    
    clue = getattr(game, 'desperation_clue', None)
    human_msg = "Make your final guess."
    if clue:
        human_msg = f"Make your final guess. The player gave you one final desperation clue: '{clue}'."

    prompt = ChatPromptTemplate.from_messages([
        ("system", GUESS_PROMPT),
        ("human", human_msg)
    ])
    
    chain = prompt | structured_llm
    
    history_text = format_history(game)
    candidates_text = ", ".join(game.candidates) if game.candidates else "No specific candidates identified yet."
    personality_prompt = get_personality_prompt(getattr(game, 'personality', 'analytical'))
    
    response = chain.invoke({
        "category": game.category,
        "history": history_text,
        "candidates": candidates_text,
        "personality_prompt": personality_prompt
    })
    
    return response
