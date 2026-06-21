import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string
  hint?: string
  tone?: 'neutral' | 'gain' | 'loss' | 'brand'
  icon?: ReactNode
}

const toneClass: Record<NonNullable<StatCardProps['tone']>, string> = {
  neutral: 'text-text',
  gain: 'text-gain',
  loss: 'text-loss',
  brand: 'text-brand',
}

export function StatCard({ label, value, hint, tone = 'neutral', icon }: StatCardProps) {
  return (
    <div className="card p-3.5 sm:p-4 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted uppercase tracking-wide truncate">{label}</span>
        {icon && <span className="text-muted shrink-0">{icon}</span>}
      </div>
      {/* tamanho fluido: encolhe em telas estreitas para não estourar */}
      <div className={`mt-2 font-mono text-xl sm:text-2xl font-bold tnum leading-tight break-words ${toneClass[tone]}`}>
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
    </div>
  )
}

interface MetricRowProps {
  label: string
  value: string
  tone?: 'neutral' | 'gain' | 'loss'
}

export function MetricRow({ label, value, tone = 'neutral' }: MetricRowProps) {
  const c = tone === 'gain' ? 'text-gain' : tone === 'loss' ? 'text-loss' : 'text-text'
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-line last:border-0">
      <span className="text-sm text-muted min-w-0">{label}</span>
      <span className={`font-mono font-semibold tnum text-right shrink-0 ${c}`}>{value}</span>
    </div>
  )
}
