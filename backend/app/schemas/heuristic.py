from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class CreateHeuristicRequest(BaseModel):
    vendor: str = "all"
    raw_line: str
    canonical_category: str
    canonical_parameter: str
    parameter_type: str = "boolean"  # boolean, integer, string
    target_value: str
    description: Optional[str] = None

class HeuristicResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    vendor: str
    raw_pattern: str
    regex_pattern: str
    canonical_category: str
    canonical_parameter: str
    parameter_type: str
    target_value: str
    description: str
    confidence: float
    is_active: bool
    created_at: datetime

class NLPSuggestion(BaseModel):
    raw_line: str
    suggested_category: str
    suggested_parameter: str
    suggested_type: str
    suggested_value: str
    confidence: float
    explanation: str
