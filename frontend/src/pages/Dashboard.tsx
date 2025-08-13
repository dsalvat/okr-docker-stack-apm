import { useOkrs } from '@/hooks/useOkrs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Activity, Target, CheckCircle2 } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts'

export default function Dashboard() {
  const { data: okrs = [], isLoading } = useOkrs()
  const active = okrs.length
  const avg = okrs.length ? Math.round((okrs.reduce((a, b) => a + (b.score || 0), 0) / okrs.length) * 10) / 10 : 0
  const pendingKrs = Math.max(0, okrs.length * 3 - Math.round(okrs.length * 2.1))

  const chartData = okrs.slice(0, 6).map((o) => ({
    name: (o.objective || '—').slice(0, 14) + (o.objective.length > 14 ? '…' : ''),
    score: o.score || 0,
  }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard icon={<Target className="text-primary-600" />} title="Objectius actius" value={active} hint="Total objectius en curs" />
        <MetricCard icon={<Activity className="text-primary-600" />} title="Mitjana d’score" value={avg} hint="Promig OKR" />
        <MetricCard icon={<CheckCircle2 className="text-primary-600" />} title="KR pendents" value={pendingKrs} hint="Estimació" />
      </div>

      <Card>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium">Rendiment OKR</h2>
            <Badge variant="muted">{isLoading ? 'Carregant...' : `${okrs.length} objectius`}</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <Tooltip />
                <Bar dataKey="score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="font-medium mb-4">Progrés global</h2>
          <Progress value={avg * 10} />
        </CardContent>
      </Card>
    </div>
  )
}

function MetricCard({ icon, title, value, hint }: { icon: React.ReactNode; title: string; value: number | string; hint: string }) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <div className="text-sm text-gray-500">{title}</div>
            <div className="text-2xl font-semibold">{value}</div>
            <div className="text-xs text-gray-400">{hint}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
