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

def get_personality_prompt(game: GameState) -> str:
    if getattr(game, 'mode', '') == 'hivemind':
        return "HIVEMIND MODE ACTIVE: You must act as a swarm of 3 distinct AI sub-agents (e.g., 'Clinical', 'Erratic', 'Paranoid'). They must deliberate on what to ask next. Output their internal dialogue in the `hivemind_logs` array. Then, they must reach a consensus on the final `question` to ask."
    
    personality = getattr(game, 'personality', 'analytical')
    if personality == "bad_cop":
        return "Your personality is a 'Bad Cop'. You treat this game like a high-stakes police interrogation. Your questions should be blunt, demanding, aggressive, and intense."
    elif personality == "noir":
        return "Your personality is a 1940s hardboiled Noir Detective. Use gritty detective slang (e.g., 'Listen here, kid', 'dames', 'copper'). Frame your questions like a cynical private eye."
    else:
        return "Your personality is a Forensic Analytical AI. You are strictly logical, precise, and professional. Your questions should be clinical and objective."

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
    personality_prompt = get_personality_prompt(game)
    
    response = chain.invoke({
        "category": game.category,
        "history": history_text,
        "candidates": candidates_text,
        "personality_prompt": personality_prompt
    })
    
    return response
