# Resume Analyser

> **NLP-powered resume screening & candidate ranking** — A precision instrument for evaluating job applicants at scale.

![Version](https://img.shields.io/badge/version-2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Python](https://img.shields.io/badge/python-3.9%2B-blue)
![React](https://img.shields.io/badge/react-19-blue)

## Overview

Resume Analyser automates the initial screening of job applications using advanced NLP keyword matching. Upload resumes, define job requirements (must-have and nice-to-have skills), and instantly receive ranked candidates with detailed skill gap analysis.

**Key Features:**
- 🎯 **Weighted Scoring** — Must-have keywords (70%) vs nice-to-have (30%)
- 🔍 **Smart Matching** — Word-boundary regex + lemmatization (catches "managing" ↔ "manage")
- 📊 **Interactive Dashboard** — Real-time results with accordion-expandable candidate details
- 🚀 **Spring Animations** — Framer Motion with smooth transitions and count-up effects
- 📥 **Batch Upload** — Drag-and-drop support for PDF, DOCX, and TXT files
- ⬇️ **CSV Export** — Download results for further analysis

## Tech Stack

### Frontend
- **React 19** with Vite
- **Framer Motion** — Physics-based animations
- **Tailwind CSS** — Utility-first styling
- **Axios** — HTTP client for API calls
- **Google Fonts** — Space Grotesk, Inter, JetBrains Mono

### Backend
- **FastAPI** — Async Python web framework
- **spaCy** — NLP (lemmatization, POS tagging)
- **pdfminer.six** — PDF text extraction
- **python-docx** — DOCX parsing
- **Uvicorn** — ASGI server

## Installation

### Prerequisites
- Python 3.9+
- Node.js 16+ and npm

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Tanya-Gitt/Resume-analyser.git
   cd Resume-analyser
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   python -m spacy download en_core_web_sm
   ```

3. **Install frontend dependencies:**
   ```bash
   npm install
   ```

## Quick Start

**One command to start both servers:**
```bash
./start.sh
```

This launches:
- **Frontend:** `http://localhost:5176`
- **Backend API:** `http://localhost:8002`

Or run separately:

```bash
# Terminal 1: Backend API
python -m uvicorn api:app --port 8002 --reload

# Terminal 2: Frontend
npm run dev
```

## Usage

1. **Define Requirements:**
   - Paste a job description or manually add keywords
   - Use "Auto-extract" to pull keywords from the job description
   - Mark skills as must-have (weighted 70%) or nice-to-have (30%)

2. **Upload Resumes:**
   - Drag and drop resume files (PDF, DOCX, TXT)
   - Or click to browse and select files

3. **Analyse:**
   - Click "Analyse →" to process all resumes
   - Results display instantly with candidate scores and rankings

4. **Review Results:**
   - Expand each candidate to see matched and missing skills
   - Color-coded chips: green (matched), red (missing), blue (nice-to-have matched), yellow (nice-to-have missing)
   - Export results as CSV for further processing

## Algorithm Details

### Scoring Formula
```
Total Score = 70% × (Matched Must-Have / Total Must-Have) 
            + 30% × (Matched Nice-to-Have / Total Nice-to-Have)
```

If only must-have keywords are provided, the score is 100% based on must-have matches.

### Matching Strategy
1. **Lemmatization** — Both job description keywords and resume text are lemmatized (e.g., "managed" → "manage")
2. **Word-Boundary Regex** — Prevents false positives (e.g., "java" won't match "javascript")
3. **Case-Insensitive** — All matching is case-insensitive
4. **Frequency Tracking** — Matched keywords show occurrence count

### Text Extraction
- **PDF:** Uses `pdfminer.six` for robust text extraction
- **DOCX:** Extracts text from paragraphs and tables
- **TXT:** Direct UTF-8 decoding with error handling

## API Reference

### POST `/api/analyze`
Analyzes uploaded resumes against keywords.

**Request:**
```bash
curl -X POST http://localhost:8002/api/analyze \
  -F "files=@resume1.pdf" \
  -F "must_keywords=python,FastAPI,PostgreSQL" \
  -F "nice_keywords=kubernetes,terraform"
```

**Response:**
```json
{
  "results": [
    {
      "name": "resume1.pdf",
      "score": 100.0,
      "must_score": 100.0,
      "nice_score": 100.0,
      "must_matches": { "python": 4, "FastAPI": 3 },
      "must_missing": [],
      "nice_matches": { "kubernetes": 2 },
      "nice_missing": []
    }
  ]
}
```

### POST `/api/extract`
Extracts keywords from a job description.

**Request:**
```bash
curl -X POST http://localhost:8002/api/extract \
  -H "Content-Type: application/json" \
  -d '{"job_description": "Senior Python engineer..."}'
```

**Response:**
```json
{ "keywords": ["python", "engineer", "experience"] }
```

## File Formats Supported

| Format | Extension | Status |
|--------|-----------|--------|
| PDF | `.pdf` | ✅ Supported |
| Word | `.docx` | ✅ Supported |
| Text | `.txt` | ✅ Supported |

## Design Philosophy

The UI follows a **"cold data"** design language—precision meets editorial design. Every element serves a function:

- **Large Score Numbers** — The data is the hero
- **Spring Physics** — Organic, alive animations
- **Monospace Data** — Authority through typography
- **High Contrast Dark** — Near-black (`#080808`) background for maximum contrast
- **Minimal Decoration** — No gradients, no noise, pure function

## Configuration

### Ports
- **Frontend:** `5176` (in `vite.config.js`)
- **Backend:** `8002` (command-line argument to uvicorn)

## Development

### Project Structure
```
resume-analyser/
├── src/
│   ├── components/        # React components (Sidebar, ResultsPanel, CandidateRow, etc.)
│   ├── App.jsx            # Main app component
│   └── index.css          # Global styles
├── api.py                 # FastAPI backend
├── keyword_matcher.py     # NLP matching logic
├── resume_parser.py       # File parsing (PDF/DOCX/TXT)
├── package.json           # Frontend dependencies
├── requirements.txt       # Python dependencies
└── start.sh              # One-command startup script
```

### Testing
Test data in `test_resumes/` includes 4 sample resumes with known scores:
- `alice_chen.txt` — 100% (senior engineer, all skills match)
- `carol_diaz.txt` — 100% (backend engineer, all skills match)
- `bob_martin.txt` — 47% (mid-level, missing FastAPI & PostgreSQL)
- `david_nguyen.txt` — 12% (junior, minimal Python-only)

Test the API:
```bash
curl -X POST http://localhost:8002/api/analyze \
  -F "files=@test_resumes/alice_chen.txt" \
  -F "must_keywords=python,FastAPI,PostgreSQL,docker" \
  -F "nice_keywords=kubernetes,terraform"
```

## Performance

- **Processing:** ~200-500ms per resume
- **Throughput:** 1000+ resumes supported
- **Memory:** ~150MB base + ~2MB per resume

## Known Limitations

- **Language:** English only (spaCy `en_core_web_sm`)
- **Context:** Keyword matching only; no semantic understanding
- **Acronyms:** Use lowercase in keywords
- **Concurrency:** Single-threaded processing (sequential)

## Future Roadmap

- [ ] Transformer embeddings (BERT/RoBERTa) for semantic matching
- [ ] Multi-language support
- [ ] Fuzzy matching for typos
- [ ] Per-keyword importance weights
- [ ] Interview question generation
- [ ] ATS integrations (Greenhouse, Lever, Workday)
- [ ] Batch job scheduling
- [ ] Analytics dashboard

## License

MIT License — See `LICENSE` for details.

## Support

**Found a bug?** [Open an issue](https://github.com/Tanya-Gitt/Resume-analyser/issues)

**Have a question?** Check the [API Reference](#api-reference) or test with `test_resumes/`

---

**Made by [Tanya-Gitt](https://github.com/Tanya-Gitt)** | Star this repo if it's useful ⭐
