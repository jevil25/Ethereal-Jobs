from typing import List, Optional
from datetime import datetime

from src.db.model import (
    JobQuery, 
    JobModel, 
    LinkedInProfile,
    ResumeUpdate, 
    User, 
    RefreshToken, 
    ResetPasswordToken, 
    CheckToken,
    CompanyLinkedInProfiles,
    VerificationToken,
    LinkedMessages,
    ResumeModel,
    AiOptimzedResumeModel,
    UserLinkedInProfiles,
    JobUser,
    ApplicationStatus,
    UsageStats,
    Features,
    Feedback
)

from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

class DatabaseOperations:
    """Handle all async database operations using Beanie."""

    async def init_database(self):
        """
        Initialize the MongoDB database connection with Beanie.
        
        This function should be called once at the start of your application.
        """
        # Load environment variables if not already loaded
        load_dotenv()

        # Get the connection string from environment variables
        CONNECTION_STRING = os.getenv("MONGO_CONNECTION_STRING")
        if not CONNECTION_STRING:
            raise ValueError("MONGO_CONNECTION_STRING is not set in environment variables")

        # Create an async motor client
        client = AsyncIOMotorClient(CONNECTION_STRING)

        # Specify the database name
        database_name = os.getenv("MONGO_DATABASE", "jobify-testing")

        # Initialize Beanie with all your document models
        await init_beanie(
            database=client[database_name], 
            document_models=[
                JobModel, 
                CompanyLinkedInProfiles, 
                User, 
                RefreshToken, 
                ResetPasswordToken,
                VerificationToken,
                LinkedMessages,
                ResumeModel,
                AiOptimzedResumeModel,
                UserLinkedInProfiles,
                JobUser,
                UsageStats,
                Feedback
            ]
        )

    async def get_jobs_from_db(self, query_params: JobQuery, date_posted: str) -> List[JobModel]:
        """
        Retrieve jobs from database based on query parameters.
        
        Args:
            query_params (JobQuery): Query parameters for job search
            date_posted (str): Minimum date for job posting
        
        Returns:
            List[JobModel]: List of jobs matching the criteria
        """
        return await JobModel.find(
            JobModel.query.city == query_params.city,
            JobModel.query.country_code == query_params.country_code,
            JobModel.query.country == query_params.country,
            JobModel.query.job_title == query_params.job_title,
            JobModel.query.job_type == query_params.job_type,
            JobModel.query.is_remote == query_params.is_remote,
            JobModel.query.distance <= query_params.distance,
            JobModel.date_posted >= date_posted,
            sort=[("date_posted", -1)]
        ).to_list()

    async def update_jobs(self, jobs: List[JobModel], query_params: JobQuery):
        """
        Update jobs in database with query parameters.
        
        Args:
            jobs (List[JobModel]): List of jobs to update
            query_params (JobQuery): Query parameters to associate with jobs
        """
        for job in jobs:
            job.query = query_params
            await job.save()

    async def get_linkedin_profiles(self, job: JobModel, userEmail: str) -> Optional[List[LinkedInProfile]]:
        """
        Get LinkedIn profiles for a company and location.
        
        Args:
            company (str): Company name
            location (str): Job location
            title (str): Job title
        
        Returns:
            Optional[List[LinkedInProfile]]: List of LinkedIn profiles or None
        """
        profiles_doc = await UserLinkedInProfiles.find_one(
            UserLinkedInProfiles.email == userEmail,
            UserLinkedInProfiles.jobId == job.id
        )
        if not profiles_doc:
            profiles_doc = await CompanyLinkedInProfiles.find_one(
                CompanyLinkedInProfiles.jobId == job.id
            )

        return profiles_doc.profiles if profiles_doc else None

    async def update_linkedin_profiles(self, job: JobModel, profiles: List[LinkedInProfile], userEmail: str):
        """
        Update LinkedIn profiles in database.
        
        Args:
            company (str): Company name
            location (str): Job location
            title (str): Job title
            profiles (List[LinkedInProfile]): List of LinkedIn profiles to update
        """
        company_linked_profiles = await CompanyLinkedInProfiles.find_one(
            CompanyLinkedInProfiles.jobId == job.id
        )
        if company_linked_profiles:
            company_linked_profiles.profiles = profiles
            await company_linked_profiles.save()
        else:
            await CompanyLinkedInProfiles.insert(
                CompanyLinkedInProfiles(
                    jobId=job.id,
                    profiles=profiles
                )
            )
        user_linked_profiles = await UserLinkedInProfiles.find_one(
            UserLinkedInProfiles.email == userEmail,
            UserLinkedInProfiles.jobId == job.id
        )
        if user_linked_profiles:
            user_linked_profiles.profiles = profiles
            await user_linked_profiles.save()
        else:
            await UserLinkedInProfiles.insert(
                UserLinkedInProfiles(
                    email=userEmail,
                    jobId=job.id,
                    profiles=profiles
                )
            )

    async def insert_user(self, user: dict):
        """
        Insert a new user into the database.
        
        Args:
            user (dict): User data to insert
        
        Returns:
            User: Inserted user document
        """
        new_user = User(**user)
        await new_user.save()
        return new_user
    
    async def get_user(self, email: str):
        """
        Get a user from the database.
        
        Args:
            email (str): User email
        
        Returns:
            Optional[User]: User document or None
        """
        return await User.find_one({"email": email})
    
    async def add_verification_token(self, email: str, token: str, expire: str):
        """
        Add a verification token to the database.
        
        Args:
            email (str): User email
            token (str): Verification token
            expire (str): Token expiration time
        
        Returns:
            str: Inserted token ID
        """
        verification_token = VerificationToken(
            email=email,
            token=token,
            expire=datetime.strptime(expire, "%Y-%m-%d %H:%M:%S"),
            revoked=False
        )
        await verification_token.save()
        return str(verification_token.id)
    
    async def get_user_by_verification_token(self, token: str):
        """
        Get user email by verification token.
        
        Args:
            token (str): Verification token
        
        Returns:
            Optional[str]: User email or None
        """
        verification_token = await VerificationToken.find_one({"token": token, "revoked": False})
        return verification_token.email if verification_token else None
    
    async def revoke_verification_token(self, token: str):
        """
        Revoke a verification token.
        
        Args:
            token (str): Verification token to revoke
        
        Returns:
            VerificationToken: Updated verification token
        """
        verification_token = await VerificationToken.find_one({"token": token})
        if verification_token:
            verification_token.revoked = True
            await verification_token.save()
        return verification_token
    
    async def check_if_token_expired(self, token: str):
        """
        Check if a verification token has expired.
        
        Args:
            token (str): Verification token
        
        Returns:
            bool: Whether the token has expired
        """
        verification_token = await VerificationToken.find_one({"token": token})
        return verification_token.expire < datetime.utcnow() if verification_token else True
    
    async def verify_user_token(self, token: str):
        """
        Verify a user's email in the database.
        
        Args:
            email (str): User email
        
        Returns:
            bool: Whether email verification was successful
        """
        user_email = await self.get_user_by_verification_token(token)
        if not user_email:
            return False, False, ""
        expired = await self.check_if_token_expired(token)
        if expired:
            return True, True, user_email
        user = await self.get_user(user_email)
        user.is_verified = True
        await user.save()
        await self.revoke_verification_token(token)
        return True, False, ""
    
    async def add_refresh_token(self, user_email: str, refresh_token: str, expire: str):
        """
        Add a refresh token to the database.
        
        Args:
            user_email (str): User email
            refresh_token (str): Refresh token
            expire (str): Token expiration time
        
        Returns:
            str: Inserted refresh token ID
        """
        new_refresh_token = RefreshToken(
            user_email=user_email,
            refresh_token=refresh_token,
            revoked=False,
            expire=datetime.strptime(expire, "%Y-%m-%d %H:%M:%S")
        )
        await new_refresh_token.save()
        return str(new_refresh_token.id)
    
    async def check_refresh_token(self, refresh_token: str):
        """
        Check if a refresh token exists and is valid.
        
        Args:
            refresh_token (str): Refresh token to check
        
        Returns:
            Optional[RefreshToken]: Valid refresh token or None
        """
        token = await RefreshToken.find_one(
            RefreshToken.refresh_token == refresh_token,
            RefreshToken.revoked == False,
            RefreshToken.expire > datetime.utcnow()
        )
        return token
    
    async def revoke_refresh_token(self, refresh_token: str):
        """
        Revoke a refresh token.
        
        Args:
            refresh_token (str): Refresh token to revoke
        
        Returns:
            RefreshToken: Updated refresh token
        """
        token = await RefreshToken.find_one({"refresh_token": refresh_token})
        if token:
            token.revoked = True
            await token.save()
        return token
    
    async def add_reset_password_token(self, email: str, token: str, expire: str):
        """
        Add a reset password token to the database.
        
        Args:
            email (str): User email
            token (str): Reset password token
            expire (str): Token expiration time
        
        Returns:
            str: Inserted reset password token ID
        """
        reset_token = ResetPasswordToken(
            email=email,
            token=token,
            expire=datetime.strptime(expire, "%Y-%m-%d %H:%M:%S"),
            revoked=False
        )
        await reset_token.save()
        return str(reset_token.id)
    
    async def check_reset_password_token(self, token: str):
        """
        Check if a reset password token is valid.
        
        Args:
            token (str): Reset password token
        
        Returns:
            CheckToken: Token validation information
        """
        reset_token = await ResetPasswordToken.find_one(
            {
                "token": token,
                "revoked": False
            }
        )
        
        if not reset_token:
            return CheckToken(is_valid=False, is_expired=False)
        
        if reset_token.expire < datetime.utcnow():
            return CheckToken(is_valid=False, is_expired=True)
        
        return CheckToken(is_valid=True, is_expired=False)
    
    async def get_user_by_reset_password_token(self, token: str):
        """
        Get user email by reset password token.
        
        Args:
            token (str): Reset password token
        
        Returns:
            Optional[str]: User email or None
        """
        reset_token = await ResetPasswordToken.find_one({"token": token})
        return reset_token.email if reset_token else None
    
    async def revoke_reset_password_token(self, token: str):
        """
        Revoke a reset password token.
        
        Args:
            token (str): Reset password token to revoke
        
        Returns:
            ResetPasswordToken: Updated reset password token
        """
        reset_token = await ResetPasswordToken.find_one({"token": token})
        if reset_token:
            reset_token.revoked = True
            await reset_token.save()
        return reset_token
    
    async def update_user_password(self, email: str, password: str, token: str):
        """
        Update a user's password in the database.
        
        Args:
            email (str): User email
            password (str): New password
            token (str): Reset password token
        
        Returns:
            bool: Whether password update was successful
        """
        # Check token validity
        token_data = await self.check_reset_password_token(token)
        if not token_data.is_valid:
            return False
        
        # Update user password
        user = await User.find_one({"email": email})
        if user:
            user.password = password
            await user.save()
        
        # Revoke the reset password token
        await self.revoke_reset_password_token(token)
        
        return True
    
    async def get_job(self, job_id: str):
        """
        Get a job from the database.
        
        Args:
            job_id (str): Job ID
        
        Returns:
            Optional[JobModel]: Job document or None
        """
        return await JobModel.find_one({"_id": job_id})
    
    async def check_if_user_has_linked_profiles_for_a_job(self, job: JobModel, email: str):
        """
        Check if a user has linkedin profiles for a job.
        
        Args:
            email (str): User email
            job_id (str): Job ID
        
        Returns:
            bool: Whether user has linkedin profiles for the job
        """
        result = await UserLinkedInProfiles.find_one({
            "email": email,
            "jobId": job.id
        })
        return result is not None
    
    async def get_linked_messages(self, email: str, company: str, position: str):
        """
        Get linkedin messages from the database.
        
        Args:
            resume_id (str): Resume ID
            company (str): Company name
            position (str): Job position
        
        Returns:
            Optional[LinkedMessages]: LinkedIn message document or None
        """
        return await LinkedMessages.find_one({
            "email": email,
            "company": company,
            "position": position
        })
    
    async def save_linked_message(self, email: str, company: str, position: str, message: dict):
        """
        Save a linkedin message to the database.
        """
        new_message = LinkedMessages(email=email, company=company, position=position, message=message)
        await new_message.save()
        return str(new_message.id)
    
    async def update_linked_message(self, email: str, company: str, position: str, message: dict):
        """
        Update a linkedin message in the database.
        """
        message_doc = await LinkedMessages.find_one({
            "email": email,
            "company": company,
            "position": position
        })
        if message_doc:
            message_doc.message = message
            await message_doc.save()
        else:
            return await self.save_linked_message(email, company, position, message)
        
    async def update_onboarding_status(self, email: str, resume_data: ResumeUpdate, is_onboarded: bool):
        """
        Update the onboarding status of a user.
        """
        user = await User.find_one({"email": email})
        if user:
            resume = await self.get_user_resume(email)
            resume_data_to_insert = ResumeModel(
                email=email,
                personalInfo=resume_data.personalInfo,
                experience=resume_data.experience,
                education=resume_data.education,
                projects=resume_data.projects,
                certifications=resume_data.certifications,
                skills=resume_data.skills,
                jobPreferences=resume_data.jobPreferences,
                resumeFile=resume_data.resumeFile
            )
            if not resume:
                await ResumeModel.insert(resume_data_to_insert)
            else:
                resume.personalInfo = resume_data.personalInfo
                resume.experience = resume_data.experience
                resume.education = resume_data.education
                resume.projects = resume_data.projects
                resume.certifications = resume_data.certifications
                resume.skills = resume_data.skills
                resume.jobPreferences = resume_data.jobPreferences
                resume.resumeFile = resume_data.resumeFile
                await resume.save()
            if not user.is_onboarded:
                user.is_onboarded = is_onboarded
            await user.save()
        return user
    
    async def get_user_resume(self, email: str):
        """
        Get a user's resume from the database.
        """
        resume = await ResumeModel.find_one({"email": email})
        return resume
    

    async def add_ai_optimized_resume(self, email: str, resume_data: dict, is_main_resume: bool, job_id: str = None):
        """
        Add an AI-optimized resume to the database.
        """
        ai_optimized_resume = await AiOptimzedResumeModel.find_one(
            AiOptimzedResumeModel.email == email,
            AiOptimzedResumeModel.is_main_resume == is_main_resume,
            AiOptimzedResumeModel.job_id == job_id
        )
        if not ai_optimized_resume:
            ai_optimized_resume = AiOptimzedResumeModel(
                email=email,
                personalInfo=resume_data["personalInfo"],
                experience=resume_data["experience"],
                education=resume_data["education"],
                projects=resume_data["projects"],
                certifications=resume_data["certifications"],
                skills=resume_data["skills"],
                jobPreferences=resume_data["jobPreferences"],
                is_main_resume=is_main_resume,
                job_id=job_id
            )
            ai_optimized_resume = await ai_optimized_resume.insert()
        else:
            ai_optimized_resume.personalInfo = resume_data["personalInfo"]
            ai_optimized_resume.experience = resume_data["experience"]
            ai_optimized_resume.education = resume_data["education"]
            ai_optimized_resume.projects = resume_data["projects"]
            ai_optimized_resume.certifications = resume_data["certifications"]
            ai_optimized_resume.skills = resume_data["skills"]
            ai_optimized_resume.jobPreferences = resume_data["jobPreferences"]
            ai_optimized_resume = await ai_optimized_resume.save()
        return ai_optimized_resume
    
    async def get_ai_optimized_resume(self, email: str, is_main_resume: bool, job_id: str = None):
        """
        Get an AI-optimized resume from the database.
        """
        ai_optimized_resume = await AiOptimzedResumeModel.find_one(
            AiOptimzedResumeModel.email == email,
            AiOptimzedResumeModel.is_main_resume == is_main_resume,
            AiOptimzedResumeModel.job_id == job_id
        )
        return ai_optimized_resume
    
    async def get_jobs_count(self, query_params: JobQuery, min_date: str) -> int:
        """
        Get the number of jobs in the database.
        """
        return await JobModel.find(
            JobModel.query.city == query_params.city,
            JobModel.query.country_code == query_params.country_code,
            JobModel.query.country == query_params.country,
            JobModel.query.job_title == query_params.job_title,
            JobModel.query.job_type == query_params.job_type,
            JobModel.query.is_remote == query_params.is_remote,
            JobModel.query.distance <= query_params.distance,
            JobModel.date_posted >= min_date
        ).count()
    
    async def get_jobs_from_db_paginated(self, query_params: JobQuery, min_date: str, skip: int, limit: int) -> List[JobModel]:
        return await JobModel.find(
            JobModel.query.city == query_params.city,
            JobModel.query.country_code == query_params.country_code,
            JobModel.query.country == query_params.country,
            JobModel.query.job_title == query_params.job_title,
            JobModel.query.job_type == query_params.job_type,
            JobModel.query.is_remote == query_params.is_remote,
            JobModel.query.distance <= query_params.distance,
            JobModel.date_posted >= min_date
        ).skip(skip).limit(limit).to_list()
    
    async def update_user_name(self, email: str, name: str):
        user = await User.find_one({"email": email})
        if user:
            user.name = name
            user = await user.save()
            return user, True
        return None, False
    
    async def get_user_to_job(self, email: str, job_id: str):
        job_user = await JobUser.find_one({
            "email": email,
            "jobId": job_id
        })
        return job_user
    
    async def add_user_to_job(self, email: str, job_id: str, match_score: int, missing_skills: List[str], matched_skills: List[str], job_required_years: int, salary_with_currency: str, tfidf_similarity: int, semantic_similarity: int, skill_match_score: int, experience_match_score: int):
        job_user = await JobUser.find_one({
            "email": email,
            "jobId": job_id
        })
        if not job_user:
            job_user = JobUser(
                email=email,
                jobId=job_id,
                match_score=match_score,
                missing_skills=missing_skills,
                matched_skills=matched_skills,
                job_required_years=job_required_years,
                salary_with_currency=salary_with_currency,
                tfidf_similarity=tfidf_similarity,
                semantic_similarity=semantic_similarity,
                skill_match_score=skill_match_score,
                experience_match_score=experience_match_score
            )
            return await job_user.save()
        job_user.match_score = match_score
        job_user.missing_skills = missing_skills
        job_user.matched_skills = matched_skills
        job_user.job_required_years = job_required_years
        job_user.salary_with_currency = salary_with_currency
        job_user.tfidf_similarity = tfidf_similarity
        job_user.semantic_similarity = semantic_similarity
        job_user.skill_match_score = skill_match_score
        job_user.experience_match_score = experience_match_score
        return await job_user.save()
    
    async def update_application_status(self, email: str, job_id: str, status: ApplicationStatus):
        job_user = await JobUser.find_one({
            "email": email,
            "jobId": job_id
        })
        if job_user:
            job_user.application_status = status
            await job_user.save()
            return job_user
        else:
            return await JobUser.insert(
                JobUser(
                    email=email,
                    jobId=job_id,
                    application_status=status.value
                )
            )
        return None
    
    async def get_applied_jobs(self, email: str):
        return await JobUser.find(
            JobUser.email == email,
            JobUser.application_status != ApplicationStatus.Pending
        ).to_list()
    
    async def update_usage_stats(self, email: str, feature: Features, job_id: str = None):
        usage_stats_doc = await UsageStats.find_one({
            "email": email,
            "feature": feature.value,
            "job_id": job_id
        })
        if not usage_stats_doc:
            return await UsageStats.insert(
                UsageStats(
                    email=email,
                    feature=feature.value,
                    count=1,
                    job_id=job_id,
                    timeStamps=[datetime.utcnow()]
                )
            )
        usage_stats_doc.count += 1
        usage_stats_doc.timeStamps.append(datetime.utcnow())
        return await usage_stats_doc.save()
    
    async def add_feedback(self, email: str, feedback: dict):
        feedback = await Feedback.insert(
            Feedback(
                email=email,
                feedback=feedback.get("message"),
                feature=feedback.get("page"),
            )
        )
        return feedback
        
    async def get_users(self):
        return await User.find().to_list()

    async def get_usage_stats(self):
        return await UsageStats.find().to_list()

    async def get_feedback(self):
        return await Feedback.find().to_list()
