import { useEffect, useMemo, useState } from 'react'
import Modal from './Modal'
import { useData } from '../contexts/DataContext'
import { formatTime } from '../lib/dates'

export function StartJourneyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { journeys, startJourney } = useData()
  const [km, setKm] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const lastKm = useMemo(() => {
    const j = journeys.find((j) => j.end_km != null)
    return j?.end_km ?? null
  }, [journeys])

  // ao abrir, pré-preenche com o último KM registrado
  useEffect(() => {
    if (open) {
      setKm(lastKm != null ? String(lastKm) : '')
      setErr(null)
    }
  }, [open, lastKm])

  const doStart = async () => {
    const v = parseFloat(km.replace(',', '.'))
    if (isNaN(v) || v < 0) return setErr('Informe um KM válido.')
    setBusy(true)
    setErr(null)
    try {
      await startJourney(v)
      onClose()
    } catch {
      setErr('Não foi possível iniciar. Tente de novo.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} title="Iniciar jornada" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-muted">
          Data e hora de início são registradas automaticamente agora.
        </p>
        <div>
          <label className="label">KM inicial do veículo</label>
          <input
            className="input font-mono text-lg"
            type="number"
            inputMode="decimal"
            autoFocus
            value={km}
            onChange={(e) => setKm(e.target.value)}
            placeholder="ex: 125430"
          />
          {lastKm != null && <p className="text-xs text-muted mt-1">Último KM registrado: {lastKm}</p>}
        </div>
        {err && <p className="text-sm text-loss">{err}</p>}
        <button className="btn-primary w-full" onClick={doStart} disabled={busy}>
          {busy ? 'Salvando…' : 'Iniciar agora'}
        </button>
      </div>
    </Modal>
  )
}

export function EndJourneyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { activeJourney, endJourney } = useData()
  const [km, setKm] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setKm('')
      setErr(null)
    }
  }, [open])

  const doEnd = async () => {
    if (!activeJourney) return onClose()
    const v = parseFloat(km.replace(',', '.'))
    if (isNaN(v)) return setErr('Informe um KM válido.')
    if (v < activeJourney.start_km)
      return setErr(`O KM final deve ser ≥ ${activeJourney.start_km} (KM inicial).`)
    setBusy(true)
    setErr(null)
    try {
      await endJourney(activeJourney, v)
      onClose()
    } catch {
      setErr('Não foi possível encerrar. Tente de novo.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} title="Encerrar jornada" onClose={onClose}>
      <div className="space-y-4">
        {activeJourney && (
          <div className="card bg-surface-2 p-3 text-sm">
            <div className="flex justify-between text-muted">
              <span>Início</span>
              <span className="font-mono text-text">{formatTime(activeJourney.start_time)}</span>
            </div>
            <div className="flex justify-between text-muted mt-1">
              <span>KM inicial</span>
              <span className="font-mono text-text">{activeJourney.start_km}</span>
            </div>
          </div>
        )}
        <div>
          <label className="label">KM final do veículo</label>
          <input
            className="input font-mono text-lg"
            type="number"
            inputMode="decimal"
            autoFocus
            value={km}
            onChange={(e) => setKm(e.target.value)}
            placeholder="ex: 125492"
          />
        </div>
        {activeJourney && km && !isNaN(parseFloat(km)) && (
          <p className="text-sm text-brand">
            {Math.max(0, parseFloat(km) - activeJourney.start_km).toFixed(0)} km nesta jornada
          </p>
        )}
        {err && <p className="text-sm text-loss">{err}</p>}
        <button className="btn-primary w-full" onClick={doEnd} disabled={busy}>
          {busy ? 'Salvando…' : 'Encerrar agora'}
        </button>
      </div>
    </Modal>
  )
}
