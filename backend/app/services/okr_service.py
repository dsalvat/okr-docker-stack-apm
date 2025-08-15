import uuid
import json
from datetime import datetime
from app.services.scoring import score_objective, score_kr
from app.services.ai_service import llm_feedback
from app.db.session import SessionLocal
from app.db.models import OkrSubmission, KeyResult
import logging

logger = logging.getLogger(__name__)

async def evaluate_objective(objective: str):
    """
    Evalúa un objetivo usando IA y devuelve estructura compatible con frontend.
    """
    
    # 🔥 PROMPT OPTIMIZADO PARA JSON CONSISTENTE
    json_prompt = f"""
Eres un consultor experto en OKRs con 15 años de experiencia. Evalúa este objetivo empresarial: "{objective}"

Analiza el objetivo usando el framework SMART y proporciona una evaluación detallada y accionable.

Responde ÚNICAMENTE en formato JSON válido con esta estructura EXACTA:
{{
    "overall_score": [número del 1-10 con 1 decimal],
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
    okr_id = str(uuid.uuid4())
    
    # 🔥 LLAMADA A IA CON MANEJO DE ERRORES ROBUSTO
    try:
        ai_response = await llm_feedback(json_prompt)
        logger.info(f"🔍 Respuesta IA recibida para OKR {okr_id}")
        
        # 🔥 PARSEAR JSON CON VALIDACIÓN
        try:
            ai_data = json.loads(ai_response)
            
            # Validar que tenemos los campos esenciales
            required_fields = ['overall_score', 'feedback', 'criteria', 'suggestions']
            missing_fields = [field for field in required_fields if field not in ai_data]
            
            if missing_fields:
                raise ValueError(f"Faltan campos requeridos: {missing_fields}")
            
            # Validar estructura de criteria
            required_criteria = ['specific', 'measurable', 'achievable', 'relevant', 'timebound']
            criteria = ai_data.get('criteria', {})
            for criterion in required_criteria:
                if criterion not in criteria:
                    criteria[criterion] = {"score": 5, "comment": f"Error: criterio {criterion} no evaluado"}
                elif not isinstance(criteria[criterion], dict):
                    criteria[criterion] = {"score": 5, "comment": f"Error: formato incorrecto para {criterion}"}
                elif 'score' not in criteria[criterion] or 'comment' not in criteria[criterion]:
                    criteria[criterion] = {
                        "score": criteria[criterion].get('score', 5),
                        "comment": criteria[criterion].get('comment', f"Comentario no disponible para {criterion}")
                    }
            
            logger.info(f"✅ JSON parseado exitosamente. Score: {ai_data['overall_score']}")
            logger.info(f"✅ Feedback length: {len(ai_data.get('feedback', ''))}")
            logger.info(f"✅ Criteria keys: {list(ai_data.get('criteria', {}).keys())}")
            logger.info(f"✅ Suggestions count: {len(ai_data.get('suggestions', []))}")
            
        except (json.JSONDecodeError, ValueError, KeyError) as e:
            logger.error(f"❌ Error parsing JSON: {e}")
            logger.error(f"❌ Respuesta que falló: {ai_response[:500]}...")
            
            # Fallback con datos heurísticos estructurados
            ai_data = {
                "overall_score": float(heur["total"]),
                "feedback": f"Error en análisis de IA. Evaluación heurística: {heur['total']}/10 puntos. El objetivo requiere revisión manual para análisis completo.",
                "criteria": {
                    "specific": {
                        "score": float(heur.get("clarity", 5)), 
                        "comment": "Análisis automático basado en claridad del texto. Se recomienda revisión manual."
                    },
                    "measurable": {
                        "score": float(heur.get("focus", 5)), 
                        "comment": "Análisis automático basado en enfoque detectado. Verificar métricas específicas."
                    },
                    "achievable": {
                        "score": 5.0, 
                        "comment": "Análisis automático - requiere evaluación manual del contexto empresarial."
                    },
                    "relevant": {
                        "score": float(heur.get("focus", 5)), 
                        "comment": "Análisis automático basado en relevancia percibida. Validar alineación estratégica."
                    },
                    "timebound": {
                        "score": float(heur.get("writing", 5)), 
                        "comment": "Análisis automático basado en redacción. Verificar timeline específico."
                    }
                },
                "suggestions": [
                    "Revisar la especificidad del objetivo con métricas concretas",
                    "Añadir indicadores cuantificables y fechas límite claras",
                    "Evaluar la factibilidad con recursos y capacidades disponibles",
                    "Establecer hitos intermedios y timeline detallado de implementación"
                ]
            }
            
    except Exception as e:
        logger.error(f"❌ Error en llamada IA: {e}")
        
        # Fallback de emergencia con estructura completa
        ai_data = {
            "overall_score": float(heur["total"]),
            "feedback": f"Error en servicio de IA. Puntuación heurística: {heur['total']}/10. Contactar soporte técnico para análisis completo.",
            "criteria": {
                "specific": {
                    "score": float(heur.get("clarity", 5)), 
                    "comment": "Error en análisis específico - revisar conectividad con servicio de IA"
                },
                "measurable": {
                    "score": float(heur.get("focus", 5)), 
                    "comment": "Error en análisis de medición - validar configuración del sistema"
                },
                "achievable": {
                    "score": 5.0, 
                    "comment": "Error en análisis de factibilidad - requiere evaluación manual"
                },
                "relevant": {
                    "score": float(heur.get("focus", 5)), 
                    "comment": "Error en análisis de relevancia - verificar configuración de servicio"
                },
                "timebound": {
                    "score": float(heur.get("writing", 5)), 
                    "comment": "Error en análisis temporal - contactar administrador del sistema"
                }
            },
            "suggestions": [
                "Error obteniendo sugerencias - revisar configuración del servicio de IA",
                "Contactar soporte técnico para análisis detallado del objetivo",
                "Verificar conectividad y configuración del sistema",
                "Intentar evaluación manual mientras se resuelve el problema técnico"
            ]
        }
        ai_response = f"Error: {str(e)}"

    # Guardar en base de datos
    try:
        with SessionLocal() as db:
            db.add(OkrSubmission(
                id=okr_id,
                objective=objective,
                clarity=heur['clarity'],
                focus=heur['focus'],
                writing=heur['writing'],
                score=heur['total'],
                feedback=ai_data.get("feedback", "Error guardando feedback")
            ))
            db.commit()
            logger.info(f"💾 OKR guardado en BD con ID: {okr_id}")
    except Exception as e:
        logger.error(f"❌ Error guardando en BD: {e}")

    # 🔥 ESTRUCTURA FINAL COMPATIBLE CON FRONTEND
    result = {
        # Datos principales (estructura que espera el frontend)
        "score": ai_data["overall_score"],
        "feedback": ai_data["feedback"],
        "criteria": ai_data["criteria"],
        "suggestions": ai_data["suggestions"],
        
        # Debug info (para desarrollo)
        "debug_ai_response": ai_response,
        "debug_parsed": ai_data,
        
        # Metadata adicional
        "okr_id": okr_id,
        "model_used": "gpt-4o-mini",
        "timestamp": datetime.utcnow().isoformat(),
        "status": "success",
        
        # Legacy compatibility (para funcionalidades existentes)
        "breakdown": {
            "clarity": heur["clarity"],
            "focus": heur["focus"],
            "writing": heur["writing"]
        },
        "can_add_krs": ai_data["overall_score"] >= 7.5
    }
    
    logger.info(f"🎯 RESULTADO FINAL - ID: {okr_id}, Score: {result['score']}")
    return result


async def evaluate_kr(okr_id: str, kr_definition: str, target_value: str, target_date: str):
    """Evalúa un Key Result - mantener funcionalidad existente"""
    try:
        heur = score_kr(kr_definition, target_value, target_date)
        fb = await llm_feedback(f"Avalua RESULTAT CLAU d'OKR. KR: '{kr_definition}'; Valor: {target_value}; Data: {target_date}. Dona 3-6 millores concretes.")
        kr_id = str(uuid.uuid4())
        
        with SessionLocal() as db:
            db.add(KeyResult(
                id=kr_id, okr_id=okr_id, kr_definition=kr_definition,
                target_value=target_value, target_date=target_date,
                clarity=heur['clarity'], measurability=heur['measurability'], 
                feasibility=heur['feasibility'], score=heur['total'], feedback=fb
            ))
            db.commit()
            
        return {
            "key_result_id": kr_id,
            "score": heur["total"],
            "breakdown": {
                "clarity": heur["clarity"], 
                "measurability": heur["measurability"], 
                "feasibility": heur["feasibility"]
            },
            "feedback": fb,
            "allow_next_kr": heur["total"] >= 7.5
        }
    except Exception as e:
        logger.error(f"Error evaluating KR: {e}")
        raise