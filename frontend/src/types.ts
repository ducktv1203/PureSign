export interface VerificationResult {
  verification_id: string
  detected_sig_url?: string
  cleaned_sig_url?: string
  confidence_score: number
  status: 'success' | 'failed' | 'processing'
  timestamp: string
}

export interface UserProfile {
  id: string
  user_name: string
  reference_sig_url: string
  created_at: string
  updated_at: string
}

export interface VerificationHistory {
  id: string
  user_id: string
  original_doc_url: string
  cleaned_sig_url?: string
  confidence_score?: number
  timestamp: string
  status: string
}

