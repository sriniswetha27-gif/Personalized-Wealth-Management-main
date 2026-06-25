from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Holding(Base):
    __tablename__ = "holdings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    symbol: Mapped[str] = mapped_column(String(20), index=True, nullable=False)
    name: Mapped[str | None] = mapped_column(String(255))
    quantity: Mapped[Decimal] = mapped_column(Numeric(18, 6), nullable=False)
    average_cost: Mapped[Decimal] = mapped_column(Numeric(18, 4), nullable=False)
    asset_class: Mapped[str] = mapped_column(String(50), default="equity")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="holdings")
