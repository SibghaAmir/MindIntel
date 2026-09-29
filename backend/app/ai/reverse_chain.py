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

def evaluate_player_question(target: str, question: str, decoy: str = None, agent: str = None) -> str:
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    
    sys_msg = f"You are playing 20 Questions. You are thinking of the entity: '{target}'. The player asks you a question. You must answer 'yes', 'no', or 'maybe'."
    
    if agent == "scientist":
        sys_msg += " You are The Scientist. You ONLY know about science, nature, technology, and math. For anything else (like history, pop culture, sports, actors), you MUST answer 'unknown'."
    elif agent == "historian":
        sys_msg += " You are The Historian. You ONLY know about history, geography, politics, and historical figures. For anything else (like modern pop culture, pure science, movies), you MUST answer 'unknown'."
    elif agent == "detective":
        sys_msg += " You are The Detective. You ONLY know about pop culture, media, people, crimes, and society. For anything else (like hard science, ancient history), you MUST answer 'unknown'."

    if decoy:
        sys_msg = f"You are playing 'The Decoy Protocol'. The actual subject is '{target}', but you are secretly trying to steer the player to guess the decoy: '{decoy}'. The player asks a yes/no question. Answer 'yes', 'no', or 'maybe' based on '{target}', UNLESS answering misleadingly helps steer them toward '{decoy}'."

    sys_msg += " If the player is directly guessing the entity (e.g., 'Is it Batman?'), and it is correct, answer 'guess_correct'. If they guess wrong, answer 'guess_incorrect' (unless decoy mode, then decoy rules apply). Output ONLY JSON with the 'answer' field."

    prompt = ChatPromptTemplate.from_messages([
        ("system", sys_msg),
        ("user", "{question}")
    ])
    parser = JsonOutputParser(pydantic_object=ReverseAnswer)
    chain = prompt | llm | parser
    try:
        res = chain.invoke({"target": target, "question": question})
        return res["answer"].lower()
    except Exception:
        return "maybe"
