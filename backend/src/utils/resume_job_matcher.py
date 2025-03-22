from datetime import date
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import spacy
import re
from collections import Counter
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import concurrent.futures
from functools import partial
from src.db.mongo import DatabaseOperations, User
from src.db.model import ResumeModel

class ResumeJobMatcher:
    def __init__(self):
        # Download necessary NLTK resources
        nltk.download('stopwords', quiet=True)
        nltk.download('wordnet', quiet=True)
        
        # Initialize NLP tools
        self.nlp = spacy.load('en_core_web_md')
        self.stop_words = set(stopwords.words('english'))
        self.lemmatizer = WordNetLemmatizer()
        
        # Common skills dictionary - expand as needed
        self.skills_dict = {
            'programming': [
                'python', 'java', 'javascript', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'go', 
                'rust', 'scala', 'haskell', 'perl', 'typescript', 'r', 'matlab', 'bash', 'powershell', 
                'vhdl', 'verilog', 'julia', 'assembly', 'objective-c', 'cobol', 'fortran', 'ada', 'groovy', 
                'f#', 'elm', 'purescript', 'dart', 'lua', 'nim', 'zig', 'elixir', 'crystal', 'ocaml'
            ],
            'data_science': [
                'machine learning', 'deep learning', 'data mining', 'statistics', 'ai', 'artificial intelligence', 
                'data analysis', 'data visualization', 'big data', 'predictive modeling', 'natural language processing', 
                'computer vision', 'data wrangling', 'feature engineering', 'time series analysis', 
                'data cleaning', 'graph analysis', 'text mining', 'bayesian analysis', 'genetic algorithms', 
                'reinforcement learning', 'dimensionality reduction', 'ensemble learning'
            ],
            'databases': [
                'sql', 'nosql', 'postgresql', 'mysql', 'mongodb', 'oracle', 'cassandra', 'redis', 'elasticsearch', 
                'sqlite', 'mariadb', 'couchdb', 'dynamodb', 'firestore', 'neo4j', 'tidb', 'influxdb', 
                'clickhouse', 'hbase', 'snowflake', 'teradata', 'greenplum', 'presto', 'trino', 'cockroachdb', 
                'splunk', 'amazon redshift', 'bigquery', 'hive', 'drill', 'impala'
            ],
            'web_development': [
                'html', 'css', 'javascript', 'react', 'angular', 'vue', 'node.js', 'django', 'flask', 
                'ruby on rails', 'express', 'laravel', 'spring', 'asp.net', 'next.js', 'nuxt.js', 
                'svelte', 'tailwindcss', 'bootstrap', 'foundation', 'ember.js', 'backbone.js', 
                'meteor', 'symfony', 'codeigniter', 'cakephp', 'jekyll', 'hugo', 'gatsby'
            ],
            'devops': [
                'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'ci/cd', 'terraform', 'ansible', 'git', 
                'prometheus', 'grafana', 'puppet', 'chef', 'nagios', 'consul', 'vault', 'saltstack', 'helm', 
                'vagrant', 'splunk', 'graylog', 'logstash', 'elk stack', 'rundeck', 'sonarqube', 
                'jfrog artifactory', 'kibana', 'elastic stack', 'hashicorp vault'
            ],
            'cloud_computing': [
                'aws ec2', 'aws s3', 'aws lambda', 'azure vm', 'google cloud functions', 
                'cloudformation', 'cloudfront', 'route 53', 'cloudflare', 'cloudwatch', 
                'eks', 'aks', 'gke', 'aws amplify', 'aws batch', 'azure devops', 
                'google app engine', 'openstack', 'cloudfoundry', 'heroku', 'digitalocean'
            ],
            'blockchain': [
                'smart contracts', 'solidity', 'web3.js', 'ether.js', 'ethereum', 'hyperledger', 
                'binance smart chain', 'nft development', 'decentralized applications (dapps)', 
                'cryptography', 'consensus algorithms', 'blockchain security', 
                'chainlink', 'polkadot', 'cardano', 'polygon', 'solana', 'truffle', 'ganache', 'hardhat'
            ],
            'networking': [
                'tcp/ip', 'udp', 'dns', 'dhcp', 'vpn', 'firewalls', 'load balancing', 'routing protocols', 
                'bgp', 'ospf', 'eigrp', 'sd-wan', 'network security', 'wireless networking', 
                'network monitoring', 'snmp', 'wireshark', 'packet analysis', 'ipv6'
            ],
            'cybersecurity': [
                'penetration testing', 'vulnerability assessment', 'ethical hacking', 
                'network security', 'application security', 'firewall management', 
                'ids/ips', 'encryption', 'threat modeling', 'incident response', 
                'digital forensics', 'security operations', 'malware analysis', 
                'risk assessment', 'identity management', 'zero trust security', 'soc operations'
            ],
            'robotics': [
                'robot operating system (ros)', 'automation', 'robot kinematics', 
                'robot path planning', 'robot control', 'mechatronics', 'robot vision', 
                'industrial robots', 'autonomous navigation', 'robotic arm programming'
            ],
            'manufacturing': [
                'cad', 'cam', 'cnc programming', 'lean manufacturing', 'kaizen', 
                'six sigma', 'process optimization', 'quality control', 'supply chain management', 
                'production planning', 'inventory optimization'
            ],
            'medical': [
                'patient care', 'diagnostics', 'medical coding', 'phlebotomy', 
                'medical transcription', 'telemedicine', 'surgical assistance', 
                'clinical research', 'pharmaceuticals', 'biostatistics'
            ],
            'game_development': [
                'unity', 'unreal engine', 'godot', 'game physics', 
                'game ai', 'level design', 'shader programming', 'animation rigging', 
                '3d asset creation', 'audio programming', 'game monetization'
            ],
            'social_media': [
                'community management', 'social media strategy', 'content scheduling', 
                'social listening', 'social analytics', 'viral marketing', 'influencer outreach', 
                'brand advocacy', 'content curation', 'ugc management'
            ],
            'supply_chain': [
                'inventory management', 'logistics coordination', 'warehouse management', 
                'demand forecasting', 'supplier negotiation', 'fleet management', 
                'distribution planning', 'material requirements planning (mrp)', 
                'just-in-time (jit)', 'total quality management (tqm)'
            ]
        }
        # Flatten skills for easier matching
        self.all_skills = []
        for category in self.skills_dict.values():
            self.all_skills.extend(category)
    
    def preprocess_text(self, text):
        """Clean and normalize text for better matching"""
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters and extra whitespace
        text = re.sub(r'[^\w\s]', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Tokenize, remove stopwords, and lemmatize
        tokens = text.split()
        tokens = [self.lemmatizer.lemmatize(token) for token in tokens if token not in self.stop_words]
        
        return ' '.join(tokens)
    
    def extract_skills(self, text):
        """Extract skills from text using NER and pattern matching"""
        skills = []
        text_lower = text.lower()
        
        # Pattern matching for skills in our dictionary
        for skill in self.all_skills:
            if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
                skills.append(skill)
        
        # Use spaCy for entity extraction (skills often appear as PRODUCT, ORG, etc.)
        doc = self.nlp(text)
        for ent in doc.ents:
            if ent.label_ in ["PRODUCT", "ORG", "GPE"] and len(ent.text) > 2:
                # Clean entity text
                skill = ent.text.lower().strip()
                skills.append(skill)
        
        return list(set(skills))  # Remove duplicates
    
    import re

    def extract_experience(self, text):
        """Extract years of experience from text"""
        # Look for patterns like "X years of experience" with more variations
        experience_patterns = [
            r'experience:?\s*(\d+)[\+]?\s*(?:years|yrs|year)',  # Matches "Experience: 4+ years"
            r'(\d+)[\+]?\s*(?:years|yrs|year)(?:\s*of)?\s*(?:experience|exp|expertise)',
            r'(?:experience|exp|expertise)(?:\s*of)?\s*(\d+)[\+]?\s*(?:years|yrs|year)',
            r'(\d+)[\+]?[-]?(?:year|yr)(?:s)?(?:\s*of)?\s*(?:experience|exp)',
            r'(?:with|having)\s*(\d+)[\+]?\s*(?:years|yrs|year)(?:\s*of)?\s*(?:experience|exp)',
            r'(?:worked|working)(?:\s*for)?\s*(\d+)[\+]?\s*(?:years|yrs|year)'
        ]
        
        all_matches = []
        for pattern in experience_patterns:
            matches = re.findall(pattern, text.lower())
            all_matches.extend(matches)
        
        if all_matches:
            return max([int(match) for match in all_matches])
        
        return 0
    
    def calculate_tfidf_similarity(self, text1, text2):
        """Calculate TF-IDF based similarity between two texts"""
        preprocessed_text1 = self.preprocess_text(text1)
        preprocessed_text2 = self.preprocess_text(text2)
        
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform([preprocessed_text1, preprocessed_text2])
        
        # Calculate cosine similarity
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return similarity
    
    def calculate_semantic_similarity(self, text1, text2):
        """Calculate semantic similarity using spaCy's word vectors"""
        doc1 = self.nlp(self.preprocess_text(text1))
        doc2 = self.nlp(self.preprocess_text(text2))
        
        if doc1.vector_norm and doc2.vector_norm:
            return doc1.similarity(doc2)
        return 0.0
    
    def calculate_skill_match(self, resume_skills, job_skills):
        """Calculate how well resume skills match job skills"""
        if not job_skills:
            return 0.0
        
        matched_skills = set(resume_skills) & set(job_skills)
        return len(matched_skills) / len(job_skills)
    
    def calculate_experience_match(self, resume_years, job_years):
        """Calculate how well the resume experience matches job requirements"""
        if job_years == 0:
            return 1.0  # No specific requirement
        
        if resume_years >= job_years:
            return 1.0
        elif resume_years >= 0.7 * job_years:
            return 0.8  # Close to requirement
        elif resume_years >= 0.5 * job_years:
            return 0.5  # Partially meets requirement
        else:
            return 0.2  # Significantly below requirement
        
    def extract_salary_with_currency(self, text):
        """this should be able to any currency"""
        salary_patterns = [
            r'(?i)(?:\$|€|£|¥|USD|EUR|GBP|JPY|CAD|AUD|CHF|CNY|Rs\.?|INR|₹|₽|₩|₱|₴|₪|฿|₫|₢|₮|₸|₦|₲|₡|₵|₺|₼|₾|₷|₠|₧|R\$|zł|kr|руб\.?|лв|RON|KD|QAR|SAR|AED)\s*(?:\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?)\s*(?:k|K|M|thousand|million|billion)?\s*(?:-|to|–|~|\s+to\s+)?\s*(?:(?:\$|€|£|¥|USD|EUR|GBP|JPY|CAD|AUD|CHF|CNY|Rs\.?|INR|₹|₽|₩|₱|₴|₪|฿|₫|₢|₮|₸|₦|₲|₡|₵|₺|₼|₾|₷|₠|₧|R\$|zł|kr|руб\.?|лв|RON|KD|QAR|SAR|AED)\s*)?(?:\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?)\s*(?:k|K|M|thousand|million|billion)?(?:\s*(?:per|\/)\s*(?:year|yr|month|mo|week|wk|hour|hr|annum|pa|p\.a\.))?',
            r'(?i)(?:salary|pay|compensation|wage|earnings|remuneration|stipend)?\s*:?\s*(?:\$|€|£|¥|USD|EUR|GBP|JPY|CAD|AUD|CHF|CNY|Rs\.?|INR|₹|₽|₩|₱|₴|₪|฿|₫|₢|₮|₸|₦|₲|₡|₵|₺|₼|₾|₷|₠|₧|R\$|zł|kr|руб\.?|лв|RON|KD|QAR|SAR|AED)\s*(?:\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?)\s*(?:k|K|M|thousand|million|billion)?\s*(?:-|to|–|~|\s+to\s+)?\s*(?:(?:\$|€|£|¥|USD|EUR|GBP|JPY|CAD|AUD|CHF|CNY|Rs\.?|INR|₹|₽|₩|₱|₴|₪|฿|₫|₢|₮|₸|₦|₲|₡|₵|₺|₼|₾|₷|₠|₧|R\$|zł|kr|руб\.?|лв|RON|KD|QAR|SAR|AED)\s*)?(?:\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?)\s*(?:k|K|M|thousand|million|billion)?(?:\s*(?:per|\/)\s*(?:year|yr|month|mo|week|wk|hour|hr|annum|pa|p\.a\.))?',
            r'(?:[\$€£¥₹₽₩₱₴₪฿₫₢₮₸₦₲₡₵₺₼₾₷₠₧R]|\b(?:USD|EUR|GBP|JPY|CAD|AUD|CHF|CNY|INR|Rs))\s*\d[\d,\.]*(?:\s*[-–]\s*(?:[\$€£¥₹₽₩₱₴₪฿₫₢₮₸₦₲₡₵₺₼₾₷₠₧R]|\b(?:USD|EUR|GBP|JPY|CAD|AUD|CHF|CNY|INR|Rs))?\s*\d[\d,\.]*)?'
        ]
        for pattern in salary_patterns:
            matches = re.findall(pattern, text)
            if matches:
                return matches[0]
        return "No salary mentioned"
    
    def match_resume_to_job(self, resume_text, job_description):
        """
        Match a resume to a job description and return a detailed score
        
        Parameters:
        resume_text (str): The resume text
        job_description (str): The job description text
        
        Returns:
        dict: Detailed matching scores and information
        """
        # Extract skills
        resume_skills = self.extract_skills(resume_text)
        job_skills = self.extract_skills(job_description)
        
        # Extract experience
        resume_years = self.extract_experience(resume_text)
        job_years = self.extract_experience(job_description)
        salary_with_curreny = self.extract_salary_with_currency(job_description)
        
        # Calculate similarities
        tfidf_similarity = self.calculate_tfidf_similarity(resume_text, job_description)
        semantic_similarity = self.calculate_semantic_similarity(resume_text, job_description)
        skill_match = self.calculate_skill_match(resume_skills, job_skills)
        experience_match = self.calculate_experience_match(resume_years, job_years)
        
        # Calculate weighted score
        # Weights can be adjusted based on importance of each factor
        weights = {
            'tfidf': 0.25,
            'semantic': 0.25,
            'skills': 0.35,
            'experience': 0.15
        }
        
        overall_score = (
            weights['tfidf'] * tfidf_similarity +
            weights['semantic'] * semantic_similarity +
            weights['skills'] * skill_match +
            weights['experience'] * experience_match
        )
        
        # Prepare detailed result
        result = {
            'overall_score': round(overall_score * 100, 2),
            'tfidf_similarity': round(tfidf_similarity * 100, 2),
            'semantic_similarity': round(semantic_similarity * 100, 2),
            'skill_match_score': round(skill_match * 100, 2),
            'experience_match_score': round(experience_match * 100, 2),
            'resume_skills': resume_skills,
            'job_skills': job_skills,
            'matched_skills': list(set(resume_skills) & set(job_skills)),
            'missing_skills': list(set(job_skills) - set(resume_skills)),
            'resume_years': resume_years,
            'job_required_years': job_years,
            'salary_with_currency': salary_with_curreny
        }
        
        return result
    
    def get_top_jobs_for_resume(self, resume_text, job_descriptions, top_n=3):
        """
        Find the best matching jobs for a resume
        
        Parameters:
        resume_text (str): The resume text
        job_descriptions (list): List of job description texts
        top_n (int): Number of top results to return
        
        Returns:
        list: Top matching jobs with scores
        """
        results = []
        
        for i, job in enumerate(job_descriptions):
            match = self.match_resume_to_job(resume_text, job)
            results.append({
                'job_id': i + 1,
                'match_details': match,
                'job_text': job
            })
        
        # Sort by overall score in descending order
        sorted_results = sorted(results, key=lambda x: x['match_details']['overall_score'], reverse=True)
        
        return sorted_results[:top_n]

def match_resume_to_job(resume_text, job_description):
    matcher = ResumeJobMatcher()
    return matcher.match_resume_to_job(resume_text, job_description)

def process_job(job, user_data):
    description = job.get("description")
    description = re.sub(r'<[^>]*>', '', description).lower()
    matcher_rank = match_resume_to_job(user_data, description)
    return job, matcher_rank

def match_all_jobs(json_response: ResumeModel, overall_user_data, num_workers=10):
    process_job_with_data = partial(process_job, user_data=overall_user_data)
    
    results = []
    
    with concurrent.futures.ProcessPoolExecutor(max_workers=num_workers) as executor:
        future_to_job = {executor.submit(process_job_with_data, job): job for job in json_response}
        
        for future in concurrent.futures.as_completed(future_to_job):
            try:
                job, matcher_rank = future.result()
                results.append((job.get("id"), matcher_rank))
            except Exception as exc:
                print(f"Job processing generated an exception: {exc}")
    
    # sorted_results = sorted(results, key=lambda x: x[1], reverse=True)
    scores = [score["overall_score"] for _, score in results]
    max_score = max(scores)
    normalized_scores = [score / max_score for score in scores]
    results = [(job_id, {**score, "overall_score": round(normalized_score * 100, 2)}) for (job_id, score), normalized_score in zip(results, normalized_scores)]
    return results

async def get_job_details(db_ops: DatabaseOperations, user: User, json_response: dict, job_title: str):
    resume = await db_ops.get_user_resume(user.email)
    if resume:
        job_title = job_title.lower()
        resume_skills = " ,".join(resume.skills).lower()
        projects = resume.projects
        resume_years = 0
        for project in projects:
            resume_skills += " ,".join(project.technologies).lower()
        experience = resume.experience
        for exp in experience:
            startDate = exp.startDate
            endDate = exp.endDate
            if endDate.lower() == "present" or endDate == "":
                endDate = str(date.today())
            resume_years += int(endDate.split("-")[0]) - int(startDate.split("-")[0])
        overall_user_data = f"""
        job title: {job_title}
        {resume.personalInfo.about_me}
        {resume_skills}
        {resume_years} years of experience
        """
        matches = match_all_jobs(json_response, overall_user_data)
        for match_data in matches:
            job_id, match = match_data
            for index, json in enumerate(json_response):
                if json["id"] == job_id:
                    break
            json = json_response[index]
            json["match_score"] = match["overall_score"]
            json["missing_skills"] = match["missing_skills"]
            json["matched_skills"] = match["matched_skills"]
            json["job_required_years"] = match["job_required_years"]
            json["salary_with_currency"] = match["salary_with_currency"]
            json['tfidf_similarity'] = match['tfidf_similarity']
            json['semantic_similarity'] = match['semantic_similarity']
            json['skill_match_score'] = match['skill_match_score']
            json['experience_match_score'] = match['experience_match_score']
    
    # sort based on date posted and match score
    json_response = sorted(
        json_response,
        key=lambda x: (
            str(x.get("date_posted", "")),
            x.get("match_score", 0)
        ),
        reverse=True
    )
    return json_response