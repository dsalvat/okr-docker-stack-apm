import type { OkrStatus } from './okr'

export interface OkrFilter {
  q?: string
  fromDate?: string
  toDate?: string
  status?: '' | OkrStatus
}
