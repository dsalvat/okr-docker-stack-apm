import uuid
import json
from app.services.scoring import score_objective, score_kr
from app.services.ai_service import llm_feedback
from app.db.session import SessionLocal
from app.db.models import OkrSubmission, KeyResult

async def evaluate_objective(objective: str):
    # 🔥 PROMPT MEJORADO - MÁS DETALLADO Y VALIOSO
    json_prompt = f"""
Eres un consultor experto en OKRs con 15 años de experiencia. Evalúa este objetivo empresarial: "{objective}"

Analiza el objetivo usando el framework SMART y proporciona una evaluación detallada y accionable.

Responde ÚNICAMENTE en formato JSON válido con esta estructura EXACTA:
{{
    "score": [número del 1-10 basado en promedio de criterios],
    "feedback": "Evaluación general detallada en 4-6 líneas que explique las fortalezas principales, las debilidades críticas y el potencial impacto del objetivo",
    "criteria": {{
        "specific": {{
            "score": [1-10],
            "comment": "Análisis detallado de 30-40 palabras sobre claridad, concreción y especificidad del objetivo"
        }},
        "measurable": {{
            "score": [1-10], 
            "comment": "Análisis detallado de 30-40 palabras sobre métricas, cuantificación y capacidad de medición"
        }},
        "achievable": {{
            "score": [1-10],
            "comment": "Análisis detallado de 30-40 palabras sobre realismo, recursos necesarios y factibilidad"
        }},
        "relevant": {{
            "score": [1-10],
            "comment": "Análisis detallado de 30-40 palabras sobre alineación estratégica e impacto empresarial"
        }},
        "timebound": {{
            "score": [1-10],
            "comment": "Análisis detallado de 30-40 palabras sobre marco temporal, urgencia y deadlines"
        }}
    }},
    "suggestions": [
        "Sugerencia específica y accionable 1 (15-25 palabras con pasos concretos)",
        "Sugerencia específica y accionable 2 (15-25 palabras con pasos concretos)",
        "Sugerencia específica y accionable 3 (15-25 palabras con pasos concretos)",
        "Sugerencia específica y accionable 4 (15-25 palabras con pasos concretos)"
    ]
}}

REQUISITOS CRÍTICOS:
- Sé específico y detallado en cada análisis
- Proporciona insights accionables que ayuden a mejorar el objetivo
- Usa un tono profesional pero accesible
- Cada criterio debe tener comentarios de 30-40 palabras mínimo
- Las sugerencias deben ser implementables inmediatamente
- Responde SOLO el JSON, sin texto adicional antes o después
"""

    # Mantener scoring heurístico existente para base de datos
    heur = score_objective(objective)
    
    # 🔥 NUEVA EVALUACIÓN JSON ESTRUCTURADA
    try:
        # Obtener evaluación JSON estructurada de la IA
        json_response = await llm_feedback(json_prompt)
        
        # Intentar parsear como JSON
        try:
            ai_evaluation = json.loads(json_response)
        except json.JSONDecodeError:
            # Si no es JSON válido, crear estructura por defecto
            ai_evaluation = {
                "score": heur["total"],
                "feedback": f"Evaluación técnica: Score {heur['total']}/10 basado en claridad, enfoque y redacción.",
                "criteria": {
                    "specific": {"score": heur.get("clarity", 5), "comment": "Análisis de especificidad basado en heurística"},
                    "measurable": {"score": heur.get("focus", 5), "comment": "Análisis de medibilidad basado en heurística"},
                    "achievable": {"score": max(1, min(10, heur["total"] - 1)), "comment": "Análisis de factibilidad estimado"},
                    "relevant": {"score": heur.get("focus", 5), "comment": "Análisis de relevancia basado en enfoque"},
                    "timebound": {"score": heur.get("writing", 5), "comment": "Análisis temporal basado en redacción"}
                },
                "suggestions": [
                    "Mejorar la claridad del objetivo",
                    "Añadir métricas específicas",
                    "Definir timeline más concreto"
                ]
            }
        
        # También obtener feedback tradicional para DB (mantener compatibilidad)
        fb = await llm_feedback(f"Avalua OBJECTIU d'OKR i proposa millores. Text: '{objective}'. Notes: {', '.join(heur['notes']) or 'Sense notes'}")
        
    except Exception as e:
        # En caso de error con IA, usar valores por defecto
        ai_evaluation = {
            "score": heur["total"],
            "feedback": f"Error en evaluación IA. Score heurístico: {heur['total']}/10",
            "criteria": {
                "specific": {"score": heur.get("clarity", 5), "comment": "Error en análisis específico"},
                "measurable": {"score": heur.get("focus", 5), "comment": "Error en análisis de medibilidad"},
                "achievable": {"score": 5, "comment": "Error en análisis de factibilidad"},
                "relevant": {"score": heur.get("focus", 5), "comment": "Error en análisis de relevancia"},
                "timebound": {"score": heur.get("writing", 5), "comment": "Error en análisis temporal"}
            },
            "suggestions": ["Error obteniendo sugerencias", "Intenta reformular el objetivo"]
        }
        fb = f"Error evaluando objetivo: {str(e)}"
    
    # Generar ID y guardar en DB (mantener funcionalidad existente)
    okr_id = str(uuid.uuid4())
    with SessionLocal() as db:
        db.add(OkrSubmission(
            id=okr_id, 
            objective=objective,
            clarity=heur['clarity'], 
            focus=heur['focus'], 
            writing=heur['writing'],
            score=heur['total'], 
            feedback=fb
        ))
        db.commit()
    
    # 🔥 DEVOLVER RESPUESTA PARA FRONTEND + DATOS LEGACY
    return {
        # Datos para el frontend React (nueva UI)
        "score": ai_evaluation["score"],
        "feedback": ai_evaluation["feedback"],
        "criteria": ai_evaluation["criteria"],
        "suggestions": ai_evaluation["suggestions"],
        
        # Datos legacy para compatibilidad (si otros servicios los usan)
        "okr_id": okr_id,
        "breakdown": {
            "clarity": heur["clarity"], 
            "focus": heur["focus"], 
            "writing": heur["writing"]
        },
        "can_add_krs": heur["total"] >= 7.5
    }

async def evaluate_kr(okr_id: str, kr_definition: str, target_value: str, target_date: str):
    # Mantener funcionalidad existente de KR sin cambios
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