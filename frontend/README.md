# PureSign Frontend

React + TypeScript frontend for the PureSign signature verification system.

## Features

- **Document Upload**: Drag-and-drop interface using react-dropzone
- **3-Step Visualization**: Shows detected, purified, and result stages
- **Confidence Gauge**: Visual representation of verification score
- **Privacy Mode**: Local processing toggle using onnxruntime-web
- **Verification History**: Dashboard with audit trail
- **Modern UI**: Built with Tailwind CSS

## Components

### `App.tsx`
Main application component with navigation.

### `Dashboard.tsx`
Main dashboard showing latest verification and history.

### `VerificationFlow.tsx`
Complete verification workflow with file upload and results.

### `StepVisualization.tsx`
Displays the 3-step process: Detected → Purified → Result

### `ConfidenceGauge.tsx`
Canvas-based gauge showing match percentage.

### `VerificationCard.tsx`
Card component for displaying verification results.

### `HistoryTable.tsx`
Table showing verification history.

## Services

### `api.ts`
API client for backend communication.

### `localDetection.ts`
Client-side detection using ONNX Runtime (privacy mode).

## Environment Variables

- `VITE_API_BASE_URL`: Backend API URL (default: http://localhost:8000)
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Output will be in `dist/` directory.

