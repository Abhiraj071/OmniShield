from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from datetime import datetime
from app.database import Base

class ComplianceAudit(Base):
    __tablename__ = "compliance_audits"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey("device_configs.id"), nullable=False)
    framework = Column(String(32), index=True, default="CIS") # CIS, NIST, DISA_STIG, ISO27001
    compliance_score = Column(Float, default=0.0)
    passed_count = Column(Integer, default=0)
    failed_count = Column(Integer, default=0)
    warning_count = Column(Integer, default=0)
    total_controls = Column(Integer, default=0)
    findings_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
