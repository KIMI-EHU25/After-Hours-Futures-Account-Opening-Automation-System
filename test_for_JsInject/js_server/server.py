from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware

BASE_DIR = Path(__file__).resolve().parent
JS_FILE = BASE_DIR / "download.js"

app = FastAPI(title="JS Download Test Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", response_class=HTMLResponse)
def index() -> str:
    return """
    <!doctype html>
    <html lang="zh-CN">
      <head><meta charset="utf-8"><title>JS 下载测试</title></head>
      <body>
        <h1>JS 下载服务器运行成功</h1>
        <p>JS 地址：<a href="/script.js">/script.js</a></p>
      </body>
    </html>
    """


@app.get("/script.js", include_in_schema=False)
def download_script() -> FileResponse:
    return FileResponse(
        path=JS_FILE,
        media_type="application/javascript; charset=utf-8",
        filename="download.js",
        content_disposition_type="inline",
        headers={"Cache-Control": "no-store"},
    )