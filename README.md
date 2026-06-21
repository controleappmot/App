import { useMemo, useState } from 'react'
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import { useData } from '../contexts/DataContext'
import { MetricRow } from '../components/StatCard'
import {
  buildDailyMap,
  daysInRange,
  earningsByPlatform,
  expensesByCategory,
  groupBy,
  formatBRL,
  safeDiv,
} from '../lib/calculations'
import { CATEGORY_LABEL } from '../lib/types'
import { todayISO, toISODate, formatShortDate, formatFullDate, startOfWeekISO, monthLabel, weekdayShort } from '../lib/dates'

type Preset = 'today' | 'last7' | 'last30' | 'last90' | 'all' | 'custom'
type View = 'grafico' | 'tabela'

// Cores das séries — faturamento (verde), lucro (azul) e gasto (vermelho)
// são distintas entre si e usadas de forma consistente em todos os gráficos.
const COLORS = {
  uber: '#3ea6ff',
  '99': '#ffc400',
  faturamento: '#34d399',
  lucro: '#60a5fa',
  gasto: '#f87171',
}
const PIE_PALETTE = ['#34d399', '#3ea6ff', '#ffc400', '#f87171', '#a78bfa', '#fb923c', '#94a3b8']

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-4">
      <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">{title}</h2>
      {children}
    </section>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MoneyTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="card bg-surface-2 px-3 py-2 text-xs">
      {label && <div className="text-muted mb-1">{label}</div>}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color || p.payload?.fill }} />
          <span className="text-muted">{p.name}:</span>
          <span className="font-mono font-semibold">{formatBRL(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

const axis = { stroke: '#8a90a6', fontSize: 11 }
const n2 = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function daysAgoISO(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return toISODate(d)
}

export default function Relatorios() {
  const { journeys, earnings, expenses } = useData()
  const [preset, setPreset] = useState<Preset>('last30')
  const [view, setView] = useState<View>('grafico')
  const [customFrom, setCustomFrom] = useState<string>(daysAgoISO(29))
  const [customTo, setCustomTo] = useState<string>(todayISO())

  const data = useMemo(() => {
    const map = buildDailyMap(journeys, earnings, expenses)
    const today = todayISO()
    let from = '0000-01-01'
    let to = today
    switch (preset) {
      case 'today':
        from = today
        to = today
        break
      case 'last7':
        from = daysAgoISO(6)
        break
      case 'last30':
        from = daysAgoISO(29)
        break
      case 'last90':
        from = daysAgoISO(89)
        break
      case 'all':
        from = '0000-01-01'
        to = today
        break
      case 'custom':
        // tolera datas invertidas
        from = customFrom <= customTo ? customFrom : customTo
        to = customFrom <= customTo ? customTo : customFrom
        break
    }

    const days = daysInRange(map, from, to)
    const filteredEarnings = earnings.filter((e) => e.date >= from && e.date <= to)
    const filteredExpenses = expenses.filter((x) => x.date >= from && x.date <= to)

    const daily = days.map((d) => ({
      date: formatShortDate(d.date),
      faturamento: Number(d.earnings.toFixed(2)),
      lucro: Number(d.profit.toFixed(2)),
    }))

    const weekly = groupBy(days, 'week').map((w) => ({
      label: formatShortDate(startOfWeekISO(w.key)),
      ganhos: Number(w.earnings.toFixed(2)),
      gastos: Number(w.expenses.toFixed(2)),
      lucro: Number(w.profit.toFixed(2)),
    }))

    const monthly = groupBy(days, 'month').map((m) => ({
      label: monthLabel(m.key),
      ganhos: Number(m.earnings.toFixed(2)),
      gastos: Number(m.expenses.toFixed(2)),
      lucro: Number(m.profit.toFixed(2)),
    }))

    const rows = [...days]
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((d) => ({
        iso: d.date,
        faturamento: d.earnings,
        gasto: d.expenses,
        lucro: d.profit,
        margem: safeDiv(d.profit, d.earnings) * 100,
      }))
    const totals = days.reduce(
      (a, d) => {
        a.faturamento += d.earnings
        a.gasto += d.expenses
        a.lucro += d.profit
        return a
      },
      { faturamento: 0, gasto: 0, lucro: 0 },
    )
    const totalMargem = safeDiv(totals.lucro, totals.faturamento) * 100

    return {
      from,
      to,
      daily,
      weekly,
      monthly,
      rows,
      totals,
      totalMargem,
      byPlatform: earningsByPlatform(filteredEarnings),
      byCategory: expensesByCategory(filteredExpenses, CATEGORY_LABEL),
      hasData: days.length > 0,
    }
  }, [journeys, earnings, expenses, preset, customFrom, customTo])

  const presets: { v: Preset; l: string }[] = [
    { v: 'today', l: 'Hoje' },
    { v: 'last7', l: '7 dias' },
    { v: 'last30', l: '30 dias' },
    { v: 'last90', l: '90 dias' },
    { v: 'all', l: 'Tudo' },
    { v: 'custom', l: 'Personalizado' },
  ]

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold">Relatórios</h1>

        <div className="flex gap-2 mt-3 overflow-x-auto">
          {presets.map((p) => (
            <button
              key={p.v}
              onClick={() => setPreset(p.v)}
              className={`chip border whitespace-nowrap ${
                preset === p.v ? 'bg-brand text-base border-brand' : 'bg-surface-2 text-muted border-line'
              }`}
            >
              {p.l}
            </button>
          ))}
        </div>

        {/* Intervalo personalizado */}
        {preset === 'custom' && (
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="label">De</label>
              <input
                className="input"
                type="date"
                value={customFrom}
                max={todayISO()}
                onChange={(e) => setCustomFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Até</label>
              <input
                className="input"
                type="date"
                value={customTo}
                max={todayISO()}
                onChange={(e) => setCustomTo(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Período resolvido (referência) */}
        <p className="text-xs text-muted mt-2">
          {data.from === '0000-01-01'
            ? 'Todo o histórico'
            : data.from === data.to
              ? formatFullDate(data.from)
              : `${formatFullDate(data.from)} — ${formatFullDate(data.to)}`}
        </p>

        {/* Seletor de visualização */}
        <div className="grid grid-cols-2 gap-1 mt-3 p-1 bg-surface-2 rounded-xl border border-line">
          {([['grafico', 'Gráficos'], ['tabela', 'Tabela']] as [View, string][]).map(([v, l]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`py-2 rounded-lg text-sm font-medium transition ${
                view === v ? 'bg-brand text-base' : 'text-muted'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </header>

      {!data.hasData ? (
        <p className="text-center text-muted text-sm py-16">
          Sem dados no período. Registre ganhos e gastos para ver os relatórios.
        </p>
      ) : view === 'tabela' ? (
        <>
          <section className="card p-4">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-1">
              Total do período
            </h2>
            <MetricRow label="Faturamento" value={formatBRL(data.totals.faturamento)} tone="gain" />
            <MetricRow label="Gasto" value={formatBRL(data.totals.gasto)} tone="loss" />
            <MetricRow
              label="Lucro líquido"
              value={formatBRL(data.totals.lucro)}
              tone={data.totals.lucro >= 0 ? 'gain' : 'loss'}
            />
            <MetricRow
              label="Margem de lucro"
              value={`${data.totalMargem.toFixed(1)}%`}
              tone={data.totalMargem >= 0 ? 'gain' : 'loss'}
            />
          </section>

          <section className="card overflow-hidden">
            <div className="overflow-x-auto overscroll-x-contain">
              <table className="w-full text-[13px] sm:text-sm tnum">
                <thead>
                  <tr className="text-muted text-[11px] uppercase tracking-wide border-b border-line">
                    <th className="sticky left-0 bg-surface z-10 text-left font-medium px-2.5 sm:px-3 py-2.5">Data</th>
                    <th className="text-right font-medium px-2.5 sm:px-3 py-2.5">Faturam.</th>
                    <th className="text-right font-medium px-2.5 sm:px-3 py-2.5">Gasto</th>
                    <th className="text-right font-medium px-2.5 sm:px-3 py-2.5">Lucro</th>
                    <th className="text-right font-medium px-2.5 sm:px-3 py-2.5">%</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((r) => (
                    <tr key={r.iso} className="border-b border-line/60 last:border-0">
                      <td className="sticky left-0 bg-surface z-10 px-2.5 sm:px-3 py-2.5 whitespace-nowrap">
                        <span className="text-muted">{weekdayShort(r.iso)}</span> {formatShortDate(r.iso)}
                      </td>
                      <td className="px-2.5 sm:px-3 py-2.5 text-right font-mono text-gain whitespace-nowrap">{n2(r.faturamento)}</td>
                      <td className="px-2.5 sm:px-3 py-2.5 text-right font-mono text-loss whitespace-nowrap">{n2(r.gasto)}</td>
                      <td className={`px-2.5 sm:px-3 py-2.5 text-right font-mono whitespace-nowrap ${r.lucro >= 0 ? 'text-text' : 'text-loss'}`}>
                        {n2(r.lucro)}
                      </td>
                      <td
                        className={`px-2.5 sm:px-3 py-2.5 text-right font-mono whitespace-nowrap ${
                          r.faturamento <= 0 ? 'text-muted' : r.margem >= 0 ? 'text-gain' : 'text-loss'
                        }`}
                      >
                        {r.faturamento <= 0 ? '—' : `${r.margem.toFixed(0)}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-surface-2 font-semibold border-t border-line">
                    <td className="sticky left-0 bg-surface-2 z-10 px-2.5 sm:px-3 py-3">Total</td>
                    <td className="px-2.5 sm:px-3 py-3 text-right font-mono text-gain whitespace-nowrap">{n2(data.totals.faturamento)}</td>
                    <td className="px-2.5 sm:px-3 py-3 text-right font-mono text-loss whitespace-nowrap">{n2(data.totals.gasto)}</td>
                    <td className={`px-2.5 sm:px-3 py-3 text-right font-mono whitespace-nowrap ${data.totals.lucro >= 0 ? 'text-text' : 'text-loss'}`}>
                      {n2(data.totals.lucro)}
                    </td>
                    <td className={`px-2.5 sm:px-3 py-3 text-right font-mono whitespace-nowrap ${data.totalMargem >= 0 ? 'text-gain' : 'text-loss'}`}>
                      {data.totals.faturamento <= 0 ? '—' : `${data.totalMargem.toFixed(0)}%`}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="text-xs text-muted px-3 py-2.5 border-t border-line">
              Valores em R$. % = margem de lucro (lucro ÷ faturamento).
            </p>
          </section>
        </>
      ) : (
        <>
          <ChartCard title="Faturamento por dia">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.daily} margin={{ left: -18, right: 8, top: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#272c3d" />
                <XAxis dataKey="date" {...axis} tickLine={false} />
                <YAxis {...axis} tickLine={false} width={44} />
                <Tooltip content={<MoneyTooltip />} />
                <Line type="monotone" dataKey="faturamento" name="Faturamento" stroke={COLORS.faturamento} strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Lucro por dia">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.daily} margin={{ left: -18, right: 8, top: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#272c3d" />
                <XAxis dataKey="date" {...axis} tickLine={false} />
                <YAxis {...axis} tickLine={false} width={44} />
                <Tooltip content={<MoneyTooltip />} />
                <Line type="monotone" dataKey="lucro" name="Lucro" stroke={COLORS.lucro} strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="grid sm:grid-cols-2 gap-5">
            <ChartCard title="Ganhos por plataforma">
              {data.byPlatform.length === 0 ? (
                <Empty />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={data.byPlatform} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                      {data.byPlatform.map((s) => (
                        <Cell key={s.platform} fill={COLORS[s.platform]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip content={<MoneyTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Gastos por categoria">
              {data.byCategory.length === 0 ? (
                <Empty />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={data.byCategory} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                      {data.byCategory.map((_, i) => (
                        <Cell key={i} fill={PIE_PALETTE[i % PIE_PALETTE.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip content={<MoneyTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          <ChartCard title="Evolução semanal">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.weekly} margin={{ left: -18, right: 8, top: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#272c3d" vertical={false} />
                <XAxis dataKey="label" {...axis} tickLine={false} />
                <YAxis {...axis} tickLine={false} width={44} />
                <Tooltip content={<MoneyTooltip />} cursor={{ fill: '#ffffff08' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="ganhos" name="Faturamento" fill={COLORS.faturamento} radius={[4, 4, 0, 0]} />
                <Bar dataKey="gastos" name="Gasto" fill={COLORS.gasto} radius={[4, 4, 0, 0]} />
                <Bar dataKey="lucro" name="Lucro" fill={COLORS.lucro} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Evolução mensal">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.monthly} margin={{ left: -18, right: 8, top: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#272c3d" vertical={false} />
                <XAxis dataKey="label" {...axis} tickLine={false} />
                <YAxis {...axis} tickLine={false} width={44} />
                <Tooltip content={<MoneyTooltip />} cursor={{ fill: '#ffffff08' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="ganhos" name="Faturamento" fill={COLORS.faturamento} radius={[4, 4, 0, 0]} />
                <Bar dataKey="gastos" name="Gasto" fill={COLORS.gasto} radius={[4, 4, 0, 0]} />
                <Bar dataKey="lucro" name="Lucro" fill={COLORS.lucro} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </>
      )}
    </div>
  )
}

function Empty() {
  return <div className="h-[220px] flex items-center justify-center text-sm text-muted">Sem dados</div>
}
