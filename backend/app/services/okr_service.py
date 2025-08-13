import uuid
from app.services.scoring import score_objective, score_kr
from app.services.ai_service import llm_feedback
from app.db.session import SessionLocal
from app.db.models import OkrSubmission, KeyResult

async def evaluate_objective(objective: str):
    heur = score_objective(objective)
    fb = await llm_feedback(f"Avalua OBJECTIU d'OKR i proposa millores. Text: '{objective}'. Notes: {', '.join(heur['notes']) or 'Sense notes'}")
    okr_id = str(uuid.uuid4())
    with SessionLocal() as db:
        db.add(OkrSubmission(
            id=okr_id, objective=objective,
            clarity=heur['clarity'], focus=heur['focus'], writing=heur['writing'],
            score=heur['total'], feedback=fb
        ))
        db.commit()
    return {
        "okr_id": okr_id,
        "score": heur["total"],
        "breakdown": {"clarity": heur["clarity"], "focus": heur["focus"], "writing": heur["writing"]},
        "feedback": fb,
        "can_add_krs": heur["total"] >= 7.5
    }

async def evaluate_kr(okr_id: str, kr_definition: str, target_value: str, target_date: str):
    heur = score_kr(kr_definition, target_value, target_date)
    fb = await llm_feedback(f"Avalua RESULTAT CLAU d'OKR. KR: '{kr_definition}'; Valor: {target_value}; Data: {target_date}. Dona 3-6 millores concretes.")
    kr_id = str(uuid.uuid4())
    with SessionLocal() as db:
        db.add(KeyResult(
            id=kr_id, okr_id=okr_id, kr_definition=kr_definition,
            target_value=target_value, target_date=target_date,
            clarity=heur['clarity'], measurability=heur['measurability'], feasibility=heur['feasibility'],
            score=heur['total'], feedback=fb
        ))
        db.commit()
    return {
        "key_result_id": kr_id,
        "score": heur["total"],
        "breakdown": {"clarity": heur["clarity"], "measurability": heur["measurability"], "feasibility": heur["feasibility"]},
        "feedback": fb,
        "allow_next_kr": heur["total"] >= 7.5
    }
