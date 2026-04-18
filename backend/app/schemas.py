from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class DonorRegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    mobile_number: str = Field(min_length=10, max_length=20)
    id_proof: str = Field(min_length=6, max_length=64)
    city: str = Field(min_length=2, max_length=120)
    latitude: float | None = None
    longitude: float | None = None

    @field_validator("mobile_number")
    @classmethod
    def validate_mobile(cls, value: str) -> str:
        digits = "".join(ch for ch in value if ch.isdigit())
        if len(digits) < 10:
            raise ValueError("Enter a valid mobile number.")
        return digits


class DonorOtpRequest(BaseModel):
    mobile_number: str = Field(min_length=10, max_length=20)

    @field_validator("mobile_number")
    @classmethod
    def normalize_mobile(cls, value: str) -> str:
        return "".join(ch for ch in value if ch.isdigit())


class DonorOtpVerifyRequest(DonorOtpRequest):
    otp_code: str = Field(min_length=4, max_length=6)


class NGORegisterRequest(BaseModel):
    ngo_name: str = Field(min_length=3, max_length=160)
    government_ngo_id: str = Field(min_length=4, max_length=60)
    owner_name: str = Field(min_length=2, max_length=120)
    owner_id_proof: str = Field(min_length=6, max_length=64)
    contact_number: str = Field(min_length=10, max_length=20)
    email: str = Field(min_length=5, max_length=160)
    password: str = Field(min_length=6, max_length=64)
    city: str = Field(min_length=2, max_length=120)
    latitude: float | None = None
    longitude: float | None = None
    mission: str = Field(min_length=20, max_length=500)


class NGOLoginRequest(BaseModel):
    email: str = Field(min_length=5, max_length=160)
    password: str = Field(min_length=6, max_length=64)


class DonationCreateRequest(BaseModel):
    item_type: str = Field(min_length=2, max_length=60)
    item_description: str = Field(min_length=10, max_length=500)
    quantity: int = Field(ge=1, le=100000)
    amount: float | None = Field(default=None, ge=0)
    pickup_address: str = Field(min_length=10, max_length=500)
    preferred_date: str | None = Field(default=None, max_length=40)
    notes: str | None = Field(default=None, max_length=500)
    ngo_id: int


class DonorSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    mobile_number: str
    id_proof: str
    city: str
    latitude: float | None
    longitude: float | None
    created_at: datetime


class NGOSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ngo_name: str
    government_ngo_id: str
    owner_name: str
    owner_id_proof: str
    contact_number: str
    email: str
    city: str
    latitude: float | None
    longitude: float | None
    mission: str
    account_balance: float
    created_at: datetime


class DonationSummary(BaseModel):
    id: int
    item_type: str
    item_description: str
    quantity: int
    amount: float | None
    pickup_address: str
    preferred_date: str | None
    notes: str | None
    status: str
    created_at: datetime
    ngo: NGOSummary | None = None
    donor: DonorSummary | None = None


class DonationStatusUpdate(BaseModel):
    status: str = Field(min_length=1, max_length=50)


class MessageCreateRequest(BaseModel):
    content: str = Field(min_length=1, max_length=1000)
    receiver_id: int
    receiver_type: str = Field(pattern="^(donor|ngo)$")


class MessageSummary(BaseModel):
    id: int
    content: str
    is_read: bool
    created_at: datetime
    sender_donor: DonorSummary | None = None
    sender_ngo: NGOSummary | None = None
    receiver_donor: DonorSummary | None = None
    receiver_ngo: NGOSummary | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    profile: DonorSummary | NGOSummary


class MessageResponse(BaseModel):
    message: str


class DonorOtpResponse(MessageResponse):
    demo_otp: str


class DashboardStats(BaseModel):
    donations_count: int
    total_amount: float
    ngos_supported: int | None = None
    donors_connected: int | None = None
