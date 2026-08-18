from langchain_openai import ChatOpenAI
from app.config.settings import settings

def get_llm():
    if not settings.llm_api_key:
        raise ValueError("LLM_API_KEY is not set in environment variables.")
    
    return ChatOpenAI(
        model=settings.llm_model,
        api_key=settings.llm_api_key,
        temperature=0.7
    )
