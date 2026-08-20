from langchain_core.prompts import ChatPromptTemplate
from app.ai.llm import get_llm
from app.ai.prompts import QUESTION_PROMPT
from app.ai.schemas import QuestionResponse
from app.models.game_state import GameState

def format_history(game: GameState) -> str:
    if not game.questions:
        return "No questions asked yet."
    
    history_lines = []
    for q, a in zip(game.questions, game.answers):
        history_lines.append(f"Q: {q}\nA: {a}")
    return "\n".join(history_lines)

def generate_next_question(game: GameState) -> QuestionResponse:
    llm = get_llm()
    structured_llm = llm.with_structured_output(QuestionResponse)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", QUESTION_PROMPT),
        ("human", "Generate the next question.")
    ])
    
    chain = prompt | structured_llm
    
    history_text = format_history(game)
    candidates_text = ", ".join(game.candidates) if game.candidates else "No specific candidates identified yet."
    
    response = chain.invoke({
        "category": game.category,
        "history": history_text,
        "candidates": candidates_text
    })
    
    return response
