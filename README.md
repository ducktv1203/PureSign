# PureSign - AI-Driven Forensic Signature Verification System

A full-stack application that uses AI to detect, clean, and verify signatures in documents.

## 🎯 Overview

PureSign implements a 3-step AI pipeline for forensic signature verification:

1. **Detection** → YOLOv11 locates signatures in messy documents
2. **Cleaning** → CycleGAN removes background artifacts (stamps, lines, noise)
3. **Verification** → Siamese Network compares against reference "Gold Standard"

## 🏗️ Architecture

- **Frontend**: React (Vite) + TypeScript + Tailwind CSS + react-dropzone
- **Backend**: FastAPI (Python) with PyTorch/TensorFlow
- **Database**: Supabase (PostgreSQL for logs/profiles, Storage for images)
- **AI Models**: YOLOv11, CycleGAN, Siamese Network (VGG16 backbone)

## ✨ Features

- ✅ **Signature Detection**: YOLOv11 model detects signatures in messy documents
- ✅ **Background Removal**: CycleGAN removes artifacts (stamps, lines, etc.)
- ✅ **Signature Verification**: Siamese Network compares against reference "Gold Standard"
- ✅ **Privacy Mode**: Local processing option using onnxruntime-web (client-side detection)
- ✅ **Audit Trail**: All verifications logged to database for legal non-repudiation
- ✅ **3-Step Visualization**: Real-time display of detection, cleaning, and verification results
- ✅ **Confidence Gauge**: Visual representation of match percentage

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- Supabase account

### 1. Database Setup

1. Create a Supabase project
2. Run `database/schema.sql` in the Supabase SQL Editor
3. Create a storage bucket named `puresign-storage` (make it public)
4. Get your Supabase URL and anon key

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file (see backend/.env.example)
# Add your Supabase credentials

uvicorn main:app --reload
```

Backend runs on `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend
npm install

# Create .env file (see frontend/.env.example)
# Add your API URL and Supabase credentials

npm run dev
```

Frontend runs on `http://localhost:5173`

## 📚 Documentation

- **[SETUP.md](SETUP.md)**: Detailed setup instructions
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)**: Project structure overview
- **[backend/README.md](backend/README.md)**: Backend API documentation
- **[frontend/README.md](frontend/README.md)**: Frontend component documentation

## 🔧 Environment Variables

### Backend (`backend/.env`)

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_STORAGE_BUCKET=puresign-storage
YOLO_MODEL_PATH=yolov11n.pt
CYCLEGAN_MODEL_PATH=models/cyclegan_generator.pth
SIAMESE_MODEL_PATH=models/siamese_network.pth
```

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🧪 Testing

1. Create a test profile in Supabase with a reference signature
2. Upload a reference signature to Supabase Storage
3. Navigate to the frontend and click "Verify New Document"
4. Upload a document image
5. View the 3-step visualization and confidence score

## 🔒 Privacy & Security

- **Privacy Mode**: Toggle local processing to detect signatures on-device without uploading sensitive documents
- **Audit Trail**: All verifications are logged to the database with timestamps for legal compliance
- **Non-repudiation**: Complete history of all verification attempts

## 📝 Model Training (Optional)

The system works with placeholder implementations, but for production:

1. **CycleGAN**: Train on signature cleaning dataset
2. **Siamese Network**: Train on signature verification dataset

See `SETUP.md` for details.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, react-dropzone, onnxruntime-web
- **Backend**: FastAPI, PyTorch, TensorFlow, Ultralytics, OpenCV, Pillow
- **Database**: Supabase (PostgreSQL + Storage)
- **AI**: YOLOv11, CycleGAN, Siamese Network (VGG16)

## 📄 License

This project is part of the PureSign system.

## 🤝 Contributing

See the project structure and setup guides for development guidelines.

