import os
from fastapi import FastAPI, UploadFile, File
from google import genai
import textract
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GOOGLE_GEMINI_KEY"))

app = FastAPI()


def convert_to_plain_text(file_path):
    try:
        text = textract.process(file_path).decode("utf-8")
        return text
    except Exception as e:
        return f"Error: {e}"


def ats_extractor(resume_data, text, is_pdf=False):
    prompt = '''
    You are an AI bot designed to act as a professional for parsing resumes. You are given with resume and your job is to extract the following information from the resume:
    1. full name
    2. email id
    3. github portfolio (will be like github.com/username)
    4. linkedin url (will be like linkedin.com/username)
    5. employment details
    6. technical skills
    7. soft skills
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
    return data
