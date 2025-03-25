import enum
import os
import smtplib
import string
import uuid
import idna
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formatdate
from dotenv import load_dotenv
from pydantic import BaseModel
import resend

load_dotenv()

class EmailTemplates(enum.Enum):
    PASSWORD_RESET = "reset-password.html"
    EMAIL_VERIFICATION = "email-verification.html"

class ResetPasswordEmail(BaseModel):
    reset_link: str
    name: str
    subject: str = "Ethereal Jobs - Reset Password"

class EmailVerificationEmail(BaseModel):
    verification_link: str
    name: str
    subject: str = "Ethereal Jobs - Email Verification"
    

class EmailService(BaseModel):
    template_name: EmailTemplates
    template_data: ResetPasswordEmail | EmailVerificationEmail
    recipient: str

class EmailConfig:
    smtp_server: str
    smtp_port: int
    smtp_username: str
    smtp_password: str
    from_email: str
    display_name: str = "Ethereal Jobs"


    def __init__(self) -> None:
        self.smtp_server = os.getenv("SMTP_SERVER")
        self.smtp_port = os.getenv("SMTP_PORT")
        self.smtp_username = os.getenv("SMTP_USERNAME")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.from_email = os.getenv("FROM_EMAIL")


class EmailSender:
    def __init__(
        self,
    ) -> None:
        self.config = EmailConfig()

    def get_templates(
        self,
        template_name: str,
    ) -> string.Template:
        template_path: str = os.path.join(
            os.path.dirname(__file__),
            "templates",
            template_name,
        )
        with open(template_path, "r", encoding="utf-8") as file:
            return string.Template(file.read())

    def send_email(
        self,
        email_service: EmailService,
    ) -> bool:
        sender_email = self.config.from_email

        msg = MIMEMultipart()
        local_part, domain_part = sender_email.split("@")
        encoded_domain = idna.encode(domain_part).decode("utf-8")
        encoded_sender_email = f"{local_part}@{encoded_domain}"

        msg["From"] = f"{self.config.display_name} <{encoded_sender_email}>"
        msg["To"] = email_service.recipient
        msg["Subject"] = email_service.template_data.subject
        msg["Date"] = formatdate(localtime=True)

        html_body = self.get_templates(email_service.template_name.value).substitute(
            **email_service.template_data.__dict__
        )

        msg.attach(MIMEText(html_body, "html", "utf-8"))

        try:
            with smtplib.SMTP(
                self.config.smtp_server,
                self.config.smtp_port,
            ) as server:
                server.starttls()
                server.login(
                    self.config.smtp_username,
                    self.config.smtp_password,
                )
                server.sendmail(
                    self.config.smtp_username,
                    email_service.recipient,
                    msg.as_string(),
                )
            return True
        except Exception as e:
            print(
                "SMTP issue, couldn't send email to %s. Error: %s",
                email_service.recipient,
                str(e),
            )
            return False
        
    def send_email_resend(
        self,
        email_service: EmailService,
    ) -> bool:
        local_part, domain_part = os.getenv('RESEND_EMAIL').split("@")
        encoded_domain = idna.encode(domain_part).decode("utf-8")
        encoded_sender_email = f"{local_part}@{encoded_domain}"
        html_body = self.get_templates(email_service.template_name.value).substitute(
            **email_service.template_data.__dict__
        )

        text = ""
        template_path: str = os.path.join(
            os.path.dirname(__file__),
            "templates",
            email_service.template_name.value.split(".")[0]+".txt",
        )
        with open(template_path, "r") as file:
            text = file.read()
        
        text = string.Template(text).substitute(
            **email_service.template_data.__dict__
        )

        try:
            resend.api_key = os.getenv("RESEND_API_KEY")
            resend.Emails.send({
                "from": f"{self.config.display_name} <{encoded_sender_email}>",
                "to": email_service.recipient,
                "subject": email_service.template_data.subject,
                "html": html_body,
                "text": text,
                "headers": {
                    'X-Entity-Ref-ID': uuid.uuid4().hex,
                }
            })
            return True
        except Exception as e:
            print(
                "SMTP issue, couldn't send email to %s. Error: %s",
                email_service.recipient,
                str(e),
            )
            return False
    
def send_verification_email(email:str, token: str, name: str):
    frontend_url = os.getenv("FRONTEND_URL")
    verification_link = f"{frontend_url}/verify-email?token={token}"
    email_service = EmailService(
        recipient=email,
        template_name=EmailTemplates.EMAIL_VERIFICATION,
        template_data=EmailVerificationEmail(verification_link=verification_link, name=name)
    )
    email_sender = EmailSender()
    email_sender.send_email_resend(email_service)

def send_password_reset_email(email:str, token: str, name: str):
    frontend_url = os.getenv("FRONTEND_URL")
    reset_link = f"{frontend_url}/reset-password?token={token}"
    email_service = EmailService(
        recipient=email,
        template_name=EmailTemplates.PASSWORD_RESET,
        template_data=ResetPasswordEmail(reset_link=reset_link, name=name)
    )
    email_sender = EmailSender()
    email_sender.send_email_resend(email_service)
