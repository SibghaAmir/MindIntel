from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from app.ai.llm import get_llm
from app.models.game_state import GameState
from app.ai.question_chain import format_history

class TranscriptResponse(BaseModel):
    transcript: str = Field(description="The heavily redacted, FBI-style narrative wiretap transcript.")

TRANSCRIPT_PROMPT = """You are generating a highly classified post-interrogation FBI Wiretap Transcript for Kasoti (MindIntel). 
Review the following interrogation history. 
The subject was '{target}'. 
The AI {result_status}.

Write a 4-5 sentence narrative explaining exactly which answers gave the subject away, or where the investigation went cold. 
Use a cold, analytical, government-agent tone. Interleave the exact word '[REDACTED]' occasionally for flavor and secrecy.
Do NOT use markdown formatting like bolding or italics. Keep it raw text.

History:
{history}
"""

def generate_transcript(game: GameState) -> str:
    llm = get_llm()
    structured_llm = llm.with_structured_output(TranscriptResponse)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", TRANSCRIPT_PROMPT)
    ])
    
    chain = prompt | structured_llm
    history_text = format_history(game)
    target = game.guess or "Unknown Target"
    result_status = "successfully identified the target" if game.status == "won" else "failed to identify the target"
    
    response = chain.invoke({
        "target": target,
        "result_status": result_status,
        "history": history_text
    })
    
    return response.transcript
