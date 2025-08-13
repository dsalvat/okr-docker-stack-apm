from fastapi import APIRouter, HTTPException, Depends
from app.schemas.okr import OkrEvaluateRequest, OkrEvaluateResponse, KrEvaluateRequest, KrEvaluateResponse
from app.services.okr_service import evaluate_objective, evaluate_kr
from app.core.ratelimit import rate_limit

router = APIRouter()

@router.post("/evaluate", response_model=OkrEvaluateResponse, dependencies=[Depends(rate_limit)])
async def evaluate(req: OkrEvaluateRequest):
    try:
        return await evaluate_objective(req.objective)
    except Exception as e:
        raise HTTPException(500, str(e))

@router.post("/kr/evaluate", response_model=KrEvaluateResponse, dependencies=[Depends(rate_limit)])
async def evaluate_key_result(req: KrEvaluateRequest):
    try:
        return await evaluate_kr(req.okr_id, req.kr_definition, req.target_value, req.target_date.isoformat())
    except Exception as e:
        raise HTTPException(500, str(e))
