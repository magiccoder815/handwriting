# Handwritten Number Recognizer — React Canvas + FastAPI

Write digits like `23435` on a canvas; the backend segments per digit and predicts with an MNIST CNN.

## Stack
- Frontend: React + HTML Canvas (Vite)
- Backend: FastAPI, TensorFlow (CPU), OpenCV

## Quick Start

### 1) Backend
```bash
cd backend
python -m venv .venv
# macOS/Linux
source .venv/bin/activate
# Windows PowerShell
# .venv\Scripts\Activate.ps1

pip install -r requirements.txt
python train_mnist.py
uvicorn app.main:app --reload --port 8000
```

### 2) Frontend
```bash
cd frontend
npm i
npm run dev
```

Open the dev URL (usually http://localhost:5173). Make sure the API is at http://localhost:8000 or change `VITE_API_URL` in `frontend/.env`.

## Notes
- Leave small gaps between digits so the simple vertical-projection segmenter can split them.
- Improve accuracy by training on your own captures or upgrading to a CRNN+CTC sequence model.
