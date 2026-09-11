from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from app.schemas.game import GameState

def generate_hint(state: GameState) -> str:
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)
    
    history_str = "\n".join([f"Q: {q} | A: {a}" for q, a in zip(state.questions, state.answers)]) if state.questions else "No previous questions."
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an AI playing 20 Questions. You must briefly explain your logic for the current question."),
        ("user", "Category: {category}\nHistory:\n{history}\n\nCurrent Question: {current_question}\n\nExplain in 1 to 2 sentences why you asked this current question. What specific candidates or traits are you trying to narrow down? Be conversational and address the player directly (e.g., 'I asked this because I want to figure out if...').")
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
