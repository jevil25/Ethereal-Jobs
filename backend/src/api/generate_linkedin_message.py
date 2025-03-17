from datetime import datetime
import os
from typing import Dict, List
from src.db.model import Experience, ResumeModel
from src.logger import logger
# from transformers import pipeline, set_seed, AutoModelForCausalLM, AutoTokenizer
from google import genai
import dotenv

dotenv.load_dotenv()

client = genai.Client(api_key=os.getenv("GOOGLE_GEMINI_KEY"))

class EnhancedLinkedInMessageGenerator:
    def __init__(self):
        """Initialize the message generator with improved templates and resume handling"""   
        # device = "mps" if torch.backends.mps.is_available() else "cpu"
        # model = AutoModelForCausalLM.from_pretrained(
        #             'deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B', 
        #             cache_dir='cache'
        #         )
        # tokenizer = AutoTokenizer.from_pretrained(
        #     'deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B', 
        #     cache_dir='cache'
        # )

        # self.generator = pipeline(
        #     'text-generation',
        #     model=model,
        #     tokenizer=tokenizer,
        #     trust_remote_code=True,
        #     device=device
        # )     
        # set_seed(42)    
       # Enhanced templates with more natural language and better context integration
        self.prompt = """
        your are professional writer who is skilled in writing professional linkedin referral messages
    Write a short and professional LinkedIn referral message  that i can send to the employee working at [Company].
    The message should introduce me and highlight my key skills or experience. 
    Keep it concise and offer to provide more details if needed.
    Output only the message in plain text or markdown format, with no self-references. 
    Keep it concise and warm. No unnecessary fluff.
    Do not add any self reference like here is the message or I am referring.
    Do not say you are generating i only need the message.
    this should be in first person
    keep it short, dont halucinate, try to reason if any data is not right in place and avoid any unnecessary fluff
    keep it short like 2-3 lines
    ignore any sentence that is having [some variable] since those data is missing and should be ignored

    here is my resume:
    [Sender_Name] is a [YOE] professional currently working as a [Current_Work].
    They have experience in [Skills] and have recently developed [Current_Project].
    [Achievement_Context]

    I am ssking referral for [Target_Role] at [Company] to [Name].
"""

    def format_experience(self, experience: List[Experience]) -> str:
        """Calculate years of experience and format current role details"""
        if len(experience) == 0:
            return "recent graduate"
            
        current_role = experience[0]
        return f"{current_role.title} at {current_role.company}"

    def get_key_skills(self, resume: Dict, limit: int = 3) -> str:
        """Extract and format key skills from resume"""
        if not resume.get('skills') or not resume['skills'].get('featuredSkills'):
            return "software development"
            
        skills = [skill['skill'] for skill in resume['skills']['featuredSkills'][:limit] 
                 if isinstance(skill, dict) and 'skill' in skill]
        return ", ".join(skills)

    def get_achievement_context(self, resume: Dict) -> str:
        """Generate achievement context from projects or work experience"""
        context = []
        
        if resume.get('projects'):
            latest_project = resume['projects'][0]
            context.append(f"I recently developed {latest_project['project']}, {latest_project['descriptions'][0].lower()}")
            
        if resume.get('educations'):
            education = resume['educations'][0]
            if education.get('gpa'):
                context.append(f"I graduated with a {education['degree']} with a GPA of {education['gpa']}")
                
        return " ".join(context)

    def generate_message(self, params: Dict, company: str, position: str) -> str:
        """Generate a personalized message using resume data"""
        resume = params['resume']
        recipient = params.get('recipient', {})
        
        try:
            # Prepare context variables
            current_experience = self.format_experience(resume)
            key_skills = self.get_key_skills(resume)
            achievement_context = self.get_achievement_context(resume)
            
            # Fill template with dynamic content
            message_context = {
                '[Name]': resume.get('name', '{{LinkedIn User}}'),
                '[Company]': company,
                '[Target_Role]': position,
                '[YOE]': current_experience,
                '[Skills]': key_skills,
                '[Current_Work]': current_experience,
                '[Achievement_Context]': achievement_context,
                '[Current_Project]': resume.get('projects', [{'project': 'various development projects'}])[0]['project'],
                '[Sender_Name]': resume["profile"]["name"],
            }
            
            base_message = self.prompt
            
            for key, value in message_context.items():
                base_message = base_message.replace(key, value)

            model_input = [
                {
                    "role": "user",
                    "content": base_message
                }
            ]
            
            # Generate enhanced message
            generated = self.generator(
                model_input,
                min_length=1000,
                max_length=5000,
            )

            logger.info(f"Generated message: {generated}")

            generated = generated[0]['generated_text']
            
            # Clean and format the final message
            final_message = generated.strip()
            if not any(ending in final_message.lower() for ending in ['thank', 'regards', 'best']):
                final_message += f"\n\nBest regards,\n{resume.get('name', '')}"
            
            return final_message
            
        except Exception as e:
            print(f"Error generating message: {str(e)}")
            return base_message
        
    def format_years_of_experience(self, experience: List[Experience]) -> str:
        """Calculate years of experience"""
        if len(experience) == 0:
            return "0 years"
            
        current_role = experience[0]
        start_date = current_role.startDate
        end_date = experience[-1].endDate
        start_date = int(start_date.split("-")[0])
        if end_date != "":
            end_date = int(end_date.split("-")[0])
        else:
            end_date = datetime.now().year

        if end_date - start_date == 0:
            return "less than a year"
        return f"{end_date - start_date} years"
        
    def generate_message_using_gemini(self, params: ResumeModel, company: str, position: str, name: str) -> str:
        try:
            # Prepare context variables
            current_experience = self.format_experience(params.experience)
            key_skills = ",".join(params.skills)
            years_of_experience = self.format_years_of_experience(params.experience)
            # achievement_context = self.get_achievement_context(params.projects)
            
            # Fill template with dynamic content
            message_context = {
                '[Name]': '{{LinkedIn User}}',
                '[Company]': company,
                '[Target_Role]': position,
                '[YOE]': years_of_experience,
                '[Skills]': key_skills,
                '[Current_Work]': current_experience,
                # '[Achievement_Context]': achievement_context,
                # '[Current_Project]': resume.get('projects', [{'project': 'various development projects'}])[0]['project'],
                '[Sender_Name]': name,
            }
            base_message = self.prompt
            
            for key, value in message_context.items():
                base_message = base_message.replace(key, value)
            
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=base_message,
            )
            
            # Clean and format the final message
            final_message = response.text.strip()
            if not any(ending in final_message.lower() for ending in ['thank', 'regards', 'best']):
                final_message += f"\n\nBest regards,\n{name}"
            
            return {
                "message": final_message,
                "status": "success",
                "metadata": {
                    "template_used": False,
                    "skills_included": key_skills,
                    # "achievement_context_included": bool(self.get_achievement_context(params['resume']))
                }
            }
            
        except Exception as e:
            print(f"Error generating message: {str(e)}")
            return {
                "message": "Error generating message",
                "status": "error",
                "metadata": {
                    "template_used": False,
                    "skills_included": key_skills,
                    # "achievement_context_included": bool(self.get_achievement_context(params['resume']))
                }
            }

    def generate_message_response(self, params: Dict, company: str, position: str) -> Dict:
        """Generate a response suitable for an API"""
        return {
            "message": self.generate_message(params, company, position),
            "status": "success",
            "metadata": {
                "template_used": True,
                "skills_included": self.get_key_skills(params['resume']),
                "achievement_context_included": bool(self.get_achievement_context(params['resume']))
            }
        }
    
    def generate_variants(self, params: Dict, num_variants: int = 3) -> List[str]:
        """Generate multiple message variants"""
        return [self.generate_message_response(**params) for _ in range(num_variants)]
    
def generate_message_api_response(params: ResumeModel, company: str, position: str, name: str) -> Dict:
    """Generate a message response suitable for an API"""
    generator = EnhancedLinkedInMessageGenerator()
    return generator.generate_message_using_gemini(params, company, position, name)
