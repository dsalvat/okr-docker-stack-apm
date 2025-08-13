import React, { useState } from 'react'
import type { OkrFilter } from '@/types/filters'

type Props = { onFilter: (f: OkrFilter) => void }

export default function OKRFilters({ onFilter }: Props) {
  const [fromDate, setFromDate] = useState<string>('')
  const [toDate, setToDate] = useState<string>('')
  const [status, setStatus] = useState<NonNullable<OkrFilter['status']>>('')

  const handleApply = () => onFilter({ fromDate, toDate, status })

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-wrap gap-4">
      <div>
        <label className="block text-sm">Des de</label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="border rounded p-1 dark:bg-gray-700"
        />
      </div>

      <div>
        <label className="block text-sm">Fins a</label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="border rounded p-1 dark:bg-gray-700"
        />
      </div>

      <div>
        <label className="block text-sm">Estat</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as NonNullable<OkrFilter['status']>)}
          className="border rounded p-1 dark:bg-gray-700"
        >
          <option value="">Tots</option>
          <option value="in_progress">En progrés</option>
          <option value="completed">Completat</option>
          <option value="delayed">Endarrerit</option>
        </select>
      </div>

      <div className="flex items-end">
        <button
          onClick={handleApply}
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
        >
          Aplicar
        </button>
      </div>
    </div>
  )
}
