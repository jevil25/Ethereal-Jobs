from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.routes.user_router import app as user_router
from src.routes.jobs_router import app as jobs_router
from src.routes.resume_router import app as resume_router
from src.routes.ai_router import app as ai_router

# Initialize FastAPI app
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Hello": "World"}

app.include_router(user_router)
app.include_router(jobs_router)
app.include_router(resume_router)
app.include_router(ai_router)
