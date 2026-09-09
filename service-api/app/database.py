from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase , sessionmaker

DATABASE_URL = "postgresql+psycopg://<username>:<password>@<host>:5432/postgres"

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