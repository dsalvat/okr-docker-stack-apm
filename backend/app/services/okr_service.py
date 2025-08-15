import uuid
import json
from app.services.scoring import score_objective, score_kr
from app.services.ai_service import llm_feedback
from app.db.session import SessionLocal
from app.db.models import OkrSubmission, KeyResult

async def evaluate_objective(objective: str):
    # 🔥 PROMPT PARA GENERAR EL JSON EXACTO
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

    # Scoring heurístico para base de datos
    heur = score_objective(objective)
    
    # 🔥 LLAMADA ÚNICA Y SIMPLE
    try:
        ai_response = await llm_feedback(json_prompt)
        print(f"🔍 Respuesta IA cruda: {ai_response}")
        
        # 🔥 PARSEAR JSON DIRECTAMENTE
        try:
            ai_data = json.loads(ai_response)
            print(f"✅ JSON parseado exitosamente")
            print(f"✅ Score: {ai_data.get('score')}")
            print(f"✅ Feedback length: {len(ai_data.get('feedback', ''))}")
            print(f"✅ Criteria keys: {list(ai_data.get('criteria', {}).keys())}")
            print(f"✅ Suggestions count: {len(ai_data.get('suggestions', []))}")
            
        except json.JSONDecodeError as e:
            print(f"❌ Error parsing JSON: {e}")
            print(f"❌ Respuesta que falló: {ai_response[:500]}...")
            # Fallback simple
            ai_data = {
                "score": heur["total"],
                "feedback": f"Error en análisis IA. Evaluación heurística: {heur['total']}/10 puntos.",
                "criteria": {
                    "specific": {"score": heur.get("clarity", 5), "comment": "Análisis automático basado en claridad"},
                    "measurable": {"score": heur.get("focus", 5), "comment": "Análisis automático basado en enfoque"},
                    "achievable": {"score": 5, "comment": "Análisis automático - requiere evaluación manual"},
                    "relevant": {"score": heur.get("focus", 5), "comment": "Análisis automático basado en relevancia"},
                    "timebound": {"score": heur.get("writing", 5), "comment": "Análisis automático basado en redacción"}
                },
                "suggestions": [
                    "Revisar la especificidad del objetivo",
                    "Añadir métricas cuantificables",
                    "Evaluar la factibilidad con recursos disponibles",
                    "Establecer timeline más detallado"
                ]
            }
            
    except Exception as e:
        print(f"❌ Error en llamada IA: {e}")
        # Fallback de emergencia
        ai_data = {
            "score": heur["total"],
            "feedback": f"Error en servicio de IA. Puntuación heurística: {heur['total']}/10.",
            "criteria": {
                "specific": {"score": heur.get("clarity", 5), "comment": "Error en análisis específico"},
                "measurable": {"score": heur.get("focus", 5), "comment": "Error en análisis de medición"},
                "achievable": {"score": 5, "comment": "Error en análisis de factibilidad"},
                "relevant": {"score": heur.get("focus", 5), "comment": "Error en análisis de relevancia"},
                "timebound": {"score": heur.get("writing", 5), "comment": "Error en análisis temporal"}
            },
            "suggestions": [
                "Error obteniendo sugerencias - revisar configuración",
                "Contactar soporte técnico para análisis detallado"
            ]
        }
        ai_response = f"Error: {str(e)}"

    # Guardar en base de datos
    okr_id = str(uuid.uuid4())
    fb = ai_data.get("feedback", "Sin feedback")
    
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

    # 🔥 DEVOLVER EXACTAMENTE LO QUE NECESITA EL FRONTEND
    result = {
        # Datos principales del JSON de IA
        "score": ai_data["score"],
        "feedback": ai_data["feedback"],
        "criteria": ai_data["criteria"],
        "suggestions": ai_data["suggestions"],
        
        # Debug info
        "debug_ai_response": ai_response,
        "debug_parsed": ai_data,
        
        # Legacy data
        "okr_id": okr_id,
        "breakdown": {
            "clarity": heur["clarity"],
            "focus": heur["focus"],
            "writing": heur["writing"]
        },
        "can_add_krs": heur["total"] >= 7.5
    }
    
    print(f"🎯 RESULTADO FINAL - score: {result['score']}")
    print(f"🎯 RESULTADO FINAL - feedback: {result['feedback'][:100]}...")
    print(f"🎯 RESULTADO FINAL - criteria keys: {list(result['criteria'].keys())}")
    print(f"🎯 RESULTADO FINAL - suggestions count: {len(result['suggestions'])}")
    
    return result

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