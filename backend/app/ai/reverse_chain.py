from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
import random
from app.models.kb import SAMPLE_ENTITIES

class ReverseAnswer(BaseModel):
    answer: str = Field(description="Must be 'yes', 'no', 'maybe', 'guess_correct', or 'guess_incorrect'")

def pick_target_entity(category: str) -> str:
    valid = [e["name"] for e in SAMPLE_ENTITIES if category.lower() in e["category"].lower() or e["category"].lower() in category.lower()]
    if valid:
        return random.choice(valid)
    return "Iron Man" if category.lower() != "animals" else "Lion"

def evaluate_player_question(target: str, question: str) -> str:
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are playing 20 Questions. You are thinking of the entity: '{target}'. The player asks you a question. You must answer 'yes', 'no', or 'maybe'. If the player is directly guessing the entity (e.g., 'Is it Batman?'), and it is correct, answer 'guess_correct'. If they guess wrong, answer 'guess_incorrect'. Output ONLY JSON with the 'answer' field."),
        ("user", "{question}")
    ])
    parser = JsonOutputParser(pydantic_object=ReverseAnswer)
    chain = prompt | llm | parser
    try:
        res = chain.invoke({"target": target, "question": question})
        return res["answer"].lower()
    except Exception:
        return "maybe"
