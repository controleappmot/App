import { useState } from 'react'
import Modal from './Modal'
import { useData } from '../contexts/DataContext'
import { todayISO } from '../lib/dates'
import { CATEGORY_LABEL, CATEGORY_EMOJI, type ExpenseCategory } from '../lib/types'

const CATEGORIES = Object.keys(CATEGORY_LABEL) as ExpenseCategory[]

export default function ExpenseModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addExpense } = useData()
  const [date, setDate] = useState(todayISO())
  const [category, setCategory] = useState<ExpenseCategory>('combustivel')
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const close = () => {
    setAmount('')
    setNotes('')
    setErr(null)
    setDate(todayISO())
    setCategory('combustivel')
    onClose()
  }

  const save = async () => {
    const v = parseFloat(amount.replace(',', '.'))
    if (isNaN(v) || v <= 0) return setErr('Informe um valor válido.')
    setBusy(true)
    setErr(null)
    try {
      await addExpense({ date, category, amount: v, notes: notes.trim() || null })
      close()
    } catch {
      setErr('Não foi possível salvar.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} title="Novo gasto" onClose={close}>
      <div className="space-y-4">
        <div>
          <label className="label">Categoria</label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`btn text-sm ${category === c ? 'btn-primary' : 'btn-ghost'}`}
              >
                <span>{CATEGORY_EMOJI[c]}</span>
                {CATEGORY_LABEL[c]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Valor (R$)</label>
          <input
            className="input font-mono text-lg"
            type="number"
            inputMode="decimal"
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="ex: 80,00"
          />
        </div>
        <div>
          <label className="label">Data</label>
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label className="label">Observação (opcional)</label>
          <input
            className="input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="ex: posto Shell, 25 litros"
          />
        </div>
        {err && <p className="text-sm text-loss">{err}</p>}
        <button className="btn-primary w-full" onClick={save} disabled={busy}>
          {busy ? 'Salvando…' : 'Salvar gasto'}
        </button>
      </div>
    </Modal>
  )
}
