from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import launderingBack_routers
from app.routers import addInfo_routers
from app.routers import question_routers
from app.routers import chooseFutures_routers
from app.routers import jsinject_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(launderingBack_routers.router)
app.include_router(addInfo_routers.router)
app.include_router(question_routers.router)
app.include_router(chooseFutures_routers.router)
app.include_router(jsinject_router.router)