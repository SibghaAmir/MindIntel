from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from app.schemas.game import GameState

def generate_hint(state: GameState) -> str:
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)
    
    history_str = "\n".join([f"Q: {q} | A: {a}" for q, a in zip(state.questions, state.answers)]) if state.questions else "No previous questions."
    
    if state.personality == 'bad_cop':
        persona = "You are a 'Bad Cop'. You are aggressive, hostile, and insulting. Insult the player's intelligence for needing a hint."
    elif state.personality == 'noir':
        persona = "You are a 1940s hardboiled Noir Detective. Use gritty detective slang (e.g., 'Listen here, kid', 'dames', 'copper')."
    else:
        persona = "You are a clinical, analytical AI. Be polite but strictly objective."

    prompt = ChatPromptTemplate.from_messages([
        ("system", f"You are an AI playing 20 Questions. {persona} You must briefly explain your logic for the current question."),
        ("user", "Category: {category}\nHistory:\n{history}\n\nCurrent Question: {current_question}\n\nExplain in 1 to 2 sentences why you asked this current question. What specific candidates or traits are you trying to narrow down? Stay in character.")
    ])
    
    chain = prompt | llm | StrOutputParser()
    
    try:
        return chain.invoke({
            "category": state.category,
            "history": history_str,
            "current_question": state.current_question or "I haven't asked anything yet."
        })
    except Exception as e:
        return "I'm analyzing multiple possibilities right now."
