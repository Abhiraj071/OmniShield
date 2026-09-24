from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from datetime import datetime
from app.database import Base

class LearnedHeuristic(Base):
    __tablename__ = "learned_heuristics"

    id = Column(Integer, primary_key=True, index=True)
    vendor = Column(String(64), index=True, default="all")
    raw_pattern = Column(String(256), nullable=False)
    regex_pattern = Column(String(256), nullable=False)
    canonical_category = Column(String(64), nullable=False)  # management, aaa, logging, snmp, ntp, interface
    canonical_parameter = Column(String(64), nullable=False) # e.g. idle_timeout, telnet_disabled, ssh_version
    parameter_type = Column(String(32), default="boolean")    # boolean, integer, string
    target_value = Column(String(128), nullable=False)        # value or capture group
    description = Column(String(256), default="")
    confidence = Column(Float, default=1.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
