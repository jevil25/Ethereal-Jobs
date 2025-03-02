from fastapi import Request
from starlette.responses import JSONResponse
from dotenv import load_dotenv
import os

from src.db.model import User, UserLogin
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
def create_user(request:User):
    user = db_ops.get_user(request.email)
    if user:
        return JSONResponse(content={"message": "User already exists", "is_created": False, "is_exists": True}, status_code=status.HTTP_200_OK)
    hashed_pass = Hash.bcrypt(request.password)
    user_object = dict(request)
    user_object["password"] = hashed_pass
    user_id = db_ops.insert_user(user_object)
    return JSONResponse(content={"message": "User created successfully", "is_created": True, "is_exists": True, "user_id": str(user_id)}, status_code=status.HTTP_201_CREATED)

@app.post('/login')
def login(request:UserLogin):
    user = db_ops.get_user(request.email)
    if not user:
        return JSONResponse(content={"message": "User does not exist", "is_exists": False, "is_valid": False}, status_code=status.HTTP_404_NOT_FOUND)
    if not Hash.verify(user.password, request.password):
        return JSONResponse(content={"message": "Invalid credentials", "is_exists": True, "is_valid": False}, status_code=status.HTTP_401_UNAUTHORIZED)
    access_token = create_access_token(data={"email": request.email})
    refresh_token = create_refresh_token()
    db_ops.add_refresh_token(request.email, refresh_token)
    response = JSONResponse(content={"message": "Login successful", "is_exists": True, "is_valid": True})
    response.set_cookie(key="access_token", value=access_token, httponly=False if is_https else True, secure=is_https)
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=False if is_https else True, secure=is_https)
    return response

@app.get('/me')
@is_user_logged_in
async def me(request: Request):
    user: User = request.state.user
    if not user:
        return JSONResponse(
            content={"message": "User not found"}, 
            status_code=status.HTTP_404_NOT_FOUND
        )
    return JSONResponse(
        content=user.model_dump(), 
        status_code=status.HTTP_200_OK
    )

@app.post('/refresh')
def refresh(request: Request):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        return JSONResponse(content={"message": "Refresh token not found"}, status_code=status.HTTP_404_NOT_FOUND)
    token = db_ops.check_refresh_token(refresh_token)
    if not token:
        return JSONResponse(content={"message": "Invalid refresh token"}, status_code=status.HTTP_401_UNAUTHORIZED)
    token_data = verify_token(refresh_token)
    if token_data.is_expired:
        return JSONResponse(content={"message": "Token expired"}, status_code=status.HTTP_401_UNAUTHORIZED)
    access_token = create_access_token(data={"email": token.user_email})
    response = JSONResponse(content={"message": "Token refreshed"})
    response.set_cookie(key="access_token", value=access_token, httponly=False if is_https else True, secure=is_https)
    return response


@app.post('/logout')
def logout():
    response = JSONResponse(content={"message": "Logout successful"})
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token")
    return response
