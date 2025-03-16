import json
import os
from fastapi import FastAPI
from google import genai
import textract
from dotenv import load_dotenv
from src.db.model import JobModel, ResumeUpdate, ResumeModel

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
    headline is only job tile of the person
    give all dates in yyyy-mm-dd format only, if end date is not present then it should be empty string
    for experience and project description separate points by new line character
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

async def get_ai_optimized_resume(resume_data: ResumeModel, is_main_resume: bool, job_id: str = None):
    json_model = ResumeUpdate.model_json_schema()
    json_model_string = json.dumps(json_model, indent=4)
    headline = resume_data.personalInfo.headline
    if not is_main_resume:
        job_data = await JobModel.find_one(JobModel.id == job_id)
        mode = "job description"
        headline_prompt = f'''
        give resume according to this job description:
        {job_data.description}
        '''
    else: 
        mode = "job role needed"
        headline_prompt = f'''
        give resume according to this headline:
        {headline}
        '''

    print(f"headline: {headline}")  
    prompt = f'''
    You are an AI bot designed to act as a professional for parsing resumes. You are given with resume and your job is to extract the following information from the resume:
    Generate a JSON-formatted professional profile for a software engineer. The profile should include the following sections:

    {json_model_string}

    (must follow the json schema do not change the schema)
    directly start from personalInfo json level
    give all dates in yyyy-mm-dd format only, if end date is not present then it should be empty string
    Ensure the generated JSON is formatted properly and includes realistic and professional content.
    dont add any thing from {mode} that person resume does not have example if job has html and resume does not have html then do not add html anywhere in the resume
    do not add any skill in points or descriptions that is not present in the resume (must follow rule)

    keep it professional and concise, change project and experience descriptions as per the {mode}, divide the points by new line character
    remove or add skills as per the {mode}, user can later edit the skills soo don't worry about it
    keep skills that are relevant to the {mode}, remove irrelevant skills

    Give the extracted information in json format only
    do not hallucinate the data keep it real

    The resume must be ats optimized, keep it concise and relevant to the {mode} provided.
    Tailor the resume to the {mode} by highlighting relevant skills and experience.
    Use specific keywords and phrases relevant to the job or industry to catch the attention of recruiters and hiring managers.
    make the resume is easy to scan and emphasize achievements and responsibilities.

    {headline_prompt}

    Resume:
    sent as json string


    '''
    resume_data_as_json = resume_data.model_dump()
    fields_to_remove = ["id", "updatedAt", "createdAt", "email"]
    for field in fields_to_remove:
        resume_data_as_json.pop(field)
    prompt += json.dumps(resume_data_as_json, indent=4)

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[prompt]
    )
    data = response.text.strip()
    remove_texts = ["```json","```"]
    for text in remove_texts:
        if text in data:
            data = data.replace(text, "")
    data_json = json.loads("".join(data))
    data_json = replace_nulls(data_json)
    return data_json
