from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from app.database import Base

class DeviceConfig(Base):
    __tablename__ = "device_configs"

    id = Column(Integer, primary_key=True, index=True)
    hostname = Column(String(128), index=True, default="UNKNOWN-HOST")
    vendor = Column(String(64), index=True, default="generic")
    model = Column(String(128), default="Generic Network Device")
    os_version = Column(String(64), default="Unknown")
    serial_number = Column(String(128), default="N/A")
    raw_config = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
