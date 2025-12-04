import os
from sqlalchemy import create_engine
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.getenv("CONNECTION")

if DB_URL is None:
    raise ValueError("DATABASE_URL is not set in the environment")

engine = create_engine(DB_URL)
