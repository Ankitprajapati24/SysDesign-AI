from fastapi import APIRouter, Depends, Response, Request, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from backend.app.core.database import get_db
from backend.app.core.dependencies import get_current_user
from backend.app.core.config import settings
from backend.app.schemas.auth import UserCreate, UserLogin, UserOut, Token, TokenRefreshRequest
from backend.app.services.auth_service import register_user, authenticate_user, create_user_tokens, refresh_user_token, revoke_refresh_token, create_guest_user
from backend.app.db_models.user import User
from backend.app.core.security import get_password_hash

router = APIRouter()

def set_auth_cookies(response: Response, request: Request, tokens):
    hostname = request.url.hostname or ""
    is_dev = "localhost" in hostname or "127.0.0.1" in hostname
    samesite = "lax" if is_dev else "none"
    secure = False if is_dev else True
    
    response.set_cookie(
        key="access_token",
        value=f"Bearer {tokens.access_token}",
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite=samesite,
        secure=secure
    )
    response.set_cookie(
        key="refresh_token",
        value=tokens.refresh_token,
        httponly=True,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        samesite=samesite,
        secure=secure
    )

def delete_auth_cookies(response: Response, request: Request):
    hostname = request.url.hostname or ""
    is_dev = "localhost" in hostname or "127.0.0.1" in hostname
    samesite = "lax" if is_dev else "none"
    secure = False if is_dev else True
    
    response.delete_cookie(
        key="access_token",
        samesite=samesite,
        secure=secure
    )
    response.delete_cookie(
        key="refresh_token",
        samesite=samesite,
        secure=secure
    )

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    try:
        return register_user(db, user_in)
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred during registration"
        )

@router.post("/login", response_model=Token)
def login(request: Request, response: Response, user_in: UserLogin, db: Session = Depends(get_db)):
    try:
        user = authenticate_user(db, user_in)
        tokens = create_user_tokens(db, user.id)
        
        # Set cookies
        set_auth_cookies(response, request, tokens)
        
        return tokens
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred during login"
        )

@router.post("/refresh", response_model=Token)
def refresh(
    request: Request,
    response: Response,
    refresh_in: TokenRefreshRequest = None,
    db: Session = Depends(get_db)
):
    refresh_token = None
    if refresh_in:
        refresh_token = refresh_in.refresh_token
    if not refresh_token:
        refresh_token = request.cookies.get("refresh_token")
        
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing"
        )
        
    try:
        tokens = refresh_user_token(db, refresh_token)
        
        # Set cookies
        set_auth_cookies(response, request, tokens)
        
        return tokens
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred during token refresh"
        )

@router.post("/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")
    try:
        if refresh_token:
            revoke_refresh_token(db, refresh_token)
            
        delete_auth_cookies(response, request)
        
        return {"message": "Successfully logged out"}
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred during logout"
        )

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/guest", response_model=Token)
def login_as_guest(
    request: Request,
    response: Response,
    name: str = Query("Guest"),
    db: Session = Depends(get_db)
):
    try:
        user = create_guest_user(db, name)
        tokens = create_user_tokens(db, user.id)
        set_auth_cookies(response, request, tokens)
        return tokens
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred during guest login"
        )

@router.post("/convert", response_model=UserOut)
def convert_guest(
    convert_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "guest":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only guest accounts can be converted"
        )
    
    # Check if email is already taken
    existing_user = db.query(User).filter(User.email == convert_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    current_user.email = convert_in.email
    current_user.hashed_password = get_password_hash(convert_in.password)
    current_user.role = "user"
    
    try:
        db.commit()
        db.refresh(current_user)
        return current_user
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to convert guest account"
        )

