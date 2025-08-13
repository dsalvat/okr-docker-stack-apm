import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useOkrs, useEvaluateObjective } from '@/hooks/useOkrs'
import type { OKR } from '@/types/okr'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Calendar, Filter, Sparkles } from 'lucide-react'

const [okrs] = useState<OKR[]>([]) // o dades reals del hook/servei

type Filters = {
  q: string
  status: '' | 'in_progress' | 'completed' | 'delayed'
  fromDate: string
  toDate: string
}

export default function Home() {
  const { data: okrs = [], isLoading } = useOkrs()
  const evalObj = useEvaluateObjective()

  // Filtres locals (frontend). Si ja tens backend amb filtres, pots sincronitzar-los amb la query string.
  const [filters, setFilters] = useState<Filters>({
    q: '',
    status: '',
    fromDate: '',
    toDate: '',
  })

  // Form ràpid d'avaluació d'Objectiu
  const [objectiveText, setObjectiveText] = useState('')

  const filtered = useMemo(() => {
    const k = filters.q.trim().toLowerCase()
    return okrs.filter(o => {
      const matchText = k ? (o.objective || '').toLowerCase().includes(k) : true
      const matchStatus = filters.status ? (o as any).status === filters.status : true
      const createdAt = o.createdAt ? new Date(o.createdAt) : null
      const fromOk = filters.fromDate ? (createdAt ? createdAt >= new Date(filters.fromDate) : false) : true
      const toOk = filters.toDate ? (createdAt ? createdAt <= new Date(filters.toDate + 'T23:59:59') : false) : true
      return matchText && matchStatus && fromOk && toOk
    })
  }, [okrs, filters])

  const avgScore = filtered.length
    ? Math.round((filtered.reduce((a, b) => a + (b.score || 0), 0) / filtered.length) * 10) / 10
    : 0

  return (
    <div className="space-y-6">
      {/* Hero + accions ràpides */}
      <Card>
        <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Benvingut/da a l’OKR Evaluator</h1>
            <p className="text-sm text-gray-600">
              Avalua objectius, defineix Resultats Clau i fes seguiment del progrés amb una experiència lleugera i clara.
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/dashboard">
              <Button className="flex items-center gap-2">
                <Sparkles size={16} /> Obrir Dashboard
              </Button>
            </Link>
            <Link to="/objectius">
              <Button className="bg-white text-primary-700 border border-primary-200 hover:bg-primary-50">
                Veure Objectius
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Form ràpid d’avaluació d’objectiu */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="text-primary-600" size={18} />
            <h2 className="font-medium">Avaluació ràpida d’un Objectiu</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            value={objectiveText}
            onChange={e => setObjectiveText(e.target.value)}
            placeholder="Escriu aquí l’Objectiu OKR que vols avaluar…"
            className="w-full min-h-[110px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
          <div className="flex items-center gap-3">
            <Button
              onClick={() => evalObj.mutate(objectiveText)}
              disabled={!objectiveText || evalObj.isPending}
            >
              {evalObj.isPending ? 'Avaluant…' : 'Avaluar objectiu'}
            </Button>
            {evalObj.isSuccess && (
              <Badge variant="success">Score: {evalObj.data?.score?.toFixed?.(2) ?? '—'}</Badge>
            )}
          </div>
          {evalObj.isSuccess && evalObj.data?.feedback && (
            <div className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3">
              <strong>Feedback:</strong> {evalObj.data.feedback}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filtres + mètriques ràpides */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Filter className="text-primary-600" size={18} />
              <h2 className="font-medium">Filtres</h2>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              value={filters.q}
              onChange={e => setFilters(s => ({ ...s, q: e.target.value }))}
              placeholder="Cerca per text…"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
            <select
              value={filters.status}
              onChange={e => setFilters(s => ({ ...s, status: e.target.value as Filters['status'] }))}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            >
              <option value="">Tots els estats</option>
              <option value="in_progress">En progrés</option>
              <option value="completed">Completat</option>
              <option value="delayed">Endarrerit</option>
            </select>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-500" />
              <input
                type="date"
                value={filters.fromDate}
                onChange={e => setFilters(s => ({ ...s, fromDate: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-500" />
              <input
                type="date"
                value={filters.toDate}
                onChange={e => setFilters(s => ({ ...s, toDate: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-medium">Mètriques ràpides</h2>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Objectius visibles</span>
              <Badge variant="muted">{isLoading ? '—' : filtered.length}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Mitjana d’score</span>
              <span className="font-medium">{avgScore || '—'}</span>
            </div>
            <div className="pt-2">
              <Progress value={(avgScore || 0) * 10} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Llista d’OKRs filtrats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-medium">OKRs</h2>
            <Badge variant="muted">{isLoading ? 'Carregant…' : `${filtered.length} resultats`}</Badge>
          </div>
        </CardHeader>
        <CardContent>
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
                {!isLoading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-500">Cap resultat amb els filtres actuals.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
