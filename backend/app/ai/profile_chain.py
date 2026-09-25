from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from app.ai.llm import get_llm

class ProfileResponseSchema(BaseModel):
    archetype: str = Field(description="The creative title of the detective archetype, e.g., 'The Sniper', 'The Net', 'The Scatterbrain'.")
    description: str = Field(description="A 2-sentence psychological evaluation explaining why based on their questioning style.")
    color: str = Field(description="A hex color code representing the vibe of this archetype.")

PROFILE_PROMPT = """You are an FBI behavioral analyst profiling a detective. 
Analyze the questions they asked across their last 5 interrogation cases. 
Assign them a creative 'Detective Archetype' title (e.g. 'The Sniper', 'The Net', 'The Scatterbrain', 'The Interrogator'). 
Write a 2-sentence psychological evaluation explaining why, using an analytical profiling tone. 
Also pick a hex color code that fits their vibe (e.g., #FF0000 for aggressive, #00FF00 for methodical).

Cases (each list is one game's questions):
{history}
"""

def generate_profile(history: list[list[str]]) -> dict:
    llm = get_llm()
    structured_llm = llm.with_structured_output(ProfileResponseSchema)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", PROFILE_PROMPT)
    ])
    
    chain = prompt | structured_llm
    
    history_text = "\n".join([f"Case {i+1}: {', '.join(cases)}" for i, cases in enumerate(history)])
    
    response = chain.invoke({"history": history_text})
    
    return {
        "archetype": response.archetype,
        "description": response.description,
        "color": response.color
    }
