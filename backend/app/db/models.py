from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import String, Text, DateTime, ForeignKey, Float, func
from sqlalchemy.dialects.mysql import LONGTEXT
from datetime import datetime

class Base(DeclarativeBase):
    pass

class OkrSubmission(Base):
    __tablename__ = "okr_submissions"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    objective: Mapped[str] = mapped_column(Text)
    clarity: Mapped[float] = mapped_column(Float)
    focus: Mapped[float] = mapped_column(Float)
    writing: Mapped[float] = mapped_column(Float)
    score: Mapped[float] = mapped_column(Float)
    feedback: Mapped[str] = mapped_column(LONGTEXT)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    key_results: Mapped[list["KeyResult"]] = relationship(back_populates="okr", cascade="all, delete")

class KeyResult(Base):
    __tablename__ = "key_results"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    okr_id: Mapped[str] = mapped_column(ForeignKey("okr_submissions.id", ondelete="CASCADE"), index=True)
    kr_definition: Mapped[str] = mapped_column(Text)
    target_value: Mapped[str] = mapped_column(String(255))
    target_date: Mapped[datetime] = mapped_column(DateTime)
    clarity: Mapped[float] = mapped_column(Float)
    measurability: Mapped[float] = mapped_column(Float)
    feasibility: Mapped[float] = mapped_column(Float)
    score: Mapped[float] = mapped_column(Float)
    feedback: Mapped[str] = mapped_column(LONGTEXT)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    okr: Mapped[OkrSubmission] = relationship(back_populates="key_results")
