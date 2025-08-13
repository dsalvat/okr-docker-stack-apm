import { useOkrs } from '@/hooks/useOkrs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'

export default function Objectives() {
  const { data: okrs = [], isLoading } = useOkrs()
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const k = q.toLowerCase()
    return okrs.filter(o => (o.objective || '').toLowerCase().includes(k))
  }, [okrs, q])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Objectius</h2>
        <Badge variant="muted">{isLoading ? 'Carregant...' : `${filtered.length} resultats`}</Badge>
      </div>

      <Card>
        <CardContent>
          <div className="mb-3">
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Cerca per objectiu…"
              className="w-full md:w-80 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-gray-500">
                <tr>
                  <th className="py-2 pr-4">Objectiu</th>
                  <th className="py-2 pr-4">Score</th>
                  <th className="py-2 pr-4">Claredat</th>
                  <th className="py-2 pr-4">Foco</th>
                  <th className="py-2 pr-4">Redactat</th>
                  <th className="py-2">Accions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} className="border-t border-gray-100">
                    <td className="py-2 pr-4">{o.objective}</td>
                    <td className="py-2 pr-4">{o.score ?? '—'}</td>
                    <td className="py-2 pr-4">{o.clarity ?? '—'}</td>
                    <td className="py-2 pr-4">{o.focus ?? '—'}</td>
                    <td className="py-2 pr-4">{o.writing ?? '—'}</td>
                    <td className="py-2">
                      <Link className="text-primary-700 hover:underline" to={`/objectius/${o.id}`}>Detall</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
