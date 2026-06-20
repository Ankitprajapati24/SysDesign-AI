import secrets
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from backend.app.core.database import Base
from sqlalchemy.orm import relationship

class SharedLink(Base):
    __tablename__ = "shared_links"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), 
                         nullable=False, unique=True)
    share_token = Column(String(64), unique=True, index=True, nullable=False,
                          default=lambda: secrets.token_urlsafe(24))
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    view_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="shared_link")
