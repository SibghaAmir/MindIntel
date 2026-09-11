from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field

class ContradictionResult(BaseModel):
    contradiction_found: bool = Field(description="True if there is a clear logical contradiction in the answers")
    reason: str = Field(description="If contradiction_found is true, explain why in 1 sentence. E.g., 'You said it is a machine, but later said it eats food.' If false, return empty string.")

def check_for_contradiction(questions: list[str], answers: list[str]) -> ContradictionResult:
    if len(questions) < 2:
        return ContradictionResult(contradiction_found=False, reason="")
        
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
    
    history_str = "\n".join([f"Q: {q} | A: {a}" for q, a in zip(questions, answers)])
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a logic validator. Review the Q&A history. Look for CLEAR, UNDENIABLE logical contradictions. Ignore minor ambiguities. If a clear contradiction exists (e.g. 'Is it alive? YES' and 'Is it an animal or human? NO'), flag it."),
        ("user", "History:\n{history}\n\nAnalyze for contradictions.")
    ])
    
    parser = JsonOutputParser(pydantic_object=ContradictionResult)
    chain = prompt | llm | parser
    
    try:
        res = chain.invoke({"history": history_str})
        return ContradictionResult(**res)
    except Exception:
        return ContradictionResult(contradiction_found=False, reason="")
