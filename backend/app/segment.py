from typing import List, Tuple
import numpy as np
import cv2


def _to_grayscale_rgba_safe(img_rgba: np.ndarray) -> np.ndarray:
    """Composites RGBA over white and returns grayscale uint8."""
    if img_rgba.shape[2] == 4:
        alpha = img_rgba[:, :, 3:4] / 255.0
        rgb = img_rgba[:, :, :3].astype(np.float32)
        white = np.ones_like(rgb) * 255.0
        comp = rgb * alpha + white * (1 - alpha)
        comp = comp.astype(np.uint8)
    else:
        comp = img_rgba[:, :, :3]
    gray = cv2.cvtColor(comp, cv2.COLOR_BGR2GRAY)
    return gray


def binarize(image_rgba: np.ndarray) -> np.ndarray:
    """Return binary (0/255) image with foreground (ink) = 255 on black background."""
    gray = _to_grayscale_rgba_safe(image_rgba)
    # Invert so strokes become bright
    inv = 255 - gray
    # Slight blur to connect thin gaps
    blur = cv2.GaussianBlur(inv, (5, 5), 0)
    # Otsu threshold
    _, th = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    # Morph close to join multi-stroke digits a bit
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    th = cv2.morphologyEx(th, cv2.MORPH_CLOSE, kernel, iterations=1)
    return th


def find_digit_boxes(binary: np.ndarray) -> List[Tuple[int, int, int, int]]:
    """Greedy vertical projection segmentation.
    Returns list of boxes (x1, y1, x2, y2) in left-to-right order.
    """
    h, w = binary.shape
    col_sums = (binary > 0).sum(axis=0)
    ink_thresh = max(1, int(0.02 * h))  # column considered "inked" if >2% of rows have ink

    boxes = []
    start = None
    for x in range(w):
        if col_sums[x] > ink_thresh and start is None:
            start = x
        elif col_sums[x] <= ink_thresh and start is not None:
            end = x
            if end - start > 5:
                boxes.append((start, 0, end, h))
            start = None
    if start is not None:
        boxes.append((start, 0, w, h))

    # Refine y-bounds per box and filter tiny noise
    refined = []
    for (x1, _, x2, _) in boxes:
        clip = binary[:, x1:x2]
        row_sums = (clip > 0).sum(axis=1)
        ys = np.where(row_sums > 0)[0]
        if len(ys) == 0:
            continue
        y1, y2 = ys[0], ys[-1] + 1
        # pad a bit
        pad = 2
        y1 = max(0, y1 - pad)
        y2 = min(h, y2 + pad)
        if (x2 - x1) >= 6 and (y2 - y1) >= 6:
            refined.append((x1, y1, x2, y2))

    return refined


def crop_to_28x28(binary: np.ndarray, box: Tuple[int, int, int, int]) -> np.ndarray:
    x1, y1, x2, y2 = box
    crop = binary[y1:y2, x1:x2]
    # Create square canvas
    h, w = crop.shape
    size = max(h, w)
    square = np.zeros((size, size), dtype=np.uint8)
    # center paste (ink is 1 when >0 below)
    y_off = (size - h) // 2
    x_off = (size - w) // 2
    square[y_off:y_off + h, x_off:x_off + w] = crop
    # Resize to 28x28
    small = cv2.resize(square, (28, 28), interpolation=cv2.INTER_AREA)
    # Normalize to [0,1] with foreground=1
    small = (small > 0).astype(np.float32)
    return small


def segment_and_prepare(image_rgba: np.ndarray):
    """Return (batch_4d, boxes). batch_4d: (N,28,28,1) float32."""
    binary = binarize(image_rgba)
    boxes = find_digit_boxes(binary)
    digits = []
    for b in boxes:
        d = crop_to_28x28(binary, b)
        digits.append(d)
    if len(digits) == 0:
        return np.zeros((0, 28, 28, 1), dtype=np.float32), []
    batch = np.stack(digits, axis=0)[..., None]
    return batch, boxes
