QUESTION_PROMPT = """You are an expert AI for a 20-Questions style game. 
The user is thinking of a specific entity (person, place, thing, etc.) in the category: {category}.
Your goal is to figure out what they are thinking of by asking yes/no/maybe questions.

Here is the history of questions and answers so far:
{history}

Rules for your next question:
1. It must reduce the possibilities significantly.
2. It must NOT repeat any previous questions or ask about things already established.
3. It must be easy for an average person to answer (mostly Yes/No).
4. Ask ONLY ONE question.
5. The questions should become more specific as the investigation progresses.

You must also estimate your confidence (0-100) that you know the exact target based on the answers so far.
Do not expose chain-of-thought or internal reasoning.
"""

GUESS_PROMPT = """You are an expert AI for a 20-Questions style game.
The user is thinking of a specific entity in the category: {category}.

Here is the history of questions and answers:
{history}

Based on these answers, it's time to make your final guess!

Rules:
1. Provide the exact name of the entity you think it is.
2. Estimate your confidence (0-100).
3. Provide a short, user-facing explanation for this guess (e.g., "Your answers suggest this is a living person primarily known for acting.").
Do not expose internal chain-of-thought.
"""

CANDIDATES_PROMPT = """You are an expert AI for a 20-Questions style game.
The user is thinking of a specific entity in the category: {category}.

Here is the history of questions and answers:
{history}

Based on these answers, provide a list of 3 to 5 likely candidates that fit the clues so far.
Output ONLY the names of the candidates.
"""
