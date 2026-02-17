# PureSign Backend

FastAPI backend for AI-driven signature verification.

## Architecture

The backend implements a 3-step inference pipeline:

1. **Detection** (`_detect_signature`): Uses YOLOv11 to locate signatures in documents
2. **Cleaning** (`_clean_signature`): Uses CycleGAN to remove background artifacts
3. **Verification** (`_verify_signature`): Uses Siamese Network to compare against reference

## API Endpoints

### `POST /verify`
Main verification endpoint.

**Request:**
- `file`: Image file (multipart/form-data)
- `user_id`: User ID (form data)
- `local_processing`: Boolean flag (query param)

**Response:**
```json
{
  "verification_id": "uuid",
  "detected_sig_url": "https://...",
  "cleaned_sig_url": "https://...",
  "confidence_score": 0.85,
  "status": "success",
  "timestamp": "2024-01-01T00:00:00"
}
```

### `GET /verifications/{user_id}`
Get verification history for a user.

### `GET /profile/{user_id}`
Get user profile information.

## Services

### `InferencePipeline`
Main processing service that orchestrates the 3-step pipeline.

### `StorageService`
Handles file uploads/downloads to/from Supabase Storage.

### `SupabaseClient`
Manages database connections and queries.

## Model Loading

Models are loaded on startup. If model files are not found, the system uses placeholder implementations:

- **YOLO**: Uses ultralytics default model (auto-downloads)
- **CycleGAN**: Falls back to basic image processing
- **Siamese**: Falls back to pixel difference comparison

## Environment Variables

See `.env.example` for required variables.

