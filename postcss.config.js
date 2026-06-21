import { useMemo, useState } from 'react'
import { useData } from '../contexts/DataContext'
import { StartJourneyModal, EndJourneyModal } from '../components/JourneyModals'
import { IconPlay, IconStop, IconTrash } from '../components/icons'
import { formatTime, formatDuration, formatFullDate, toISODate } from '../lib/dates'
import type { Journey } from '../lib/types'

export default function Jornada() {
  const { journeys, activeJourney, deleteJourney } = useData()
  const [startOpen, setStartOpen] = useState(false)
  const [endOpen, setEndOpen] = useState(false)

  // Agrupa jornadas por dia (uma pessoa pode ter várias por dia)
  const grouped = useMemo(() => {
    const map = new Map<string, Journey[]>()
    for (const j of journeys) {
      const day = toISODate(new Date(j.start_time))
      const arr = map.get(day) ?? []
      arr.push(j)
      map.set(day, arr)
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]))
  }, [journeys])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold">Jornadas</h1>
        <p className="text-sm text-muted">Registre cada período que você rodou.</p>
      </header>

      {activeJourney ? (
        <div className="card p-4 border-brand/40 bg-brand-dim/30">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            <span className="font-semibold text-brand">Jornada em andamento</span>
          </div>
          <p className="text-sm text-muted">
            Início {formatTime(activeJourney.start_time)} · KM inicial{' '}
            <span className="font-mono text-text">{activeJourney.start_km}</span>
          </p>
          <button className="btn-danger w-full mt-4" onClick={() => setEndOpen(true)}>
            <IconStop width={18} height={18} /> Encerrar jornada
          </button>
        </div>
      ) : (
        <button className="btn-primary w-full" onClick={() => setStartOpen(true)}>
          <IconPlay width={18} height={18} /> Iniciar jornada
        </button>
      )}

      {/* Histórico */}
      <section className="space-y-4">
        {grouped.length === 0 && (
          <p className="text-center text-muted text-sm py-10">Nenhuma jornada registrada ainda.</p>
        )}
        {grouped.map(([day, items]) => {
          const dayKm = items.reduce((s, j) => s + (j.total_km ?? 0), 0)
          const dayHours = items.reduce((s, j) => s + (j.total_hours ?? 0), 0)
          return (
            <div key={day}>
              <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="text-sm font-semibold">{formatFullDate(day)}</h3>
                <span className="text-xs text-muted font-mono">
                  {dayKm.toFixed(0)} km · {formatDuration(dayHours)}
                </span>
              </div>
              <div className="space-y-2">
                {items.map((j) => (
                  <div key={j.id} className="card p-3.5 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm">
                        {formatTime(j.start_time)}
                        {j.end_time ? ` – ${formatTime(j.end_time)}` : ' – em andamento'}
                      </div>
                      <div className="text-xs text-muted mt-0.5">
                        KM {j.start_km}
                        {j.end_km != null && ` → ${j.end_km}`}
                        {j.total_km != null && (
                          <span className="text-text"> · {j.total_km.toFixed(0)} km</span>
                        )}
                        {j.total_hours != null && ` · ${formatDuration(j.total_hours)}`}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('Excluir esta jornada?')) deleteJourney(j.id)
                      }}
                      className="text-muted hover:text-loss p-1.5 shrink-0"
                      aria-label="Excluir"
                    >
                      <IconTrash width={18} height={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </section>

      <StartJourneyModal open={startOpen} onClose={() => setStartOpen(false)} />
      <EndJourneyModal open={endOpen} onClose={() => setEndOpen(false)} />
    </div>
  )
}
