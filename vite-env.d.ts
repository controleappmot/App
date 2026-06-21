import { useState } from 'react'
import Modal from './Modal'
import { useData } from '../contexts/DataContext'
import { todayISO } from '../lib/dates'
import { PLATFORM_LABEL, type Platform } from '../lib/types'

export default function EarningModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addEarning } = useData()
  const [date, setDate] = useState(todayISO())
  const [platform, setPlatform] = useState<Platform>('uber')
  const [amount, setAmount] = useState('')
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const close = () => {
    setAmount('')
    setTime('')
    setNotes('')
    setErr(null)
    setDate(todayISO())
    setPlatform('uber')
    onClose()
  }

  const save = async () => {
    const v = parseFloat(amount.replace(',', '.'))
    if (isNaN(v) || v <= 0) return setErr('Informe um valor válido.')
    setBusy(true)
    setErr(null)
    try {
      await addEarning({
        date,
        platform,
        amount: v,
        earned_time: time ? `${time}:00` : null,
        notes: notes.trim() || null,
      })
      close()
    } catch {
      setErr('Não foi possível salvar.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} title="Novo ganho" onClose={close}>
      <div className="space-y-4">
        <div>
          <label className="label">Plataforma</label>
          <div className="grid grid-cols-2 gap-2">
            {(['uber', '99'] as Platform[]).map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`btn ${platform === p ? 'btn-primary' : 'btn-ghost'}`}
              >
                {PLATFORM_LABEL[p]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Valor recebido (R$)</label>
          <input
            className="input font-mono text-lg"
            type="number"
            inputMode="decimal"
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="ex: 148,50"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Data</label>
            <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="label">Hora (opcional)</label>
            <input className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Observação (opcional)</label>
          <input
            className="input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="ex: corrida aeroporto"
          />
        </div>
        <p className="text-xs text-muted">
          A hora é opcional, mas habilita o ranking de horários mais lucrativos.
        </p>
        {err && <p className="text-sm text-loss">{err}</p>}
        <button className="btn-primary w-full" onClick={save} disabled={busy}>
          {busy ? 'Salvando…' : 'Salvar ganho'}
        </button>
      </div>
    </Modal>
  )
}
