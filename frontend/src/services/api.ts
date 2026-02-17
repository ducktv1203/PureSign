import axios from 'axios'
import { VerificationResult, UserProfile, VerificationHistory } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const verifySignature = async (
  file: File,
  userId: string,
  localProcessing: boolean = false
): Promise<VerificationResult> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('user_id', userId)

  const response = await api.post<VerificationResult>('/verify', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    params: {
      local_processing: localProcessing,
    },
  })

  return response.data
}

export const getProfile = async (userId: string): Promise<UserProfile> => {
  const response = await api.get<{ profile: UserProfile }>(`/profile/${userId}`)
  return response.data.profile
}

export const getVerifications = async (userId: string): Promise<VerificationHistory[]> => {
  const response = await api.get<{ verifications: VerificationHistory[] }>(`/verifications/${userId}`)
  return response.data.verifications
}

