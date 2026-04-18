from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from math import radians, sin, cos, sqrt, atan2
from random import randint

from fastapi import Depends, FastAPI, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from .auth import create_access_token, get_current_actor, get_current_donor, get_current_ngo, hash_password, verify_password
from .database import Base, engine, get_db, SessionLocal
from .models import Donation, Donor, Message, NGO
from .schemas import (
    DashboardStats,
    DonationCreateRequest,
    DonationStatusUpdate,
    DonationSummary,
    DonorOtpRequest,
    DonorOtpResponse,
    DonorOtpVerifyRequest,
    DonorRegisterRequest,
    DonorSummary,
    MessageCreateRequest,
    MessageResponse,
    MessageSummary,
    NGOLoginRequest,
    NGORegisterRequest,
    NGOSummary,
    TokenResponse,
)


def donation_to_schema(donation: Donation) -> DonationSummary:
    return DonationSummary(
        id=donation.id,
        item_type=donation.item_type,
        item_description=donation.item_description,
        quantity=donation.quantity,
        amount=donation.amount,
        pickup_address=donation.pickup_address,
        preferred_date=donation.preferred_date,
        notes=donation.notes,
        status=donation.status,
        created_at=donation.created_at,
        ngo=NGOSummary.model_validate(donation.ngo) if donation.ngo else None,
        donor=DonorSummary.model_validate(donation.donor) if donation.donor else None,
    )


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points in kilometers using Haversine formula."""
    R = 6371  # Earth's radius in kilometers

    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)

    a = sin(dlat/2) * sin(dlat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2) * sin(dlon/2)
    c = 2 * atan2(sqrt(a), sqrt(1-a))

    return R * c


def message_to_schema(message: Message) -> MessageSummary:
    return MessageSummary(
        id=message.id,
        content=message.content,
        is_read=message.is_read,
        created_at=message.created_at,
        sender_donor=DonorSummary.model_validate(message.sender_donor) if message.sender_donor else None,
        sender_ngo=NGOSummary.model_validate(message.sender_ngo) if message.sender_ngo else None,
        receiver_donor=DonorSummary.model_validate(message.receiver_donor) if message.receiver_donor else None,
        receiver_ngo=NGOSummary.model_validate(message.receiver_ngo) if message.receiver_ngo else None,
    )


def seed_demo_ngos():
    db = SessionLocal()
    try:
        existing = db.scalar(select(func.count(NGO.id)))
        if existing:
            return

        demo_ngos = [
            NGO(
                ngo_name="Hope Basket Foundation",
                government_ngo_id="NGO-HBF-2026",
                owner_name="Riya Menon",
                owner_id_proof="AADHAAR-908712345678",
                contact_number="9876543210",
                email="hopebasket@example.org",
                password_hash=hash_password("ngo12345"),
                city="Bengaluru",
                latitude=12.9716,  # Bengaluru coordinates
                longitude=77.5946,
                mission="Collecting food, books, and emergency funds for families rebuilding stability across urban communities.",
            ),
            NGO(
                ngo_name="Bright Future Trust",
                government_ngo_id="NGO-BFT-2026",
                owner_name="Aman Sharma",
                owner_id_proof="AADHAAR-781245639008",
                contact_number="9123456780",
                email="brightfuture@example.org",
                password_hash=hash_password("ngo12345"),
                city="Delhi",
                latitude=28.7041,  # Delhi coordinates
                longitude=77.1025,
                mission="Supporting child education through donated books, clothing kits, and monthly micro-grants.",
            ),
        ]
        db.add_all(demo_ngos)
        db.commit()
    finally:
        db.close()


def seed_demo_donors():
    db = SessionLocal()
    try:
        existing = db.scalar(select(func.count(Donor.id)))
        if existing:
            return

        demo_donors = [
            Donor(
                name="Priya Verma",
                mobile_number="9876543210",
                id_proof="AADHAAR-123456789012",
                city="Mumbai",
            ),
            Donor(
                name="Rajesh Kumar",
                mobile_number="9123456789",
                id_proof="AADHAAR-987654321098",
                city="Delhi",
            ),
        ]
        db.add_all(demo_donors)
        db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    seed_demo_ngos()
    seed_demo_donors()
    yield


app = FastAPI(
    title="NGO Donation Platform API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def healthcheck():
    return {"message": "NGO Donation Platform API is running."}


@app.post("/api/donors/register", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def register_donor(payload: DonorRegisterRequest, db: Session = Depends(get_db)):
    existing_donor = db.scalar(select(Donor).where(Donor.mobile_number == payload.mobile_number))
    if existing_donor:
        raise HTTPException(status_code=400, detail="A donor with this mobile number already exists.")

    donor = Donor(**payload.model_dump())
    db.add(donor)
    db.commit()
    return MessageResponse(message="Donor registered successfully. Request OTP to sign in.")


@app.post("/api/donors/request-otp", response_model=DonorOtpResponse)
def request_donor_otp(payload: DonorOtpRequest, db: Session = Depends(get_db)):
    donor = db.scalar(select(Donor).where(Donor.mobile_number == payload.mobile_number))
    if donor is None:
        raise HTTPException(status_code=404, detail="No donor account found for this mobile number.")

    demo_otp = f"{randint(100000, 999999)}"
    donor.otp_code = demo_otp
    donor.otp_expires_at = datetime.utcnow() + timedelta(minutes=5)
    db.add(donor)
    db.commit()
    return DonorOtpResponse(
        message="OTP generated successfully. Use the demo OTP below to continue.",
        demo_otp=demo_otp,
    )


@app.post("/api/donors/verify-otp", response_model=TokenResponse)
def verify_donor_otp(payload: DonorOtpVerifyRequest, db: Session = Depends(get_db)):
    donor = db.scalar(select(Donor).where(Donor.mobile_number == payload.mobile_number))
    if donor is None or donor.otp_code != payload.otp_code:
        raise HTTPException(status_code=401, detail="Invalid mobile number or OTP.")

    if donor.otp_expires_at is None or donor.otp_expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail="OTP has expired. Please request a new one.")

    donor.otp_code = None
    donor.otp_expires_at = None
    db.add(donor)
    db.commit()

    token = create_access_token({"sub": str(donor.id), "role": "donor"})
    return TokenResponse(
        access_token=token,
        role="donor",
        profile=DonorSummary.model_validate(donor),
    )


@app.post("/api/ngos/register", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def register_ngo(payload: NGORegisterRequest, db: Session = Depends(get_db)):
    normalized_email = payload.email.lower()
    if db.scalar(select(NGO).where(NGO.email == normalized_email)):
        raise HTTPException(status_code=400, detail="An NGO with this email already exists.")
    if db.scalar(select(NGO).where(NGO.government_ngo_id == payload.government_ngo_id)):
        raise HTTPException(status_code=400, detail="This government NGO ID is already registered.")

    ngo = NGO(
        ngo_name=payload.ngo_name,
        government_ngo_id=payload.government_ngo_id,
        owner_name=payload.owner_name,
        owner_id_proof=payload.owner_id_proof,
        contact_number=payload.contact_number,
        email=normalized_email,
        password_hash=hash_password(payload.password),
        city=payload.city,
        mission=payload.mission,
    )
    db.add(ngo)
    db.commit()
    return MessageResponse(message="NGO registered successfully. Please sign in.")


@app.post("/api/ngos/login", response_model=TokenResponse)
def login_ngo(payload: NGOLoginRequest, db: Session = Depends(get_db)):
    ngo = db.scalar(select(NGO).where(NGO.email == payload.email.lower()))
    if ngo is None or not verify_password(payload.password, ngo.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token({"sub": str(ngo.id), "role": "ngo"})
    return TokenResponse(
        access_token=token,
        role="ngo",
        profile=NGOSummary.model_validate(ngo),
    )


@app.get("/api/ngos", response_model=list[NGOSummary])
def list_ngos(
    db: Session = Depends(get_db),
    latitude: float | None = Query(None, description="User's latitude for distance sorting"),
    longitude: float | None = Query(None, description="User's longitude for distance sorting"),
    max_distance: float = Query(50.0, description="Maximum distance in kilometers")
):
    ngos = db.scalars(select(NGO).order_by(NGO.created_at.desc())).all()

    if latitude is not None and longitude is not None:
        # Filter and sort by distance
        ngos_with_distance = []
        for ngo in ngos:
            if ngo.latitude is not None and ngo.longitude is not None:
                distance = calculate_distance(latitude, longitude, ngo.latitude, ngo.longitude)
                if distance <= max_distance:
                    ngos_with_distance.append((ngo, distance))

        # Sort by distance
        ngos_with_distance.sort(key=lambda x: x[1])
        ngos = [ngo for ngo, _ in ngos_with_distance]

    return [NGOSummary.model_validate(ngo) for ngo in ngos]


@app.get("/api/donors/me", response_model=DonorSummary)
def get_donor_profile(current_donor: Donor = Depends(get_current_donor)):
    return DonorSummary.model_validate(current_donor)


@app.get("/api/donors/me/donations", response_model=list[DonationSummary])
def get_donor_donations(
    current_donor: Donor = Depends(get_current_donor),
    db: Session = Depends(get_db),
):
    donations = db.scalars(
        select(Donation)
        .where(Donation.donor_id == current_donor.id)
        .options(joinedload(Donation.ngo), joinedload(Donation.donor))
        .order_by(Donation.created_at.desc())
    ).all()
    return [donation_to_schema(donation) for donation in donations]


@app.get("/api/donors/me/stats", response_model=DashboardStats)
def get_donor_stats(
    current_donor: Donor = Depends(get_current_donor),
    db: Session = Depends(get_db),
):
    donations = db.scalars(select(Donation).where(Donation.donor_id == current_donor.id)).all()
    total_amount = sum(donation.amount or 0 for donation in donations)
    ngo_count = len({donation.ngo_id for donation in donations})
    return DashboardStats(
        donations_count=len(donations),
        total_amount=total_amount,
        ngos_supported=ngo_count,
    )


@app.post("/api/donations", response_model=DonationSummary, status_code=status.HTTP_201_CREATED)
def create_donation(
    payload: DonationCreateRequest,
    current_donor: Donor = Depends(get_current_donor),
    db: Session = Depends(get_db),
):
    ngo = db.get(NGO, payload.ngo_id)
    if ngo is None:
        raise HTTPException(status_code=404, detail="Selected NGO does not exist.")

    donation = Donation(
        item_type=payload.item_type,
        item_description=payload.item_description,
        quantity=payload.quantity,
        amount=payload.amount,
        pickup_address=payload.pickup_address,
        preferred_date=payload.preferred_date,
        notes=payload.notes,
        donor_id=current_donor.id,
        ngo_id=ngo.id,
    )
    db.add(donation)
    db.commit()
    db.refresh(donation)
    donation.ngo = ngo
    donation.donor = current_donor
    return donation_to_schema(donation)


@app.put("/api/donations/{donation_id}/status", response_model=DonationSummary)
def update_donation_status(
    donation_id: int,
    payload: DonationStatusUpdate,
    current_ngo: NGO = Depends(get_current_ngo),
    db: Session = Depends(get_db),
):
    donation = db.get(Donation, donation_id)
    if donation is None:
        raise HTTPException(status_code=404, detail="Donation not found.")
    
    if donation.ngo_id != current_ngo.id:
        raise HTTPException(status_code=403, detail="You can only update status for donations assigned to your NGO.")
    
    donation.status = payload.status
    db.commit()
    db.refresh(donation)
    return donation_to_schema(donation)


# Message endpoints
@app.post("/api/messages", response_model=MessageSummary, status_code=status.HTTP_201_CREATED)
def send_message(
    payload: MessageCreateRequest,
    current_actor=Depends(get_current_actor),
    db: Session = Depends(get_db),
):
    # Validate receiver exists
    if payload.receiver_type == "donor":
        receiver = db.get(Donor, payload.receiver_id)
        if not receiver:
            raise HTTPException(status_code=404, detail="Donor not found.")
    else:  # ngo
        receiver = db.get(NGO, payload.receiver_id)
        if not receiver:
            raise HTTPException(status_code=404, detail="NGO not found.")

    # Create message
    message = Message(content=payload.content)

    if current_actor["role"] == "donor":
        message.sender_donor_id = current_actor["actor"].id
        if payload.receiver_type == "ngo":
            message.receiver_ngo_id = payload.receiver_id
        else:
            raise HTTPException(status_code=400, detail="Donors can only message NGOs.")
    else:  # ngo
        message.sender_ngo_id = current_actor["actor"].id
        if payload.receiver_type == "donor":
            message.receiver_donor_id = payload.receiver_id
        else:
            raise HTTPException(status_code=400, detail="NGOs can only message donors.")

    db.add(message)
    db.commit()
    db.refresh(message)

    # Load relationships
    if message.sender_donor_id:
        message.sender_donor = db.get(Donor, message.sender_donor_id)
    if message.sender_ngo_id:
        message.sender_ngo = db.get(NGO, message.sender_ngo_id)
    if message.receiver_donor_id:
        message.receiver_donor = db.get(Donor, message.receiver_donor_id)
    if message.receiver_ngo_id:
        message.receiver_ngo = db.get(NGO, message.receiver_ngo_id)

    return message_to_schema(message)


@app.get("/api/messages", response_model=list[MessageSummary])
def get_messages(
    current_actor=Depends(get_current_actor),
    db: Session = Depends(get_db),
):
    if current_actor["role"] == "donor":
        messages = db.scalars(
            select(Message).where(
                (Message.sender_donor_id == current_actor["actor"].id) |
                (Message.receiver_donor_id == current_actor["actor"].id)
            ).order_by(Message.created_at.desc())
        ).all()
    else:  # ngo
        messages = db.scalars(
            select(Message).where(
                (Message.sender_ngo_id == current_actor["actor"].id) |
                (Message.receiver_ngo_id == current_actor["actor"].id)
            ).order_by(Message.created_at.desc())
        ).all()

    # Load relationships for all messages
    for message in messages:
        if message.sender_donor_id:
            message.sender_donor = db.get(Donor, message.sender_donor_id)
        if message.sender_ngo_id:
            message.sender_ngo = db.get(NGO, message.sender_ngo_id)
        if message.receiver_donor_id:
            message.receiver_donor = db.get(Donor, message.receiver_donor_id)
        if message.receiver_ngo_id:
            message.receiver_ngo = db.get(NGO, message.receiver_ngo_id)

    return [message_to_schema(msg) for msg in messages]


@app.put("/api/messages/{message_id}/read", response_model=MessageSummary)
def mark_message_read(
    message_id: int,
    current_actor=Depends(get_current_actor),
    db: Session = Depends(get_db),
):
    message = db.get(Message, message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found.")

    # Check if user can access this message
    can_access = False
    if current_actor["role"] == "donor":
        can_access = (message.sender_donor_id == current_actor["actor"].id or
                     message.receiver_donor_id == current_actor["actor"].id)
    else:  # ngo
        can_access = (message.sender_ngo_id == current_actor["actor"].id or
                     message.receiver_ngo_id == current_actor["actor"].id)

    if not can_access:
        raise HTTPException(status_code=403, detail="Access denied.")

    message.is_read = True
    db.commit()
    db.refresh(message)

    # Load relationships
    if message.sender_donor_id:
        message.sender_donor = db.get(Donor, message.sender_donor_id)
    if message.sender_ngo_id:
        message.sender_ngo = db.get(NGO, message.sender_ngo_id)
    if message.receiver_donor_id:
        message.receiver_donor = db.get(Donor, message.receiver_donor_id)
    if message.receiver_ngo_id:
        message.receiver_ngo = db.get(NGO, message.receiver_ngo_id)

    return message_to_schema(message)


@app.get("/api/ngos/me", response_model=NGOSummary)
def get_ngo_profile(current_ngo: NGO = Depends(get_current_ngo)):
    return NGOSummary.model_validate(current_ngo)


@app.get("/api/ngos/me/donations", response_model=list[DonationSummary])
def get_ngo_donations(
    current_ngo: NGO = Depends(get_current_ngo),
    db: Session = Depends(get_db),
):
    donations = db.scalars(
        select(Donation)
        .where(Donation.ngo_id == current_ngo.id)
        .options(joinedload(Donation.ngo), joinedload(Donation.donor))
        .order_by(Donation.created_at.desc())
    ).all()
    return [donation_to_schema(donation) for donation in donations]


@app.get("/api/ngos/me/donors", response_model=list[DonorSummary])
def get_ngo_donors(
    current_ngo: NGO = Depends(get_current_ngo),
    db: Session = Depends(get_db),
):
    donors = db.scalars(
        select(Donor)
        .join(Donation, Donation.donor_id == Donor.id)
        .where(Donation.ngo_id == current_ngo.id)
        .distinct()
        .order_by(Donor.created_at.desc())
    ).all()
    return [DonorSummary.model_validate(donor) for donor in donors]


@app.get("/api/ngos/me/stats", response_model=DashboardStats)
def get_ngo_stats(
    current_ngo: NGO = Depends(get_current_ngo),
    db: Session = Depends(get_db),
):
    donations = db.scalars(select(Donation).where(Donation.ngo_id == current_ngo.id)).all()
    total_amount = sum(donation.amount or 0 for donation in donations)
    donor_count = len({donation.donor_id for donation in donations})
    return DashboardStats(
        donations_count=len(donations),
        total_amount=total_amount,
        donors_connected=donor_count,
    )
