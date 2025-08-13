import axios from 'axios'
import type { OKR } from '@/types/okr'
import type { OkrFilter } from '@/types/filters'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 20000,
})

export async function fetchOKRs(filters: OkrFilter = {}): Promise<OKR[]> {
  const params: Record<string, string> = {}
  if (filters.q) params.q = filters.q
  if (filters.fromDate) params.from_date = filters.fromDate
  if (filters.toDate) params.to_date = filters.toDate
  if (filters.status) params.status = filters.status

  const { data } = await api.get<OKR[]>('/v1/okrs', { params })
  return data
}
