import os
from openai import OpenAI
from app.core.config import settings

# Assegura que la clau API estigui disponible com a variable d'entorn
os.environ["OPENAI_API_KEY"] = settings.OPENAI_API_KEY

client = OpenAI()

SYSTEM = ("Ets un avaluador d'OKR inspirat en Doerr i Grove. "
          "Dona feedback concret, accionable i breu (màxim 6 punts, 1200 caràcters). "
          "Evita repeticions i termes vagues.")

async def llm_feedback(prompt: str) -> str:
    res = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        temperature=0.2,
        messages=[
            {"role": "system", "content": SYSTEM},
            {"role": "user", "content": prompt},
        ],
    )
    return (res.choices[0].message.content or "")[:5000]
