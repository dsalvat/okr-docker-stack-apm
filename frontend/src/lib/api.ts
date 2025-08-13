import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'
export const api = axios.create({ baseURL })

export type Okr = {
  id: number | string
  objective: string
  score?: number
  clarity?: number
  focus?: number
  writing?: number
  feedback?: string
  createdAt?: string
}

export type Kr = {
  id: number | string
  okrId: number | string
  definition: string
  targetValue: string
  targetDate: string
  score?: number
  clarity?: number
  measurability?: number
  feasibility?: number
  feedback?: string
}

export async function fetchOkrs(): Promise<Okr[]> {
  try {
    const { data } = await api.get('/api/v1/okrs')
    return data
  } catch {
    return [
      { id: 1, objective: 'Augmentar NPS a 55', score: 7.8, clarity: 8, focus: 7, writing: 8, createdAt: new Date().toISOString() },
      { id: 2, objective: 'Reduir lead time de logística un 20%', score: 8.2, clarity: 8, focus: 9, writing: 7, createdAt: new Date().toISOString() },
    ]
  }
}

export async function fetchOkr(id: string): Promise<Okr> {
  try {
    const { data } = await api.get(`/api/v1/okrs/${id}`)
    return data
  } catch {
    return { id, objective: 'Objectiu de prova', score: 7.6, clarity: 8, focus: 7, writing: 8 }
  }
}

export async function evaluateObjective(objective: string) {
  const { data } = await api.post('/api/v1/okrs/evaluate', { objective })
  return data
}

export async function evaluateKr(payload: { okrId: string, krDefinition: string, targetValue: string, targetDate: string }) {
  const { data } = await api.post('/api/v1/okrs/kr/evaluate', payload)
  return data
}
