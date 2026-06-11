from datetime import datetime, timedelta
from fastapi import HTTPException, status
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token
from app.db_models.user import User, RefreshToken
from app.schemas.auth import UserCreate, UserLogin, Token

def register_user(db: Session, user_in: UserCreate) -> User:
    print("Password:", user_in.password)
    print("Length:", len(user_in.password))
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    db_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, user_in: UserLogin) -> User:
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return user

def create_user_tokens(db: Session, user_id: int) -> Token:
    access_token = create_access_token(subject=user_id)
    refresh_token_str = create_refresh_token(subject=user_id)
    
    expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    db_refresh_token = RefreshToken(
        token=refresh_token_str,
        user_id=user_id,
        expires_at=expires_at
    )
    db.add(db_refresh_token)
    db.commit()
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token_str
    )

def refresh_user_token(db: Session, refresh_token: str) -> Token:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate refresh token"
    )
    
    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")
        if user_id is None or token_type != "refresh":
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    db_token = db.query(RefreshToken).filter(
        RefreshToken.token == refresh_token,
        RefreshToken.is_revoked == False
    ).first()
    
    if not db_token or db_token.expires_at < datetime.utcnow():
        if db_token:
            db_token.is_revoked = True
            db.commit()
        raise credentials_exception
        
    user_id_int = int(user_id)
    new_access_token = create_access_token(subject=user_id_int)
    new_refresh_token_str = create_refresh_token(subject=user_id_int)
    
    db_token.is_revoked = True
    
    new_expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    db_new_refresh_token = RefreshToken(
        token=new_refresh_token_str,
        user_id=user_id_int,
        expires_at=new_expires_at
    )
    db.add(db_new_refresh_token)
    db.commit()
    
    return Token(
        access_token=new_access_token,
        refresh_token=new_refresh_token_str
    )

def revoke_refresh_token(db: Session, refresh_token: str) -> bool:
    db_token = db.query(RefreshToken).filter(RefreshToken.token == refresh_token).first()
    if db_token:
        db_token.is_revoked = True
        db.commit()
        return True
    return False
