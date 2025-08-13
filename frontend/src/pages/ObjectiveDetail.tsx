import { useParams } from 'react-router-dom'
import { useOkr, useEvaluateObjective, useEvaluateKr } from '@/hooks/useOkrs'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

export default function ObjectiveDetail() {
  const { id = '' } = useParams()
  const { data: okr } = useOkr(id)
  const evalObj = useEvaluateObjective()
  const evalKr = useEvaluateKr()

  const [objectiveText, setObjectiveText] = useState('')
  const [lastScore, setLastScore] = useState<number | null>(null)

  const [krDef, setKrDef] = useState('')
  const [krTargetValue, setKrTargetValue] = useState('')
  const [krTargetDate, setKrTargetDate] = useState('')

  useEffect(() => {
    if (okr?.objective) setObjectiveText(okr.objective)
    if (okr?.score) setLastScore(okr.score)
  }, [okr])

  const currentScore = evalObj.data?.score ?? lastScore ?? 0
  const canAddKR = currentScore >= 7.5

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Objectiu</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            value={objectiveText}
            onChange={e => setObjectiveText(e.target.value)}
            className="w-full min-h-[120px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            placeholder="Escriu l'objectiu…"
          />
          <div className="flex items-center gap-2">
            <Button onClick={() => evalObj.mutate(objectiveText)} disabled={!objectiveText || evalObj.isPending}>
              {evalObj.isPending ? 'Avaluant…' : 'Avaluar Objectiu'}
            </Button>
            <span className="text-sm text-gray-500">
              Score: {typeof currentScore === 'number' ? currentScore.toFixed(2) : '—'}
            </span>
          </div>
          {evalObj.isSuccess && evalObj.data?.feedback && (
            <div className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3">
              <strong>Feedback:</strong> {evalObj.data.feedback}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Resultats Clau</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          {!canAddKR && (
            <div className="text-sm text-gray-600">
              Aconsegueix una puntuació ≥ 7.5 a l’Objectiu per definir Resultats Clau.
            </div>
          )}

          {canAddKR && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input value={krDef} onChange={e => setKrDef(e.target.value)} placeholder="Definició KR"
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                <input value={krTargetValue} onChange={e => setKrTargetValue(e.target.value)} placeholder="Valor objectiu"
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
                <input value={krTargetDate} onChange={e => setKrTargetDate(e.target.value)} placeholder="Data objectiu (YYYY-MM-DD)"
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
              </div>
              <Button
                onClick={() => evalKr.mutate({ okrId: id, krDefinition: krDef, targetValue: krTargetValue, targetDate: krTargetDate })}
                disabled={!krDef || !krTargetValue || !krTargetDate || evalKr.isPending}
              >
                {evalKr.isPending ? 'Avaluant KR…' : 'Avaluar KR'}
              </Button>
              {evalKr.isSuccess && (
                <div className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <strong>Score KR:</strong> {evalKr.data?.score?.toFixed?.(2) ?? '—'}<br/>
                  <strong>Feedback:</strong> {evalKr.data?.feedback ?? '—'}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
