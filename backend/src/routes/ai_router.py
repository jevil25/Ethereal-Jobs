from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from bson import ObjectId
from typing import Dict, Optional
from src.db.model import LinkedMessages
from src.db.mongo import DatabaseOperations
from src.logger import logger
from src.api.generate_linkedin_message import generate_message_api_response
import requests
import urllib.parse

app = APIRouter()
db_ops = DatabaseOperations()


@app.get("/generate/linkedin/message/{email}")
async def generate_linkedin_message(email: str, company: str, position: str, newMessage:bool) -> Dict:    
    # Get resume
    resume = await db_ops.get_resume(email)
    if not resume:
        return JSONResponse(
            content={"message": "Resume not found", "no_resume_found": True},
            media_type="application/json",
            status_code=200
        )

    # Check for existing message
    linkedin_message = await db_ops.get_linked_messages(email, company, position)

    if not linkedin_message or newMessage:
        message_dict = generate_message_api_response(resume, company, position)
        linkedin_message = await db_ops.update_linked_message(email, company, position, message_dict["message"])
        linkedin_message = message_dict

    # Clean up response
    linkedin_message.pop("_id", None)
    linkedin_message.pop("metadata", None)
    linkedin_message.pop("status", None)

    return JSONResponse(content=linkedin_message, media_type="application/json")

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
