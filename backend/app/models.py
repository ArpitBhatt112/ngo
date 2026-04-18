from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class Donor(Base):
    __tablename__ = "donors"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    mobile_number: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    id_proof: Mapped[str] = mapped_column(String(64), nullable=False)
    city: Mapped[str] = mapped_column(String(120), nullable=False)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    otp_code: Mapped[str | None] = mapped_column(String(6), nullable=True)
    otp_expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    donations: Mapped[list["Donation"]] = relationship(back_populates="donor", cascade="all, delete-orphan")
    sent_messages: Mapped[list["Message"]] = relationship(back_populates="sender_donor", foreign_keys="Message.sender_donor_id", cascade="all, delete-orphan")
    received_messages: Mapped[list["Message"]] = relationship(back_populates="receiver_donor", foreign_keys="Message.receiver_donor_id", cascade="all, delete-orphan")


class NGO(Base):
    __tablename__ = "ngos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    ngo_name: Mapped[str] = mapped_column(String(160), nullable=False)
    government_ngo_id: Mapped[str] = mapped_column(String(60), unique=True, index=True, nullable=False)
    owner_name: Mapped[str] = mapped_column(String(120), nullable=False)
    owner_id_proof: Mapped[str] = mapped_column(String(64), nullable=False)
    contact_number: Mapped[str] = mapped_column(String(20), nullable=False)
    email: Mapped[str] = mapped_column(String(160), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    city: Mapped[str] = mapped_column(String(120), nullable=False)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    mission: Mapped[str] = mapped_column(Text, nullable=False)
    account_balance: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    donations: Mapped[list["Donation"]] = relationship(back_populates="ngo", cascade="all, delete-orphan")
    sent_messages: Mapped[list["Message"]] = relationship(back_populates="sender_ngo", foreign_keys="Message.sender_ngo_id", cascade="all, delete-orphan")
    received_messages: Mapped[list["Message"]] = relationship(back_populates="receiver_ngo", foreign_keys="Message.receiver_ngo_id", cascade="all, delete-orphan")


class Donation(Base):
    __tablename__ = "donations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    item_type: Mapped[str] = mapped_column(String(60), nullable=False)
    item_description: Mapped[str] = mapped_column(Text, nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    amount: Mapped[float | None] = mapped_column(Float, nullable=True)
    pickup_address: Mapped[str] = mapped_column(Text, nullable=False)
    preferred_date: Mapped[str | None] = mapped_column(String(40), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="Pending Pickup", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    donor_id: Mapped[int] = mapped_column(ForeignKey("donors.id"), nullable=False)
    ngo_id: Mapped[int] = mapped_column(ForeignKey("ngos.id"), nullable=False)

    donor: Mapped["Donor"] = relationship(back_populates="donations")
    ngo: Mapped["NGO"] = relationship(back_populates="donations")


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # For donor-to-ngo messages
    sender_donor_id: Mapped[int | None] = mapped_column(ForeignKey("donors.id"), nullable=True)
    receiver_ngo_id: Mapped[int | None] = mapped_column(ForeignKey("ngos.id"), nullable=True)

    # For ngo-to-donor messages
    sender_ngo_id: Mapped[int | None] = mapped_column(ForeignKey("ngos.id"), nullable=True)
    receiver_donor_id: Mapped[int | None] = mapped_column(ForeignKey("donors.id"), nullable=True)

    sender_donor: Mapped["Donor"] = relationship(back_populates="sent_messages", foreign_keys=[sender_donor_id])
    receiver_donor: Mapped["Donor"] = relationship(back_populates="received_messages", foreign_keys=[receiver_donor_id])
    sender_ngo: Mapped["NGO"] = relationship(back_populates="sent_messages", foreign_keys=[sender_ngo_id])
    receiver_ngo: Mapped["NGO"] = relationship(back_populates="received_messages", foreign_keys=[receiver_ngo_id])
