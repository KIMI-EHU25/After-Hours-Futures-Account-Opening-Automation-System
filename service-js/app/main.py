from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware

BASE_DIR = Path(__file__).resolve().parent
JS_FILE = BASE_DIR / "script" / "main.js"

app = FastAPI(title="JS Download Test Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/script/main.js", include_in_schema=False)
def download_script() -> FileResponse:
    return FileResponse(
        path=JS_FILE,
        media_type="application/javascript; charset=utf-8",
        filename="main.js",
        content_disposition_type="inline",
        headers={"Cache-Control": "no-store"},
    )
