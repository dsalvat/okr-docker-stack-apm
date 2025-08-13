import React, { useEffect, useState } from 'react'
import OKRFilters from './OKRFilters'
import { fetchOKRs } from '@/services/api'
import type { OKR } from '@/types/okr'
import type { OkrFilter } from '@/types/filters'

export default function OKRList() {
  const [okrs, setOkrs] = useState<OKR[]>([])

  const loadOKRs = async (filters: OkrFilter = {}) => {
    const data = await fetchOKRs(filters)
    setOkrs(data)
  }

  useEffect(() => {
    void loadOKRs()
  }, [])

  return (
    <div className="p-6">
      <OKRFilters onFilter={loadOKRs} />

      <div className="mt-4 grid gap-4">
        {okrs.map((okr: OKR) => (
          <div key={okr.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-bold">{okr.objective}</h2>
            {okr.description && <p className="text-sm">{okr.description}</p>}
            {okr.status && <span className="text-xs text-gray-500">{okr.status}</span>}
          </div>
        ))}
        {okrs.length === 0 && (
          <div className="text-sm text-gray-500">Cap resultat</div>
        )}
      </div>
    </div>
  )
}
