from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List
import io

from keyword_matcher import analyze_resume, extract_keywords_from_jd
from resume_parser import extract_text_from_file

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class _FakeFile:
    """Wrap FastAPI UploadFile to match the interface resume_parser expects."""
    def __init__(self, name: str, content_type: str, data: bytes):
        self.name = name
        self.type = content_type
        self._data = data

    def read(self):
        return self._data


@app.post("/api/analyze")
async def analyze(
    files: List[UploadFile] = File(...),
    must_keywords: str = Form(""),
    nice_keywords: str = Form(""),
):
    must = [k.strip() for k in must_keywords.split(",") if k.strip()]
    nice = [k.strip() for k in nice_keywords.split(",") if k.strip()]

    results = []
    for f in files:
        raw = await f.read()
        fake = _FakeFile(f.filename, f.content_type, raw)
        text = extract_text_from_file(fake)
        if text is None:
            results.append({
                "name": f.filename,
                "error": "Could not parse file",
                "score": 0,
                "must_score": 0,
                "nice_score": 0,
                "must_matches": {},
                "must_missing": must,
                "nice_matches": {},
                "nice_missing": nice,
            })
            continue

        r = analyze_resume(text, must, nice)
        results.append({"name": f.filename, **r})

    results.sort(key=lambda x: x["score"], reverse=True)
    return JSONResponse({"results": results})


@app.post("/api/extract")
async def extract(data: dict):
    jd = data.get("job_description", "")
    keywords = extract_keywords_from_jd(jd) if jd.strip() else []
    return {"keywords": keywords}
