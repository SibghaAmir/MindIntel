from langchain_core.prompts import ChatPromptTemplate
from app.ai.llm import get_llm
from app.ai.schemas import ExtractedAttributes
from app.models.game_state import GameState
from app.ai.question_chain import format_history

EXTRACTOR_PROMPT = """You are an expert knowledge extractor for a 20-Questions style game.
The user is thinking of an entity in the category: {category}.

Here is the history of questions and answers so far:
{history}

Your job is to extract all definitively confirmed attributes about the entity based on these answers.
Return them as a key-value dictionary. Use standard, normalized keys (e.g., 'is_real', 'alive', 'gender', 'country', 'profession').
Do NOT guess attributes. Only extract what is clearly established by a 'Yes' or 'No'.
If the history is empty or nothing is confirmed yet, return an empty dictionary.
IMPORTANT: If a question was answered with 'unknown', 'don't know', or 'maybe', DO NOT extract any attribute for it. Ignored these entirely.
"""

def extract_attributes(game: GameState) -> dict:
    if not game.questions:
        return {}

    llm = get_llm()
    structured_llm = llm.with_structured_output(ExtractedAttributes)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", EXTRACTOR_PROMPT),
        ("human", "Extract the attributes.")
    ])
    
    chain = prompt | structured_llm
    
    history_text = format_history(game)
    try:
        response = chain.invoke({
            "category": game.category,
            "history": history_text
        })
        return response.attributes
    except Exception as e:
        print(f"Error extracting attributes: {e}")
        return {}
