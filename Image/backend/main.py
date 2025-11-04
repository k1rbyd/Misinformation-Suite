from fastapi import FastAPI, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
import io
import numpy as np
import cv2
import math
import base64
import torch
import os

# Import the PyTorch-based ManTraNet
from models.mantranet_torch import ManTraNetTorch

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load ManTraNet (PyTorch)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
mantranet_model = ManTraNetTorch(device=device)

# ---------- Utility functions ----------

def image_from_uploadfile(upload_file: UploadFile) -> Image.Image:
    """Convert UploadFile -> PIL image"""
    contents = upload_file.file.read()
    return Image.open(io.BytesIO(contents)).convert("RGB")


def error_level_analysis(pil_img: Image.Image, resave_quality: int = 90):
    """ELA = difference between original and resaved image"""
    buf = io.BytesIO()
    pil_img.save(buf, format="JPEG", quality=resave_quality)
    buf.seek(0)
    resaved = Image.open(buf).convert("RGB")

    orig_np = np.asarray(pil_img).astype(np.int16)
    resaved_np = np.asarray(resaved).astype(np.int16)
    ela_np = np.abs(orig_np - resaved_np).astype(np.uint8)

    ela_gray = cv2.cvtColor(ela_np, cv2.COLOR_RGB2GRAY)
    mean = float(np.mean(ela_gray) / 255.0)
    std = float(np.std(ela_gray) / 255.0)
    return ela_gray, mean, std


def edge_density(pil_img: Image.Image) -> float:
    """Compute ratio of edge pixels using Canny"""
    img = np.asarray(pil_img)
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    edges = cv2.Canny(gray, 100, 200)
    return float(np.count_nonzero(edges)) / float(edges.size)


def chroma_anomaly_score(pil_img: Image.Image) -> float:
    """Detect anomalies between color channels"""
    arr = np.asarray(pil_img).astype(np.float32) / 255.0
    r_var = np.var(arr[:, :, 0])
    g_var = np.var(arr[:, :, 1])
    b_var = np.var(arr[:, :, 2])
    mean_var = (r_var + g_var + b_var) / 3.0
    diff = (abs(r_var - mean_var) + abs(g_var - mean_var) + abs(b_var - mean_var)) / 3.0
    return float(np.tanh(diff * 10.0))


def compute_score(ela_mean, ela_std, edge_dens, chroma_anom):
    """Combine features to get score in [0, 1]"""
    w_ela_mean = 5.0
    w_ela_std = 3.0
    w_edge = -4.0
    w_chroma = 3.0

    susp = (w_ela_mean * ela_mean) + (w_ela_std * ela_std) + (w_edge * edge_dens) + (w_chroma * chroma_anom)
    prob_susp = 1.0 / (1.0 + math.exp(-susp))
    score = 1.0 - prob_susp
    return max(0.0, min(1.0, score))


def generate_basic_heatmap(pil_img: Image.Image, ela_gray: np.ndarray) -> str:
    """Basic heatmap: ELA + edges"""
    img = np.asarray(pil_img)
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    edges = cv2.Canny(gray, 100, 200)
    edges = cv2.GaussianBlur(edges, (5, 5), 0)
    ela_norm = cv2.normalize(ela_gray, None, 0, 255, cv2.NORM_MINMAX)
    combined = cv2.addWeighted(ela_norm.astype(np.float32), 0.7, edges.astype(np.float32), 0.3, 0)
    combined = cv2.GaussianBlur(combined, (3, 3), 0)
    heatmap = cv2.applyColorMap(combined.astype(np.uint8), cv2.COLORMAP_JET)
    overlay = cv2.addWeighted(img, 0.6, heatmap, 0.8, 0)
    _, buffer = cv2.imencode(".png", cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR))
    heatmap_b64 = base64.b64encode(buffer).decode("utf-8")
    return f"data:image/png;base64,{heatmap_b64}"


def generate_advanced_heatmap(pil_img: Image.Image):
    """Advanced heatmap: PyTorch ManTraNet + metrics"""
    try:
        temp_path = "temp_input.png"
        pil_img.save(temp_path)

        # Predict with ManTraNet
        heatmap = mantranet_model.predict_heatmap(temp_path)
        os.remove(temp_path)

        # --- Metrics ---
        ela_img, ela_mean, ela_std = error_level_analysis(pil_img)
        edge_d = edge_density(pil_img)
        chroma = chroma_anomaly_score(pil_img)
        score = compute_score(ela_mean, ela_std, edge_d, chroma)

        metrics = {
            "ELA Mean": round(ela_mean, 4),
            "ELA StdDev": round(ela_std, 4),
            "Edge Density": round(edge_d, 4),
            "Chroma Anomaly": round(chroma, 4),
            "Tamper Confidence": round(score, 4),
        }

        # Encode heatmap to base64
        _, buffer = cv2.imencode(".png", cv2.cvtColor(heatmap, cv2.COLOR_RGB2BGR))
        heatmap_b64 = base64.b64encode(buffer).decode("utf-8")

        return f"data:image/png;base64,{heatmap_b64}", metrics
    except Exception as e:
        print(f"[Advanced Heatmap Error] {e}")
        return None, {}


# ---------- API ----------

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...), mode: str = Query("basic", enum=["basic", "advanced"])):
    """
    mode: "basic" (default ELA-based heatmap)
          "advanced" (ManTraNet PyTorch localization)
    """
    try:
        pil_img = image_from_uploadfile(file)
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": f"Invalid image: {e}"})

    # Compute features
    ela_img, ela_mean, ela_std = error_level_analysis(pil_img)
    edge_d = edge_density(pil_img)
    chroma = chroma_anomaly_score(pil_img)
    score = compute_score(ela_mean, ela_std, edge_d, chroma)
    label = "Real" if score >= 0.5 else "Fake"

    # change here


    # Generate heatmap and metrics
    if mode == "advanced":
        heatmap_url, metrics = generate_advanced_heatmap(pil_img)
        if heatmap_url is None:
            heatmap_url = generate_basic_heatmap(pil_img, ela_img)
            metrics = {}
    else:
        heatmap_url = generate_basic_heatmap(pil_img, ela_img)
        metrics = {
            "ELA Mean": round(ela_mean, 4),
            "ELA StdDev": round(ela_std, 4),
            "Edge Density": round(edge_d, 4),
            "Chroma Anomaly": round(chroma, 4),
            "Tamper Confidence": round(score, 4),
        }

    return {
        "status": "success",
        "score": round(score, 4),
        "label": label,
        "mode": mode,
        "heatmap": heatmap_url,
        "metrics": metrics,
    }


@app.get("/")
def root():
    return {"message": "Fake Image Detector API (Basic + Advanced PyTorch) is live"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
