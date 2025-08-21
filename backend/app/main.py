from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
import numpy as np
import io

from .model import predict_batch
from .segment import segment_and_prepare

app = FastAPI(title="Handwritten Number Recognizer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

class PredictResponse(BaseModel):
    predicted: str
    boxes: list  # list of [x1,y1,x2,y2]
    per_digit: list  # list of {digit, prob}


@app.post("/predict", response_model=PredictResponse)
async def predict(image: UploadFile = File(...)):
    try:
        content = await image.read()
        pil = Image.open(io.BytesIO(content)).convert("RGBA")
        rgba = np.array(pil)
        batch, boxes = segment_and_prepare(rgba)
        if batch.shape[0] == 0:
            raise HTTPException(status_code=400, detail="No digits found. Try thicker strokes or larger canvas.")
        probs, preds = predict_batch(batch)
        digits = preds.tolist()
        # confidence per predicted class
        confs = probs.max(axis=1).tolist()
        text = "".join(str(d) for d in digits)
        return {
            "predicted": text,
            "boxes": [list(map(int, b)) for b in boxes],
            "per_digit": [{"digit": int(d), "prob": float(p)} for d, p in zip(digits, confs)],
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
