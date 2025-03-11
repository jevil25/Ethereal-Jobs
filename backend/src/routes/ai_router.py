import os
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from typing import Dict, Optional
from src.decorators.auth import is_user_logged_in
from src.db.model import User
from src.db.mongo import DatabaseOperations
from src.logger import logger
from src.api.generate_linkedin_message import generate_message_api_response
import requests
import urllib.parse
from fastapi import UploadFile, File
from src.api.extract_resume import convert_to_plain_text, ats_extractor

app = APIRouter()
db_ops = DatabaseOperations()


@app.get("/generate/linkedin/message/{email}")
@is_user_logged_in
async def generate_linkedin_message(request: Request, email: str, company: str, position: str, newMessage:bool) -> Dict:
    user: User = request.state.user 
    # Get resume
    resume = await db_ops.get_user_resume(email)
    if not resume:
        return JSONResponse(
            content={"message": "Resume not found", "no_resume_found": True},
            media_type="application/json",
            status_code=200
        )

    # Check for existing message
    linkedin_message = await db_ops.get_linked_messages(email, company, position)
    linkedin_message = linkedin_message.model_dump() if linkedin_message else None
    fields_to_remove = ["id", "updatedAt", "createdAt"]
    for field in fields_to_remove:
        if linkedin_message:
            linkedin_message.pop(field)

    if not linkedin_message or newMessage:
        message_dict = generate_message_api_response(resume, company, position, name=user.name)
        linkedin_message = await db_ops.update_linked_message(email, company, position, message_dict["message"])
        linkedin_message = message_dict
        # Clean up response
        if "id" in linkedin_message:
            linkedin_message.pop("id", None)
        if "status" in linkedin_message:
            linkedin_message.pop("metadata", None)
        if "metadata" in linkedin_message:
            linkedin_message.pop("metadata", None)
    return JSONResponse(content=linkedin_message, media_type="application/json")

@app.post("/extract/resume")
async def extract_resume(file: UploadFile = File(...)):
    try:
        file_path = file.filename
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)

        is_pdf = file_path.lower().endswith(".pdf")
        text = convert_to_plain_text(file_path) if not is_pdf else ""
        result = ats_extractor(file_path, text, is_pdf)

        os.remove(file_path)
        return {"extracted_data": result}
    except Exception as e:
        return {"error": str(e)}

@app.get("/search/suggestions/job_title")
def get_search_suggestions(query: str) -> Dict:
    autocomplete_url = "https://autocomplete.indeed.com/api/v0/suggestions/what"
    params = {
        "country": "IN",
        "language": "en",
        "count": 10,
        "formatted": 0,
        "query": query,
        "useEachWord": False,
        "seqId": 1,
        "page": "serp",
        "accountKey": "",
        "showAlternateSuggestions": True,
        "rich": True,
    }
    suggestions = requests.get(autocomplete_url, params=params).json()
    response = {
        "suggestions": suggestions,
    }
    return JSONResponse(content=response, media_type="application/json")

@app.get("/search/suggestions/location")
def get_search_suggestions(query: str, country: Optional[str]) -> Dict:
    autocomplete_url = "https://autocomplete.indeed.com/api/v0/suggestions/location/"
    if not country or country == "":
        country = "IN"
    params = {
        "country": country,
        "language": "en",
        "count": 10,
        "formatted": 0,
        "query": query,
        "useEachWord": False,
        "seqId": 1,
        "page": "serp",
        "accountKey": "",
        "showAlternateSuggestions": True,
        "rich": True,
    }
    logger.info(f"Getting location suggestions for {autocomplete_url}?{urllib.parse.urlencode(params)}")
    suggestions = requests.get(autocomplete_url, params=params).json()
    response = {
        "suggestions": suggestions,
    }
    return JSONResponse(content=response, media_type="application/json")
