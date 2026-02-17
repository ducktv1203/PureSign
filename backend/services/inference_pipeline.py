import numpy as np
from PIL import Image
import cv2
from io import BytesIO
from typing import Dict, Optional, Tuple
import torch
import torch.nn as nn
from ultralytics import YOLO
import os
from services.storage_service import StorageService


class SiameseNetwork(nn.Module):
    """Siamese Network for signature verification using VGG16 backbone"""
    
    def __init__(self):
        super(SiameseNetwork, self).__init__()
        # Use VGG16 as backbone
        from torchvision.models import vgg16
        vgg = vgg16(pretrained=True)
        # Remove the classifier
        self.features = nn.Sequential(*list(vgg.features.children())[:-1])
        # Add custom layers
        self.fc = nn.Sequential(
            nn.AdaptiveAvgPool2d((7, 7)),
            nn.Flatten(),
            nn.Linear(512 * 7 * 7, 4096),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(4096, 256)
        )
    
    def forward_one(self, x):
        x = self.features(x)
        x = self.fc(x)
        return x
    
    def forward(self, input1, input2):
        output1 = self.forward_one(input1)
        output2 = self.forward_one(input2)
        return output1, output2


class CycleGANGenerator(nn.Module):
    """Simplified CycleGAN generator for signature cleaning"""
    
    def __init__(self):
        super(CycleGANGenerator, self).__init__()
        # Simplified generator architecture
        self.model = nn.Sequential(
            nn.ReflectionPad2d(3),
            nn.Conv2d(3, 64, 7),
            nn.InstanceNorm2d(64),
            nn.ReLU(inplace=True),
            
            # Downsampling
            nn.Conv2d(64, 128, 3, stride=2, padding=1),
            nn.InstanceNorm2d(128),
            nn.ReLU(inplace=True),
            nn.Conv2d(128, 256, 3, stride=2, padding=1),
            nn.InstanceNorm2d(256),
            nn.ReLU(inplace=True),
            
            # Residual blocks
            *[self._make_residual_block(256) for _ in range(6)],
            
            # Upsampling
            nn.ConvTranspose2d(256, 128, 3, stride=2, padding=1, output_padding=1),
            nn.InstanceNorm2d(128),
            nn.ReLU(inplace=True),
            nn.ConvTranspose2d(128, 64, 3, stride=2, padding=1, output_padding=1),
            nn.InstanceNorm2d(64),
            nn.ReLU(inplace=True),
            
            nn.ReflectionPad2d(3),
            nn.Conv2d(64, 3, 7),
            nn.Tanh()
        )
    
    def _make_residual_block(self, channels):
        return nn.Sequential(
            nn.ReflectionPad2d(1),
            nn.Conv2d(channels, channels, 3),
            nn.InstanceNorm2d(channels),
            nn.ReLU(inplace=True),
            nn.ReflectionPad2d(1),
            nn.Conv2d(channels, channels, 3),
            nn.InstanceNorm2d(channels)
        )
    
    def forward(self, x):
        return self.model(x)


class InferencePipeline:
    def __init__(self):
        self.yolo_model = None
        self.cyclegan_model = None
        self.siamese_model = None
        self.storage_service = StorageService()
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self._load_models()
    
    def _load_models(self):
        """Load all AI models"""
        try:
            # Load YOLOv11 model for signature detection
            model_path = os.getenv("YOLO_MODEL_PATH", "yolov11n.pt")
            self.yolo_model = YOLO(model_path)
            print(f"Loaded YOLO model: {model_path}")
            
            # Initialize CycleGAN generator (will need trained weights)
            self.cyclegan_model = CycleGANGenerator().to(self.device)
            cyclegan_path = os.getenv("CYCLEGAN_MODEL_PATH")
            if cyclegan_path and os.path.exists(cyclegan_path):
                self.cyclegan_model.load_state_dict(torch.load(cyclegan_path, map_location=self.device))
                self.cyclegan_model.eval()
                print(f"Loaded CycleGAN model: {cyclegan_path}")
            else:
                print("Warning: CycleGAN model not found. Using placeholder.")
            
            # Initialize Siamese Network (will need trained weights)
            self.siamese_model = SiameseNetwork().to(self.device)
            siamese_path = os.getenv("SIAMESE_MODEL_PATH")
            if siamese_path and os.path.exists(siamese_path):
                self.siamese_model.load_state_dict(torch.load(siamese_path, map_location=self.device))
                self.siamese_model.eval()
                print(f"Loaded Siamese model: {siamese_path}")
            else:
                print("Warning: Siamese model not found. Using placeholder.")
                
        except Exception as e:
            print(f"Error loading models: {e}")
            print("Continuing with placeholder models...")
    
    def _bytes_to_image(self, image_bytes: bytes) -> Image.Image:
        """Convert bytes to PIL Image"""
        return Image.open(BytesIO(image_bytes)).convert("RGB")
    
    def _image_to_bytes(self, image: Image.Image, format: str = "JPEG") -> bytes:
        """Convert PIL Image to bytes"""
        buffer = BytesIO()
        image.save(buffer, format=format)
        return buffer.getvalue()
    
    async def _detect_signature(self, image_bytes: bytes) -> Tuple[Optional[Image.Image], Optional[Dict]]:
        """
        Step A: Detect signature using YOLOv11
        Returns: (cropped_signature_image, detection_info)
        """
        try:
            image = self._bytes_to_image(image_bytes)
            image_np = np.array(image)
            
            # Run YOLO detection
            results = self.yolo_model(image_np, conf=0.25)
            
            # Find signature bounding box (assuming class 0 or highest confidence)
            best_box = None
            best_conf = 0
            
            for result in results:
                boxes = result.boxes
                if boxes is not None and len(boxes) > 0:
                    for box in boxes:
                        conf = float(box.conf[0])
                        if conf > best_conf:
                            best_conf = conf
                            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                            best_box = (int(x1), int(y1), int(x2), int(y2))
            
            if best_box is None:
                # Fallback: use center crop if no detection
                w, h = image.size
                margin = min(w, h) // 4
                best_box = (margin, margin, w - margin, h - margin)
            
            # Crop signature
            x1, y1, x2, y2 = best_box
            cropped = image.crop((x1, y1, x2, y2))
            
            detection_info = {
                "bbox": best_box,
                "confidence": best_conf
            }
            
            return cropped, detection_info
            
        except Exception as e:
            print(f"Error in signature detection: {e}")
            # Fallback: return original image
            return self._bytes_to_image(image_bytes), None
    
    async def _clean_signature(self, signature_image: Image.Image) -> Image.Image:
        """
        Step B: Clean signature using CycleGAN
        Removes background artifacts, stamps, lines, etc.
        """
        try:
            if self.cyclegan_model is None:
                # Placeholder: convert to grayscale and enhance contrast
                img = np.array(signature_image)
                gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
                # Apply thresholding
                _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
                # Convert back to RGB
                cleaned = cv2.cvtColor(thresh, cv2.COLOR_GRAY2RGB)
                return Image.fromarray(cleaned)
            
            # Resize to model input size
            input_size = (256, 256)
            img_resized = signature_image.resize(input_size)
            img_tensor = torch.from_numpy(np.array(img_resized)).float()
            img_tensor = img_tensor.permute(2, 0, 1).unsqueeze(0) / 255.0
            img_tensor = (img_tensor - 0.5) / 0.5  # Normalize to [-1, 1]
            img_tensor = img_tensor.to(self.device)
            
            with torch.no_grad():
                output = self.cyclegan_model(img_tensor)
                output = (output + 1) / 2  # Denormalize
                output = output.squeeze(0).permute(1, 2, 0).cpu().numpy()
                output = np.clip(output * 255, 0, 255).astype(np.uint8)
                cleaned = Image.fromarray(output)
                # Resize back to original size
                cleaned = cleaned.resize(signature_image.size)
            
            return cleaned
            
        except Exception as e:
            print(f"Error in signature cleaning: {e}")
            return signature_image
    
    async def _verify_signature(self, cleaned_sig: Image.Image, reference_sig_url: str) -> float:
        """
        Step C: Verify signature using Siamese Network
        Returns: confidence score (0-1)
        """
        try:
            # Download reference signature
            reference_bytes = await self.storage_service.download_file(reference_sig_url)
            reference_image = self._bytes_to_image(reference_bytes)
            
            # Preprocess images
            def preprocess(img: Image.Image) -> torch.Tensor:
                img = img.resize((224, 224))
                img_tensor = torch.from_numpy(np.array(img)).float()
                img_tensor = img_tensor.permute(2, 0, 1).unsqueeze(0) / 255.0
                # Normalize with ImageNet stats
                mean = torch.tensor([0.485, 0.456, 0.406]).view(1, 3, 1, 1)
                std = torch.tensor([0.229, 0.224, 0.225]).view(1, 3, 1, 1)
                img_tensor = (img_tensor - mean) / std
                return img_tensor.to(self.device)
            
            cleaned_tensor = preprocess(cleaned_sig)
            reference_tensor = preprocess(reference_image)
            
            if self.siamese_model is None:
                # Placeholder: simple pixel difference
                cleaned_np = np.array(cleaned_sig.resize((224, 224))).astype(float)
                ref_np = np.array(reference_image.resize((224, 224))).astype(float)
                diff = np.abs(cleaned_np - ref_np).mean()
                similarity = 1.0 - min(diff / 255.0, 1.0)
                return float(similarity)
            
            # Get embeddings from Siamese Network
            with torch.no_grad():
                emb1, emb2 = self.siamese_model(cleaned_tensor, reference_tensor)
                # Calculate Euclidean distance
                distance = torch.nn.functional.pairwise_distance(emb1, emb2)
                # Convert distance to similarity score (0-1)
                # Using sigmoid to map distance to [0, 1]
                similarity = torch.sigmoid(-distance + 5.0).item()
            
            return float(similarity)
            
        except Exception as e:
            print(f"Error in signature verification: {e}")
            return 0.5  # Default neutral score
    
    async def process(self, image_bytes: bytes, reference_sig_url: str, verification_id: str) -> Dict:
        """
        Main processing pipeline:
        1. Detect signature
        2. Clean signature
        3. Verify signature
        """
        # Step A: Detection
        detected_sig, detection_info = await self._detect_signature(image_bytes)
        detected_bytes = self._image_to_bytes(detected_sig) if detected_sig else None
        
        # Step B: Cleaning
        cleaned_sig = await self._clean_signature(detected_sig)
        cleaned_bytes = self._image_to_bytes(cleaned_sig)
        
        # Step C: Verification
        confidence_score = await self._verify_signature(cleaned_sig, reference_sig_url)
        
        return {
            "detected_sig": detected_bytes,
            "cleaned_sig": cleaned_bytes,
            "confidence_score": confidence_score,
            "detection_info": detection_info
        }

