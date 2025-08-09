from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.db.mongo import DatabaseOperations
from src.routes.user_router import app as user_router
from src.routes.jobs_router import app as jobs_router
from src.routes.resume_router import app as resume_router
from src.routes.ai_router import app as ai_router
from src.routes.admin_router import app as admin_router
from dotenv import load_dotenv
import os
from src.email.scheduler import setup_scheduler

load_dotenv()
frontend_url = os.getenv("FRONTEND_URL")

# Initialize FastAPI app
app = FastAPI()

setup_scheduler(app)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """
    Async startup event to initialize database
    This runs when the FastAPI application starts
    """
    await DatabaseOperations().init_database()

@app.get("/")
def read_root():
    return {"Hello": "World"}

app.include_router(user_router)
app.include_router(jobs_router)
app.include_router(resume_router)
app.include_router(ai_router)
app.include_router(admin_router)
