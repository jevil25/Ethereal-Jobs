from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load the dotenv file
load_dotenv()

def get_database():
    # Provide the mongodb atlas url to connect python to mongodb using pymongo
    CONNECTION_STRING = os.getenv("MONGO_CONNECTION_STRING")

    # Create a connection using MongoClient
    client = MongoClient(CONNECTION_STRING)

    # Create the database for our example (we will use the same database throughout the tutorial)
    return client['jobify-testing']

# This is added so that many files can reuse the function get_database()
if __name__ == "__main__":
    # Get the database
    dbname = get_database()
    print("Database connected:", dbname)