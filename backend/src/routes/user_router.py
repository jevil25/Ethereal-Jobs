from datetime import datetime, timedelta
from fastapi import Request
from starlette.responses import JSONResponse
from dotenv import load_dotenv
import os

from src.email.email_sender import send_verification_email, send_password_reset_email
from src.db.model import ResumeModel, User, UserLogin, ResetPassword, UserUpdatePassword
from src.utils.jwttoken import create_access_token, create_refresh_token, verify_token
from src.utils.hashing import Hash
from fastapi import status, APIRouter
from src.db.mongo import DatabaseOperations
from src.decorators.auth import is_user_logged_in

db_ops = DatabaseOperations()
app = APIRouter(prefix="/user")
load_dotenv()

is_https = os.getenv("SERVER_ENV") == "production"

@app.post('/register')
async def create_user(request:User):
    user = await db_ops.get_user(request.email)
    if user:
        return JSONResponse(content={"message": "User already exists", "is_created": False, "is_exists": True}, status_code=status.HTTP_200_OK)
    hashed_pass = Hash.bcrypt(request.password)
    user_object = dict(request)
    user_object["password"] = hashed_pass if request.provider == "custom" else ""
    if request.provider != "google":
        user_object["is_verified"] = False
        token = Hash.generate_random_unique_string()
        send_verification_email(request.email, token, request.name)
        await db_ops.add_verification_token(request.email, token, (datetime.now() + timedelta(hours=24)).strftime("%Y-%m-%d %H:%M:%S"))
    else:   
        user_object["is_verified"] = True
        user_object["provider"] = "google"
    user_id = await db_ops.insert_user(user_object)
    return JSONResponse(content={"message": "User created successfully", "is_created": True, "is_exists": True, "user_id": str(user_id)}, status_code=status.HTTP_201_CREATED)

@app.post('/resend-verification/{email}')
async def resend_verification(email:str):
    user = await db_ops.get_user(email)
    if not user:
        return JSONResponse(content={"message": "User does not exist", "is_exists": False, "is_valid": False, "is_verified": False})
    if user.is_verified:
        return JSONResponse(content={"message": "Email already verified", "is_exists": True, "is_valid": True, "is_verified": True})
    await db_ops.revoke_verification_token(email)
    token = Hash.generate_random_unique_string()
    send_verification_email(email, token, user.name)
    await db_ops.add_verification_token(email, token, (datetime.now() + timedelta(hours=24)).strftime("%Y-%m-%d %H:%M:%S"))
    return JSONResponse(content={"message": "Verification email sent", "is_exists": True, "is_valid": True, "is_verified": False})

@app.post('/verify-email/{token}')
async def verify_email(token:str):
    result, expired, email = await db_ops.verify_user_token(token)
    if not result:
        return JSONResponse(content={"message": "Invalid token", "is_valid": False, "is_expired": False})
    if expired:
        return JSONResponse(content={"message": "Token expired", "is_valid": False, "is_expired": True, "email": email})
    return JSONResponse(content={"message": "Email verified", "is_valid": True, "is_expired": False})

@app.post('/login')
async def login(request:UserLogin):
    user = await db_ops.get_user(request.email)
    if not user:
        return JSONResponse(content={"message": "User does not exist", "is_exists": False, "is_valid": False, "is_verified": False})
    if user.provider == "custom" and not request.provider=="google" and not Hash.verify(user.password, request.password):
        return JSONResponse(content={"message": "Invalid credentials", "is_exists": True, "is_valid": False, "is_verified": False})
    if not user.is_verified:
        return JSONResponse(content={"message": "Email not verified", "is_exists": True, "is_valid": False, "is_verified": False})
    refresh_token, expire = create_refresh_token()
    access_token = create_access_token(data={"email": request.email})
    await db_ops.add_refresh_token(request.email, refresh_token, expire.strftime("%Y-%m-%d %H:%M:%S"))
    response = JSONResponse(content={"message": "Login successful", "is_exists": True, "is_valid": True, "is_verified": True, "is_onboarded": user.is_onboarded})
    response.set_cookie(key="access_token", value=access_token, httponly=is_https, secure=is_https, samesite='none')
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=is_https, secure=is_https, samesite='none')
    return response

@app.get('/me')
@is_user_logged_in
async def me(request: Request):
    user: User = request.state.user
    user_dict = user.__dict__
    fields_to_exclude = ["id", "password", "updatedAt", "createdAt"]
    for field in fields_to_exclude:
        user_dict.pop(field)
    return JSONResponse(
        content={"detail":"user logged in", "user": user_dict}, 
        status_code=status.HTTP_200_OK
    )

@app.post('/refresh')
async def refresh(request: Request):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        return JSONResponse(content={"message": "Refresh token not found"}, status_code=status.HTTP_404_NOT_FOUND)
    token = await db_ops.check_refresh_token(refresh_token)
    if not token:
        return JSONResponse(content={"message": "Invalid refresh token"}, status_code=status.HTTP_401_UNAUTHORIZED)
    token_data = verify_token(refresh_token)
    if token_data.is_expired:
        return JSONResponse(content={"message": "Token expired"}, status_code=status.HTTP_401_UNAUTHORIZED)
    access_token = create_access_token(data={"email": token.user_email})
    user = await db_ops.get_user(token.user_email)
    user_dict = user.__dict__
    fields_to_exclude = ["id", "password", "updatedAt", "createdAt"]
    for field in fields_to_exclude:
        user_dict.pop(field)
    response = JSONResponse(content={"message": "Token refreshed", "is_valid": True, "is_exists": True, "user": user_dict})
    response.set_cookie(key="access_token", value=access_token, httponly=False if is_https else True, secure=is_https)
    return response


@app.post('/logout')
def logout():
    response = JSONResponse(content={"message": "Logout successful"})
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token")
    return response

@app.post('/reset-password')
async def reset_password(request:ResetPassword):
    user = await db_ops.get_user(request.email)
    if not user:
        return JSONResponse(content={"message": "User does not exist", "is_exists": False, "is_valid": False})
    random_uuid = Hash.generate_random_unique_string()
    await db_ops.add_reset_password_token(request.email, random_uuid, (datetime.now() + timedelta(minutes=60)).strftime("%Y-%m-%d %H:%M:%S"))
    send_password_reset_email(request.email, random_uuid, user.name.split(" ")[0])
    return JSONResponse(content={"message": "Password reset link sent to your email", "is_exists": True, "is_valid": True})

@app.post('/reset-password/{token}/check')
async def reset_password_with_token(token:str):
    reset_token = await db_ops.check_reset_password_token(token)
    if not reset_token.is_valid:
        if reset_token.is_expired:
            return JSONResponse(content={"message": "Token expired", "is_valid": False, "is_expired": True})
        return JSONResponse(content={"message": "Invalid token", "is_valid": False, "is_expired": False})
    return JSONResponse(content={"message": "Valid token", "is_valid": True, "is_expired": False})

@app.post('/reset-password/{token}/update')
async def update_password(token:str, request:UserUpdatePassword):
    email = await db_ops.get_user_by_reset_password_token(token)
    if not email:
        return JSONResponse(content={"message": "Invalid token", "is_valid": False, "is_expired": False})
    hashed_pass = Hash.bcrypt(request.password)
    success = await db_ops.update_user_password(email, hashed_pass, token)
    if not success:
        return JSONResponse(content={"message": "Invalid token", "is_valid": False, "is_expired": False})
    return JSONResponse(content={"message": "Password updated successfully", "is_valid": True, "is_expired": False})
