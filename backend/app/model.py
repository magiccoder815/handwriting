from pathlib import Path
import tensorflow as tf

MODEL_PATH = Path(__file__).resolve().parent.parent / "model_mnist.h5"

_model = None

def load_model():
    global _model
    if _model is None:
        if not MODEL_PATH.exists():
            raise RuntimeError(
                f"Model weights not found at {MODEL_PATH}. Run train_mnist.py first."
            )
        _model = tf.keras.models.load_model(str(MODEL_PATH))
    return _model


def predict_batch(images):
    """images: numpy array shape (N, 28, 28, 1) normalized [0,1]
       returns: probs (N,10), preds (N,)"""
    model = load_model()
    probs = model.predict(images, verbose=0)
    preds = probs.argmax(axis=1)
    return probs, preds
