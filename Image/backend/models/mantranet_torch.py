import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import cv2
import os


class SimpleManTraNet(nn.Module):
    """
    A lightweight CNN that mimics the behavior of ManTraNet for localizing
    tampered regions in an image. It’s a simplified architecture to keep
    GPU memory usage low (runs fine on GTX 1050 4GB).
    """
    def __init__(self):
        super(SimpleManTraNet, self).__init__()
        self.conv1 = nn.Conv2d(3, 16, 3, padding=1)
        self.conv2 = nn.Conv2d(16, 32, 3, padding=1)
        self.conv3 = nn.Conv2d(32, 64, 3, padding=1)
        self.conv4 = nn.Conv2d(64, 1, 3, padding=1)
        self.pool = nn.MaxPool2d(2, 2)
        self.up = nn.Upsample(scale_factor=2, mode='bilinear', align_corners=False)

    def forward(self, x):
        x = F.relu(self.conv1(x))
        x = self.pool(x)
        x = F.relu(self.conv2(x))
        x = F.relu(self.conv3(x))
        x = self.up(x)
        x = torch.sigmoid(self.conv4(x))
        return x


class ManTraNetTorch:
    """
    Wrapper around the lightweight PyTorch model to:
      - Load and preprocess input images
      - Perform inference
      - Generate normalized heatmaps
    """
    def __init__(self, device=None):
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        print(f"🧠 Using device: {self.device}")
        self.model = SimpleManTraNet().to(self.device)
        self.model.eval()

    def preprocess_image(self, image_path):
        """Loads and normalizes an image for inference"""
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Cannot load image from path: {image_path}")
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = cv2.resize(img, (256, 256))
        img = img.astype(np.float32) / 255.0
        tensor = torch.tensor(img).permute(2, 0, 1).unsqueeze(0).to(self.device)
        return tensor

    def predict_heatmap(self, image_path):
        """
        Runs the model and produces a normalized heatmap.
        Returns:
            heatmap_color (np.ndarray): Colorized tamper map
        """
        img_tensor = self.preprocess_image(image_path)

        with torch.no_grad():
            pred = self.model(img_tensor).cpu().numpy().squeeze()

        # Normalize to [0, 1]
        heatmap = (pred - pred.min()) / (pred.max() - pred.min() + 1e-8)
        heatmap_uint8 = (heatmap * 255).astype(np.uint8)

        # Apply colormap for visualization
        heatmap_color = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)

        return heatmap_color
