import axios from 'axios'

function resolveBaseURL(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '')
  if (fromEnv) return fromEnv
  return import.meta.env.DEV ? '/api' : 'http://localhost:8080'
}

export const api = axios.create({
  baseURL: resolveBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
})
