from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import torch
from model import DigitCNN
from utils import preprocess_and_segment

app = FastAPI()

# Allow frontend React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model
model = DigitCNN()
model.load_state_dict(torch.load("mnist_cnn.pth", map_location="cpu"))
model.eval()

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    image = Image.open(file.file).convert("RGB")

    # Segment digits
    digits = preprocess_and_segment(image)

    predictions = []
    for d in digits:
        tensor = torch.tensor(d).unsqueeze(0)  # batch=1
        with torch.no_grad():
            output = model(tensor)
            pred = output.argmax(dim=1).item()
            predictions.append(str(pred))

    return {"prediction": "".join(predictions)}
