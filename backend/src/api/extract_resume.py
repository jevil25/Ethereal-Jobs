import json
import os
from fastapi import FastAPI
from google import genai
import textract
from dotenv import load_dotenv
from src.db.model import ResumeUpdate

load_dotenv()

client = genai.Client(api_key=os.getenv("GOOGLE_GEMINI_KEY"))

app = FastAPI()


def convert_to_plain_text(file_path):
    try:
        text = textract.process(file_path).decode("utf-8")
        return text
    except Exception as e:
        return f"Error: {e}"

def replace_nulls(data):
    if isinstance(data, dict):
        return {key: replace_nulls(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [replace_nulls(item) for item in data]
    elif data is None:
        return ""
    else:
        return data


def ats_extractor(resume_data, text, is_pdf=False):
    json_model = ResumeUpdate.model_json_schema()
    json_model_string = json.dumps(json_model, indent=4)
    prompt = f'''
    You are an AI bot designed to act as a professional for parsing resumes. You are given with resume and your job is to extract the following information from the resume:
    Generate a JSON-formatted professional profile for a software engineer. The profile should include the following sections:

    {json_model_string}

    directly start from personalInfo json level
    give all dates in yyyy-mm-dd format only, if end date is not present then it should be empty string
    Ensure the generated JSON is formatted properly and includes realistic and professional content.

    Give the extracted information in json format only

    Resume:
    sent as a file or plain text
    '''
    if is_pdf:
        my_files = client.files.upload(file=resume_data)
        contents = [prompt, my_files]
    else:
        contents = [prompt, text]
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=contents
    )
    data = response.text.strip()
    remove_texts = ["```json","```"]
    for text in remove_texts:
        if text in data:
            data = data.replace(text, "")
    data_json = json.loads("".join(data))
    data_json = replace_nulls(data_json)
    return data_json
