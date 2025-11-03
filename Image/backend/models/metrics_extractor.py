import cv2
import numpy as np

def compute_metrics(image, heatmap):
    # Ensure both are same size
    heatmap = cv2.resize(heatmap, (image.shape[1], image.shape[0]))
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)

    # Create binary tampered mask (top 10% confidence as tampered)
    mask = (heatmap > np.percentile(heatmap, 90)).astype(np.uint8)

    # Split regions
    tampered = gray[mask == 1]
    clean = gray[mask == 0]

    # Safety checks
    if len(tampered) == 0 or len(clean) == 0:
        return {m: 0.0 for m in [
            "Noise Analysis", "JPEG Artifacts", "Color Inconsistency",
            "Edge Discontinuity", "Lighting Mismatch", "Shadow Irregularity"
        ]}

    # ---- Compute Metrics ----
    def normalize(v): return float(np.clip(v * 100, 0, 100))

    # 1️⃣ Noise (variance difference)
    noise_conf = np.abs(np.var(tampered) - np.var(clean)) / np.var(clean + 1e-5)

    # 2️⃣ JPEG Artifacts (block DCT discontinuity)
    block_size = 8
    dct_var = 0
    for i in range(0, gray.shape[0], block_size):
        for j in range(0, gray.shape[1], block_size):
            block = gray[i:i+block_size, j:j+block_size]
            if block.shape == (block_size, block_size):
                dct = cv2.dct(np.float32(block))
                dct_var += np.var(dct)
    jpeg_conf = dct_var / (gray.shape[0] * gray.shape[1] / 64)

    # 3️⃣ Color inconsistency (mean RGB difference)
    mean_diff = np.mean(np.abs(np.mean(image[mask == 1], axis=0) - np.mean(image[mask == 0], axis=0)))
    color_conf = mean_diff / 128.0

    # 4️⃣ Edge discontinuity
    edges = cv2.Sobel(gray, cv2.CV_64F, 1, 1, ksize=3)
    edge_conf = np.abs(np.mean(edges[mask == 1]) - np.mean(edges[mask == 0])) / 255.0

    # 5️⃣ Lighting mismatch (V-channel gradient)
    hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
    grad_v = cv2.Laplacian(hsv[:, :, 2], cv2.CV_64F)
    light_conf = np.abs(np.mean(grad_v[mask == 1]) - np.mean(grad_v[mask == 0])) / 10.0

    # 6️⃣ Shadow irregularity (shadow value difference)
    shadow_conf = np.abs(np.mean(hsv[:, :, 2][mask == 1]) - np.mean(hsv[:, :, 2][mask == 0])) / 50.0

    return {
        "Noise Analysis": normalize(noise_conf),
        "JPEG Artifacts": normalize(jpeg_conf),
        "Color Inconsistency": normalize(color_conf),
        "Edge Discontinuity": normalize(edge_conf),
        "Lighting Mismatch": normalize(light_conf),
        "Shadow Irregularity": normalize(shadow_conf),
    }
