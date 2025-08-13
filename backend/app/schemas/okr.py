from pydantic import BaseModel, Field
from datetime import date

class OkrEvaluateRequest(BaseModel):
    objective: str = Field(min_length=5, max_length=2000)

class ScoreBreakdown(BaseModel):
    clarity: float
    focus: float
    writing: float

class OkrEvaluateResponse(BaseModel):
    okr_id: str
    score: float
    breakdown: ScoreBreakdown
    feedback: str
    can_add_krs: bool

class KrEvaluateRequest(BaseModel):
    okr_id: str
    kr_definition: str = Field(min_length=5, max_length=2000)
    target_value: str
    target_date: date

class KrScoreBreakdown(BaseModel):
    clarity: float
    measurability: float
    feasibility: float

class KrEvaluateResponse(BaseModel):
    key_result_id: str
    score: float
    breakdown: KrScoreBreakdown
    feedback: str
    allow_next_kr: bool
