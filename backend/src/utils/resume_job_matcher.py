from datetime import date
import os
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
        # Download resources only once if not already present
        try:
            stopwords.words('english')
        except LookupError:
            nltk.download('stopwords', quiet=True)
            nltk.download('wordnet', quiet=True)
        
        # Load smaller spaCy model for better performance
        self.nlp = spacy.load('en_core_web_sm')
        self.stop_words = set(stopwords.words('english'))
        self.lemmatizer = WordNetLemmatizer()
        
        # Precompile skill regex patterns for faster matching
        self.skills_dict = self._load_skills_dict()
        self.all_skills = []
        for category in self.skills_dict.values():
            self.all_skills.extend(category)
            
        # Precompile common regex patterns
        self.skill_patterns = {skill: re.compile(r'\b' + re.escape(skill) + r'\b') for skill in self.all_skills}
        self.experience_patterns = [
            re.compile(r'experience:?\s*(\d+)[\+]?\s*(?:years|yrs|year)'),
            re.compile(r'(\d+)[\+]?\s*(?:years|yrs|year)(?:\s*of)?\s*(?:experience|exp|expertise)'),
            re.compile(r'(?:experience|exp|expertise)(?:\s*of)?\s*(\d+)[\+]?\s*(?:years|yrs|year)'),
            re.compile(r'(\d+)[\+]?[-]?(?:year|yr)(?:s)?(?:\s*of)?\s*(?:experience|exp)'),
            re.compile(r'(?:with|having)\s*(\d+)[\+]?\s*(?:years|yrs|year)(?:\s*of)?\s*(?:experience|exp)'),
            re.compile(r'(?:worked|working)(?:\s*for)?\s*(\d+)[\+]?\s*(?:years|yrs|year)')
        ]
        self.salary_patterns = [
            re.compile(r'(?i)(?:\$|€|£|¥|USD|EUR|GBP|JPY|CAD|AUD|CHF|CNY|Rs\.?|INR|₹|₽|₩|₱|₴|₪|฿|₫|₢|₮|₸|₦|₲|₡|₵|₺|₼|₾|₷|₠|₧|R\$|zł|kr|руб\.?|лв|RON|KD|QAR|SAR|AED)\s*(?:\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?)\s*(?:k|K|M|thousand|million|billion)?\s*(?:-|to|–|~|\s+to\s+)?\s*(?:(?:\$|€|£|¥|USD|EUR|GBP|JPY|CAD|AUD|CHF|CNY|Rs\.?|INR|₹|₽|₩|₱|₴|₪|฿|₫|₢|₮|₸|₦|₲|₡|₵|₺|₼|₾|₷|₠|₧|R\$|zł|kr|руб\.?|лв|RON|KD|QAR|SAR|AED)\s*)?(?:\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?)\s*(?:k|K|M|thousand|million|billion)?(?:\s*(?:per|\/)\s*(?:year|yr|month|mo|week|wk|hour|hr|annum|pa|p\.a\.))?'),
            re.compile(r'(?i)(?:salary|pay|compensation|wage|earnings|remuneration|stipend)?\s*:?\s*(?:\$|€|£|¥|USD|EUR|GBP|JPY|CAD|AUD|CHF|CNY|Rs\.?|INR|₹|₽|₩|₱|₴|₪|฿|₫|₢|₮|₸|₦|₲|₡|₵|₺|₼|₾|₷|₠|₧|R\$|zł|kr|руб\.?|лв|RON|KD|QAR|SAR|AED)\s*(?:\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?)\s*(?:k|K|M|thousand|million|billion)?\s*(?:-|to|–|~|\s+to\s+)?\s*(?:(?:\$|€|£|¥|USD|EUR|GBP|JPY|CAD|AUD|CHF|CNY|Rs\.?|INR|₹|₽|₩|₱|₴|₪|฿|₫|₢|₮|₸|₦|₲|₡|₵|₺|₼|₾|₷|₠|₧|R\$|zł|kr|руб\.?|лв|RON|KD|QAR|SAR|AED)\s*)?(?:\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?)\s*(?:k|K|M|thousand|million|billion)?(?:\s*(?:per|\/)\s*(?:year|yr|month|mo|week|wk|hour|hr|annum|pa|p\.a\.))?'),
            re.compile(r'(?:[\$€£¥₹₽₩₱₴₪฿₫₢₮₸₦₲₡₵₺₼₾₷₠₧R]|\b(?:USD|EUR|GBP|JPY|CAD|AUD|CHF|CNY|INR|Rs))\s*\d[\d,\.]*(?:\s*[-–]\s*(?:[\$€£¥₹₽₩₱₴₪฿₫₢₮₸₦₲₡₵₺₼₾₷₠₧R]|\b(?:USD|EUR|GBP|JPY|CAD|AUD|CHF|CNY|INR|Rs))?\s*\d[\d,\.]*)?')
        ]
        
        # Create a reusable vectorizer
        self.vectorizer = TfidfVectorizer()
        
        # Cache for preprocessed text
        self.text_cache = {}
    
    def _load_skills_dict(self):
        return {
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
    
    def preprocess_text(self, text):
        """Clean and normalize text with caching for better performance"""
        if text in self.text_cache:
            return self.text_cache[text]
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters and extra whitespace
        text = re.sub(r'[^\w\s]', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Tokenize, remove stopwords, and lemmatize
        tokens = text.split()
        tokens = [self.lemmatizer.lemmatize(token) for token in tokens if token not in self.stop_words]
        
        result = ' '.join(tokens)
        self.text_cache[text] = result
        return result
    
    def extract_skills(self, text):
        """Extract skills using pre-compiled patterns for faster matching"""
        skills = set()
        text_lower = text.lower()
        
        # Fast pattern matching using pre-compiled patterns
        for skill, pattern in self.skill_patterns.items():
            if pattern.search(text_lower):
                skills.add(skill)
        
        # Use spaCy for entity extraction but limit to important entities
        doc = self.nlp(text[:10000])  # Limit text processing for speed
        for ent in doc.ents:
            if ent.label_ in ["PRODUCT", "ORG"] and len(ent.text) > 2:
                skill = ent.text.lower().strip()
                skills.add(skill)
        
        return list(skills)
    
    def extract_experience(self, text):
        """Extract years of experience using pre-compiled patterns"""
        all_matches = []
        
        for pattern in self.experience_patterns:
            matches = pattern.findall(text.lower())
            all_matches.extend(matches)
        
        if all_matches:
            return max([int(match) for match in all_matches])
        
        return 0
    
    def calculate_tfidf_similarity(self, text1, text2):
        """Calculate TF-IDF similarity with faster preprocessing"""
        preprocessed_text1 = self.preprocess_text(text1)
        preprocessed_text2 = self.preprocess_text(text2)
        
        tfidf_matrix = self.vectorizer.fit_transform([preprocessed_text1, preprocessed_text2])
        
        # Calculate cosine similarity
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return similarity
    
    def calculate_semantic_similarity(self, text1, text2):
        """Calculate semantic similarity with limited text size for speed"""
        # Limit text size for faster processing
        doc1 = self.nlp(self.preprocess_text(text1[:5000]))
        doc2 = self.nlp(self.preprocess_text(text2[:5000]))
        
        if doc1.vector_norm and doc2.vector_norm:
            return doc1.similarity(doc2)
        return 0.0
    
    def calculate_skill_match(self, resume_skills, job_skills):
        """Calculate skill match (optimized for sets)"""
        if not job_skills:
            return 0.0
        
        resume_skills_set = set(resume_skills)
        job_skills_set = set(job_skills)
        matched_skills = resume_skills_set & job_skills_set
        return len(matched_skills) / len(job_skills_set)
    
    def calculate_experience_match(self, resume_years, job_years):
        """Calculate experience match"""
        if job_years == 0:
            return 1.0
        
        if resume_years >= job_years:
            return 1.0
        elif resume_years >= 0.7 * job_years:
            return 0.8
        elif resume_years >= 0.5 * job_years:
            return 0.5
        else:
            return 0.2
        
    def extract_salary_with_currency(self, text):
        """Extract salary with optimized regex patterns"""
        for pattern in self.salary_patterns:
            matches = pattern.findall(text)
            if matches:
                return matches[0]
        return "No salary mentioned"
    
    def match_resume_to_job(self, resume_text, job_description):
        """Fast resume-job matching with optimized steps"""
        # Extract skills
        resume_skills = self.extract_skills(resume_text)
        job_skills = self.extract_skills(job_description)
        
        # Extract experience
        resume_years = self.extract_experience(resume_text)
        job_years = self.extract_experience(job_description)
        salary_with_currency = self.extract_salary_with_currency(job_description)
        
        # Calculate similarities - do cheaper calculations first
        skill_match = self.calculate_skill_match(resume_skills, job_skills)
        experience_match = self.calculate_experience_match(resume_years, job_years)
        
        # Only do more expensive calculations if necessary
        tfidf_similarity = self.calculate_tfidf_similarity(resume_text, job_description)
        
        # Semantic similarity is expensive - only calculate if others indicate a potential match
        if (skill_match + experience_match + tfidf_similarity) / 3 > 0.5:
            semantic_similarity = self.calculate_semantic_similarity(resume_text, job_description)
        else:
            semantic_similarity = tfidf_similarity * 0.8  # Approximate based on TF-IDF
        
        # Calculate weighted score with optimized weights
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
        
        # Prepare result with minimal computation
        matched_skills = list(set(resume_skills) & set(job_skills))
        missing_skills = list(set(job_skills) - set(resume_skills))
        
        result = {
            'overall_score': round(overall_score * 100, 2),
            'tfidf_similarity': round(tfidf_similarity * 100, 2),
            'semantic_similarity': round(semantic_similarity * 100, 2),
            'skill_match_score': round(skill_match * 100, 2),
            'experience_match_score': round(experience_match * 100, 2),
            'resume_skills': resume_skills,
            'job_skills': job_skills,
            'matched_skills': matched_skills,
            'missing_skills': missing_skills,
            'resume_years': resume_years,
            'job_required_years': job_years,
            'salary_with_currency': salary_with_currency
        }
        
        return result

def match_resume_to_job(resume_text, job_description):
    matcher = ResumeJobMatcher()
    return matcher.match_resume_to_job(resume_text, job_description)

# Create a global matcher instance to avoid re-initialization
global_matcher = None

def get_matcher():
    global global_matcher
    if global_matcher is None:
        global_matcher = ResumeJobMatcher()
    return global_matcher

def process_job(job, user_data):
    description = job.get("description", "")
    description = re.sub(r'<[^>]*>', '', description).lower()
    matcher = get_matcher()
    matcher_rank = matcher.match_resume_to_job(user_data, description)
    return job.get("id"), matcher_rank

def match_all_jobs(json_response, overall_user_data, num_workers=None):
    # Auto-determine optimal number of workers based on CPU count
    if num_workers is None:
        num_workers = min(32, max(4, os.cpu_count() + 4))
    
    results = []
    
    # Use ThreadPoolExecutor instead of ProcessPoolExecutor for shared memory
    with concurrent.futures.ThreadPoolExecutor(max_workers=num_workers) as executor:
        # Initialize the matcher once
        matcher = get_matcher()
        
        # Submit jobs in batches for better performance
        futures = []
        for job in json_response:
            description = job.get("description", "")
            description = re.sub(r'<[^>]*>', '', description).lower()
            future = executor.submit(matcher.match_resume_to_job, overall_user_data, description)
            futures.append((job.get("id"), future))
        
        # Process results as they complete
        for job_id, future in futures:
            try:
                matcher_rank = future.result()
                results.append((job_id, matcher_rank))
            except Exception as exc:
                print(f"Job processing generated an exception: {exc}")
    
    # Normalize scores more efficiently
    # if results:
    #     scores = [score["overall_score"] for _, score in results]
    #     max_score = max(scores) if scores else 100
        
    #     normalized_results = []
    #     for job_id, score in results:
    #         normalized_score = score["overall_score"] / max_score
    #         normalized_results.append((job_id, {**score, "overall_score": round(normalized_score * 100, 2)}))
        
    #     return normalized_results
    
    return results

async def get_job_details(db_ops: DatabaseOperations, user: User, json_response: dict, job_title: str):
    resume = await db_ops.get_user_resume(user.email)
    if not resume:
        return sorted(json_response, key=lambda x: str(x.get("date_posted", "")), reverse=True)
        
    # Prepare user data more efficiently
    job_title = job_title.lower()
    
    # Collect skills in one pass
    all_skills = set(resume.skills)
    
    # Calculate experience years
    resume_years = 0
    for exp in resume.experience:
        startDate = exp.startDate
        endDate = exp.endDate
        if endDate.lower() == "present" or endDate == "":
            endDate = str(date.today())
        try:
            resume_years += int(endDate.split("-")[0]) - int(startDate.split("-")[0])
        except (ValueError, IndexError):
            continue
    
    # Build consolidated skills from projects
    for project in resume.projects:
        all_skills.update(project.technologies)
    
    # Build user data string once
    overall_user_data = f"""
    job title: {job_title}
    {resume.personalInfo.about_me}
    {', '.join(all_skills).lower()}
    {resume_years} years of experience
    """
    
    # Create lookup dictionary for jobs by ID for faster access
    jobs_by_id = {job["id"]: job for job in json_response}
    
    # Run matching with optimized thread pool
    matches = match_all_jobs(json_response, overall_user_data)
    
    # Update jobs with match data in one efficient pass
    for job_id, match in matches:
        if job_id not in jobs_by_id:
            continue
            
        job = jobs_by_id[job_id]
        job["match_score"] = match["overall_score"]
        job["missing_skills"] = match["missing_skills"]
        job["matched_skills"] = match["matched_skills"]
        job["job_required_years"] = match["job_required_years"]
        job["salary_with_currency"] = match["salary_with_currency"]
        job['tfidf_similarity'] = match['tfidf_similarity']
        job['semantic_similarity'] = match['semantic_similarity']
        job['skill_match_score'] = match['skill_match_score']
        job['experience_match_score'] = match['experience_match_score']
        
        # Get application status
        job_application = await db_ops.get_user_to_job(user.email, job_id)
        job["application_status"] = job_application.application_status.value if job_application else "Pending"
    
    # Sort with a more efficient lambda
    return sorted(
        json_response,
        key=lambda x: (str(x.get("date_posted", "")), x.get("match_score", 0)),
        reverse=True
    )