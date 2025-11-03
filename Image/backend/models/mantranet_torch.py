import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import cv2
import os

class SimpleManTraNet(nn.Module):
    def __init__(self):
        super(SimpleManTraNet, self).__init__()
        self.conv1 = nn.Conv2d(3, 16, 3, padding=1)
        self.conv2 = nn.Conv2d(16, 32, 3, padding=1)
        self.conv3 = nn.Conv2d(32, 1, 3, padding=1)
        self.pool = nn.MaxPool2d(2, 2)
        self.up = nn.Upsample(scale_factor=2, mode='bilinear', align_corners=False)

    def forward(self, x):
        x1 = F.relu(self.conv1(x))
        x2 = self.pool(x1)
        x3 = F.relu(self.conv2(x2))
        x4 = self.up(x3)
        x5 = torch.sigmoid(self.conv3(x4))
        return x5

class ManTraNetTorch:
    def __init__(self, device=None):
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        print(f"🧠 Using device: {self.device}")
        self.model = SimpleManTraNet().to(self.device)
        self.model.eval()

    def predict_heatmap(self, image_path):
        # Load image
        img = cv2.imread(image_path)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = cv2.resize(img, (256, 256)) / 255.0
        img_tensor = torch.tensor(img, dtype=torch.float32).permute(2, 0, 1).unsqueeze(0).to(self.device)

        with torch.no_grad():
            pred = self.model(img_tensor).cpu().numpy().squeeze()

        # Normalize + apply colormap
        heatmap = (pred - pred.min()) / (pred.max() - pred.min() + 1e-8)
        heatmap_color = cv2.applyColorMap((heatmap * 255).astype(np.uint8), cv2.COLORMAP_JET)
        return heatmap_color
