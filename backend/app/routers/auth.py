"""
app/routers/auth.py
Authentication endpoints: register, login, me, refresh.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    hash_password, verify_password,
    create_access_token, get_current_user
)
from app.models.models import User, Patient, Doctor
from app.schemas.schemas import (
    RegisterRequest, LoginRequest, TokenResponse, UserOut
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
google_router = APIRouter(tags=["Auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    """Create a new user account and return a JWT."""
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=body.email,
        full_name=body.full_name,
        hashed_password=hash_password(body.password),
        role=body.role,
    )
    db.add(user)
    db.flush()  # get user.id before commit

    # Auto-create profile record based on role
    if body.role == "patient":
        db.add(Patient(user_id=user.id))
    elif body.role == "doctor":
        db.add(Doctor(user_id=user.id))

    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(
        access_token=token,
        role=user.role,
        full_name=user.full_name,
        user_id=user.id,
        email=user.email,
    )


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate and return JWT."""
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(
        access_token=token,
        role=user.role,
        full_name=user.full_name,
        user_id=user.id,
        email=user.email,
    )


@router.get("/me", response_model=UserOut)
def get_me(current_user=Depends(get_current_user)):
    """Return the currently authenticated user's profile."""
    return current_user


@router.post("/logout")
def logout():
    """
    Client-side logout (invalidate token on frontend).
    For server-side blacklisting, implement a Redis token blocklist.
    """
    return {"message": "Logged out successfully"}


class TokenSchema(BaseModel):
    token: str


class GoogleUserSchema(BaseModel):
    email: str
    name: Optional[str] = None
    picture: Optional[str] = None


class GoogleTokenResponse(TokenResponse):
    user: Optional[GoogleUserSchema] = None


@router.post("/google", response_model=GoogleTokenResponse)
@google_router.post("/google", response_model=GoogleTokenResponse)
def google_auth(data: TokenSchema, db: Session = Depends(get_db)):
    """Authenticate via Google OAuth, create user if not exists, and return JWT."""
    try:
        # Verify the token. It can be a JWT (ID Token) or an Access Token
        if len(data.token.split('.')) == 3:
            # ID Token (JWT)
            idinfo = id_token.verify_oauth2_token(
                data.token,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID
            )
        else:
            # Access Token
            import httpx
            response = httpx.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {data.token}"}
            )
            if response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid Google access token")
            idinfo = response.json()

        email = idinfo.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Google token does not contain email")

        name = idinfo.get("name", email.split("@")[0])

        # Check if user already exists
        user = db.query(User).filter(User.email == email).first()

        if not user:
            # Create new user
            import uuid
            # Generate a random password hash for security
            dummy_password = str(uuid.uuid4())
            user = User(
                email=email,
                full_name=name,
                hashed_password=hash_password(dummy_password),
                role="patient", # default role
            )
            db.add(user)
            db.flush()

            # Auto-create patient profile
            db.add(Patient(user_id=user.id))
            db.commit()
            db.refresh(user)
        else:
            if not user.is_active:
                raise HTTPException(status_code=403, detail="Account is disabled")

        # Generate access token using the existing helper
        token = create_access_token({"sub": str(user.id), "role": user.role})

        return GoogleTokenResponse(
            access_token=token,
            token_type="bearer",
            role=user.role,
            full_name=user.full_name,
            user_id=user.id,
            email=user.email,
            user=GoogleUserSchema(
                email=user.email,
                name=user.full_name,
                picture=idinfo.get("picture")
            )
        )

    except ValueError as e:
        raise HTTPException(
            status_code=401,
            detail=f"Invalid Google token: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Authentication failed: {str(e)}"
        )


class PatientProfileOut(BaseModel):
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

    class Config:
        from_attributes = True


class DoctorProfileOut(BaseModel):
    specialization: Optional[str] = None
    license_number: Optional[str] = None
    experience_years: Optional[int] = None
    phone: Optional[str] = None

    class Config:
        from_attributes = True


class ProfileResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    patient_profile: Optional[PatientProfileOut] = None
    doctor_profile: Optional[DoctorProfileOut] = None

    class Config:
        from_attributes = True


class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    # Patient fields
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    # Doctor fields
    specialization: Optional[str] = None
    license_number: Optional[str] = None
    experience_years: Optional[int] = None


@router.get("/profile", response_model=ProfileResponse)
def get_profile(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Fetch the currently logged in user's full profile (including role profile)."""
    return current_user


@router.put("/profile", response_model=ProfileResponse)
def update_profile(body: ProfileUpdateRequest, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    """Update user profile information."""
    if body.full_name is not None:
        current_user.full_name = body.full_name

    if current_user.role == "patient":
        profile = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if not profile:
            profile = Patient(user_id=current_user.id)
            db.add(profile)
        if body.date_of_birth is not None:
            profile.date_of_birth = body.date_of_birth
        if body.gender is not None:
            profile.gender = body.gender
        if body.blood_group is not None:
            profile.blood_group = body.blood_group
        if body.phone is not None:
            profile.phone = body.phone
        if body.address is not None:
            profile.address = body.address

    elif current_user.role == "doctor":
        profile = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        if not profile:
            profile = Doctor(user_id=current_user.id)
            db.add(profile)
        if body.specialization is not None:
            profile.specialization = body.specialization
        if body.license_number is not None:
            profile.license_number = body.license_number
        if body.experience_years is not None:
            profile.experience_years = body.experience_years
        if body.phone is not None:
            profile.phone = body.phone

    db.commit()
    db.refresh(current_user)
    return current_user
