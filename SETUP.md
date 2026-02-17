# PureSign Setup Guide

## Prerequisites

- Python 3.9+
- Node.js 18+
- Supabase account
- (Optional) CUDA-capable GPU for faster inference

## Step 1: Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor and run the SQL script from `database/schema.sql`
3. Go to Storage and create a new bucket named `puresign-storage` (make it public)
4. Get your Supabase URL and anon key from Settings > API

## Step 2: Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your Supabase credentials

# Download YOLOv11 model (will auto-download on first run, or download manually)
# The model will be downloaded automatically when you first run the app

# Run the server
uvicorn main:app --reload
```

The backend will be available at `http://localhost:8000`

## Step 3: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your API URL and Supabase credentials

# Run development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Step 4: Model Setup (Optional)

### Pre-trained Models

For production use, you'll need to train or obtain:

1. **YOLOv11 Model**: Already included via ultralytics (auto-downloads)
2. **CycleGAN Model**: Train on signature cleaning dataset
   - Save as `models/cyclegan_generator.pth`
   - Set `CYCLEGAN_MODEL_PATH` in `.env`
3. **Siamese Network Model**: Train on signature verification dataset
   - Save as `models/siamese_network.pth`
   - Set `SIAMESE_MODEL_PATH` in `.env`

### Placeholder Mode

The system works in placeholder mode without trained models:
- YOLO: Uses default YOLOv11n for detection
- CycleGAN: Uses basic image processing (thresholding)
- Siamese: Uses simple pixel difference comparison

## Step 5: Create Test Profile

You'll need to create a user profile with a reference signature:

```sql
INSERT INTO profiles (user_name, reference_sig_url)
VALUES ('Test User', 'https://your-supabase-url/storage/v1/object/public/puresign-storage/reference_sigs/test_sig.jpg');
```

Or use the Supabase dashboard to:
1. Upload a reference signature to the storage bucket
2. Create a profile record with the signature URL

## Testing

1. Start both backend and frontend servers
2. Navigate to `http://localhost:5173`
3. Click "Verify New Document"
4. Upload a document image
5. View the 3-step visualization and confidence score

## Troubleshooting

### Backend Issues

- **Import errors**: Make sure virtual environment is activated
- **Model loading errors**: Models will use placeholder implementations if not found
- **Supabase connection**: Check your `.env` file has correct credentials

### Frontend Issues

- **API connection**: Ensure backend is running on port 8000
- **CORS errors**: Check backend CORS settings in `main.py`
- **Build errors**: Run `npm install` again

### Storage Issues

- Ensure Supabase Storage bucket is public
- Check file paths are correct
- Verify Supabase credentials

## Production Deployment

1. Set up environment variables in your hosting platform
2. Build frontend: `npm run build`
3. Serve frontend static files
4. Deploy backend (e.g., Railway, Render, AWS)
5. Update CORS origins in `main.py` to include production URL

