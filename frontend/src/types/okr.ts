export type OkrStatus = 'in_progress' | 'completed' | 'delayed'

export interface OKR {
  id: string
  objective: string
  description?: string
  status?: OkrStatus
  score?: number
  clarity?: number
  focus?: number
  writing?: number
  createdAt?: string
}
