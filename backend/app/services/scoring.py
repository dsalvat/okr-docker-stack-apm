import re

def clamp(n: float) -> float:
    return max(1.0, min(10.0, round(n*10)/10))

def score_objective(text: str):
    clean = text.strip()
    notes = []
    if len(clean) < 15: notes.append("Objectiu massa curt.")
    if len(clean) > 500: notes.append("Objectiu massa llarg; sintetitza.")

    clarity = 5.0
    if re.search(r'\b(millorar|elevar|reduir|accelerar|consolidar|expandir)\b', clean, re.I): clarity += 2
    if re.search(r'(per a|per tal de|amb l\'objectiu)', clean, re.I): clarity += 1
    if re.search(r'[.!?]$', clean): clarity += 0.5
    if re.search(r'\bconfigurar|instal·lar|implementar\b', clean, re.I): 
        clarity -= 1; notes.append("Evita tasques; centra’t en impacte/resultat.")
    clarity = clamp(clarity/1.2)

    focus = 6.0
    ands = len(re.findall(r'\b(i|and|&)\b', clean, re.I))
    if ands > 2: 
        focus -= 1.5; notes.append("Massa fronts; acota l’abast.")
    if re.search(r'Q[1-4]|trimestre|12 setmanes|90 dies', clean, re.I): focus += 1
    focus = clamp(focus)

    writing = 6.0
    if re.search(r'\b(millor|millorament|més|menys)\b', clean, re.I): writing += 0.5
    if re.search(r'\b(significativament|substancialment)\b', clean, re.I): 
        writing -= 0.5; notes.append("Evita termes vagues com 'significativament'.")
    if clean and clean[0].isupper(): writing += 0.3
    writing = clamp(writing)

    total = clamp((clarity + focus + writing) / 3.0)
    return {"clarity": clarity, "focus": focus, "writing": writing, "total": total, "notes": notes}

def score_kr(defn: str, target_value: str, target_date_iso: str):
    notes = []
    clean = defn.strip()
    clarity = 6.0
    if len(clean) < 20: 
        clarity -= 1.5; notes.append("KR massa curt.")
    if not re.search(r'augment|reducció|assolir|arribar|increment|reduir|elevar', clean, re.I):
        clarity -= 0.5; notes.append("Usa verbs d'impacte ('augmentar', 'reduir', 'assolir').")
    clarity = clamp(clarity)

    measurability = 5.5
    if re.search(r'\d', clean+target_value): measurability += 2
    if re.search(r'%|pts|€|euros|ms|min|h|casos|tickets|NPS|CSAT|TTFR|MTTR', clean+target_value, re.I): measurability += 1
    if re.search(r'qualitat|millor|opti|eficient', clean, re.I) and not re.search(r'\d|%', clean+target_value):
        measurability -= 1; notes.append("Afegeix mètrica concreta (%, unitats, temps).")
    measurability = clamp(measurability)

    feasibility = 6.0
    try:
        from datetime import datetime
        _ = datetime.fromisoformat(target_date_iso)
    except Exception:
        feasibility -= 1.5; notes.append("Data objectiu no vàlida.")
    feasibility = clamp(feasibility)

    total = clamp((clarity + measurability + feasibility) / 3.0)
    return {"clarity": clarity, "measurability": measurability, "feasibility": feasibility, "total": total, "notes": notes}
