import pytest
from app.database import SessionLocal, Base, engine
from app.models.heuristic import LearnedHeuristic
from app.schemas.heuristic import CreateHeuristicRequest
from app.services.training.learning_loop import LearningLoopService
from app.services.normalizer.normalizer_service import NormalizerService

@pytest.fixture
def db_session():
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    yield session
    session.close()

def test_nlp_suggestions_and_dynamic_training(db_session):
    unparsed_sample = [
        "session-inactivity-grace-timer minutes 30",
        "legacy-cleartext-telnet state active",
        "random unrecognized garbage line"
    ]
    suggestions = LearningLoopService.get_unparsed_line_suggestions(unparsed_sample)
    assert len(suggestions) >= 2

    # Check suggestion accuracy
    timeout_sug = next((s for s in suggestions if "session-inactivity" in s.raw_line), None)
    assert timeout_sug is not None
    assert timeout_sug.suggested_category == "management"
    assert timeout_sug.suggested_parameter == "idle_timeout_seconds"
    assert timeout_sug.confidence > 0.8

    # Create dynamic heuristic
    req = CreateHeuristicRequest(
        vendor="custom",
        raw_line="session-inactivity-grace-timer minutes 30",
        canonical_category="management",
        canonical_parameter="idle_timeout_seconds",
        parameter_type="integer",
        target_value="1800",
        description="Dynamic test rule for session timeout"
    )
    heuristic = LearningLoopService.create_heuristic(db_session, req)
    assert heuristic.id is not None
    assert heuristic.is_active is True

    # Test applying this heuristic to text
    text = "system-profile\n session-inactivity-grace-timer minutes 30\nexit"
    b = NormalizerService.normalize_config(text, heuristics=[heuristic])
    assert b.management.idle_timeout_seconds == 1800
    assert b.heuristic_matched_count >= 1
