from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import (
    launderingBack_routers,
    addInfo_routers,
    question_routers,
    chooseFutures_routers,
    jsinject_router,
    code_routers,
    auth_routers,
)

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
app.include_router(code_routers.router)
app.include_router(auth_routers.router)