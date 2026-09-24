import re
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.heuristic import LearnedHeuristic
from app.schemas.heuristic import CreateHeuristicRequest, NLPSuggestion
from app.services.normalizer.nlp_engine import NLPEngine

class LearningLoopService:
    @staticmethod
    def get_unparsed_line_suggestions(unparsed_lines: List[str]) -> List[NLPSuggestion]:
        suggestions = []
        for line in unparsed_lines:
            sug = NLPEngine.analyze_unparsed_line(line)
            if sug:
                suggestions.append(sug)
        return suggestions

    @staticmethod
    def create_heuristic(db: Session, req: CreateHeuristicRequest) -> LearnedHeuristic:
        # Build a robust regex pattern from the raw line
        # e.g., if line is "session-inactivity-grace-timer minutes 45", regex can be:
        # r"session-inactivity-grace-timer\s+minutes\s+(\d+)"
        clean_line = req.raw_line.strip()
        escaped = re.escape(clean_line)

        # Replace digits with (\d+) capture group if parameter is numeric
        if req.parameter_type == "integer":
            escaped_regex = re.sub(r'\\(\d+)', r'(\\d+)', escaped)
        else:
            escaped_regex = escaped

        # Replace quotes with flexible regex
        escaped_regex = escaped_regex.replace(r'\"', r'["\']?')

        heuristic = LearnedHeuristic(
            vendor=req.vendor.lower(),
            raw_pattern=clean_line,
            regex_pattern=escaped_regex,
            canonical_category=req.canonical_category,
            canonical_parameter=req.canonical_parameter,
            parameter_type=req.parameter_type,
            target_value=req.target_value,
            description=req.description or f"Trained heuristic mapping for {req.canonical_parameter}",
            confidence=0.95,
            is_active=True
        )

        db.add(heuristic)
        db.commit()
        db.refresh(heuristic)
        return heuristic

    @staticmethod
    def list_heuristics(db: Session, vendor: Optional[str] = None) -> List[LearnedHeuristic]:
        query = db.query(LearnedHeuristic).filter(LearnedHeuristic.is_active == True)
        if vendor and vendor != "all":
            query = query.filter(LearnedHeuristic.vendor.in_([vendor.lower(), "all"]))
        return query.all()

    @staticmethod
    def delete_heuristic(db: Session, heuristic_id: int) -> bool:
        h = db.query(LearnedHeuristic).filter(LearnedHeuristic.id == heuristic_id).first()
        if h:
            h.is_active = False
            db.commit()
            return True
        return False
