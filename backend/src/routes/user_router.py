from fastapi import HTTPException
from starlette.responses import JSONResponse

from src.db.model import User
from src.utils.jwttoken import create_access_token, create_refresh_token
from src.utils.hashing import Hash
from fastapi import Depends
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import status, APIRouter
from src.db.mongo import DatabaseOperations

db_ops = DatabaseOperations()
app = APIRouter()

@app.post('/register')
def create_user(request:User):
    user = db_ops.get_user(request.username)
    if user:
        raise HTTPException(status_code=400,detail = f'User with {request.username} already exists')
    hashed_pass = Hash.bcrypt(request.password)
    user_object = dict(request)
    user_object["password"] = hashed_pass
    user_id = db_ops.insert_user(user_object)
    return JSONResponse(content={"id":str(user_id)},media_type="application/json")

@app.post('/login')
def login(request:OAuth2PasswordRequestForm = Depends()):
    user = db_ops.get_user(request.username)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail = f'No user found with this {request.username} username')
    if not Hash.verify(user["password"],request.password):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail = f'Wrong Username or password')
    access_token = create_access_token(data={"sub": user["username"] })
    refresh_token = create_refresh_token()
    db_ops.add_refresh_token(user["_id"],refresh_token)
    response = JSONResponse(content={"message": "Login successful"})
    response.set_cookie(key="access_token", value=access_token, httponly=True)
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True)
    return response

@app.post('/logout')
def logout():
    response = JSONResponse(content={"message": "Logout successful"})
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token")
    return response