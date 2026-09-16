from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase , sessionmaker

import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.environ["DATABASE_URL"]

engine = create_engine(
    DATABASE_URL,
    connect_args={
        "options": "-csearch_path=openaccount"
    },
)

SessionLocal = sessionmaker(
    bind  =  engine
)

def get_db() :

    db = SessionLocal()

    try : 
        yield db
    finally :
        db.close()

class Base(DeclarativeBase) :
    pass