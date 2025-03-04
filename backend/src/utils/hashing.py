from passlib.context import CryptContext
pwd_cxt = CryptContext(schemes =["bcrypt"],deprecated="auto")
import uuid

class Hash():
   def bcrypt(password:str):
      return pwd_cxt.hash(password)
   
   def verify(hashed,normal):
      return pwd_cxt.verify(normal,hashed)
   
   def generate_random_unique_string():
      return str(uuid.uuid4())
