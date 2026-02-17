# PureSign Project Structure

```
PureSign/
├── backend/                    # FastAPI backend
│   ├── main.py                # FastAPI app and endpoints
│   ├── requirements.txt       # Python dependencies
│   ├── .env.example           # Environment variables template
│   ├── services/              # Business logic services
│   │   ├── __init__.py
│   │   ├── inference_pipeline.py  # 3-step AI pipeline
│   │   ├── storage_service.py    # Supabase Storage operations
│   │   └── supabase_client.py    # Database client
│   └── README.md
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── main.tsx           # Entry point
│   │   ├── App.tsx            # Main app component
│   │   ├── index.css          # Global styles
│   │   ├── types.ts           # TypeScript types
│   │   ├── components/        # React components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── VerificationFlow.tsx
│   │   │   ├── StepVisualization.tsx
│   │   │   ├── ConfidenceGauge.tsx
│   │   │   ├── VerificationCard.tsx
│   │   │   └── HistoryTable.tsx
│   │   └── services/          # API and local services
│   │       ├── api.ts         # Backend API client
│   │       └── localDetection.ts  # ONNX Runtime client-side detection
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── README.md
│
├── database/                   # Database schemas
│   ├── schema.sql             # Supabase PostgreSQL schema
│   └── sample_data.sql        # Sample data for testing
│
├── README.md                   # Main project documentation
├── SETUP.md                    # Detailed setup instructions
├── PROJECT_STRUCTURE.md        # This file
└── .gitignore
```

## Key Components

### Backend (`backend/`)

**main.py**: FastAPI application with endpoints:
- `POST /verify`: Main verification endpoint
- `GET /verifications/{user_id}`: Get verification history
- `GET /profile/{user_id}`: Get user profile

**services/inference_pipeline.py**: Implements the 3-step AI pipeline:
1. **Detection**: YOLOv11 signature detection
2. **Cleaning**: CycleGAN background removal
3. **Verification**: Siamese Network comparison

**services/storage_service.py**: Handles file uploads/downloads to Supabase Storage

**services/supabase_client.py**: Database connection management

### Frontend (`frontend/`)

**App.tsx**: Main application with navigation between Dashboard and Verification views

**components/Dashboard.tsx**: Shows latest verification and history table

**components/VerificationFlow.tsx**: Complete verification workflow:
- File upload (react-dropzone)
- Privacy mode toggle
- Results visualization

**components/StepVisualization.tsx**: 3-step visualization (Detected → Purified → Result)

**components/ConfidenceGauge.tsx**: Canvas-based confidence score gauge

**services/api.ts**: Axios-based API client

**services/localDetection.ts**: ONNX Runtime integration for client-side processing

### Database (`database/`)

**schema.sql**: PostgreSQL schema for Supabase:
- `profiles`: User profiles with reference signatures
- `verifications`: Audit trail of all verifications

## Data Flow

1. User uploads document via React UI
2. Frontend sends to FastAPI `/verify` endpoint
3. Backend processes through 3-step pipeline:
   - YOLO detects signature
   - CycleGAN cleans signature
   - Siamese Network verifies against reference
4. Results saved to Supabase (database + storage)
5. Frontend displays 3-step visualization and confidence gauge

## Privacy Mode

When enabled, the frontend can perform initial detection locally using ONNX Runtime, reducing the need to upload sensitive documents to the server.

