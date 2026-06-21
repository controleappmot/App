import { useMemo, useState } from 'react'
import { useData } from '../contexts/DataContext'
import ExpenseModal from '../components/ExpenseModal'
import { IconPlus, IconTrash } from '../components/icons'
import { formatFullDate } from '../lib/dates'
import { formatBRL } from '../lib/calculations'
import { CATEGORY_LABEL, CATEGORY_EMOJI, type Expense } from '../lib/types'

export default function Gastos() {
  const { expenses, deleteExpense } = useData()
  const [open, setOpen] = useState(false)

  const grouped = useMemo(() => {
    const map = new Map<string, Expense[]>()
    for (const x of expenses) {
      const arr = map.get(x.date) ?? []
      arr.push(x)
      map.set(x.date, arr)
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]))
  }, [expenses])

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold">Gastos</h1>
          <p className="text-sm text-muted">Combustível, pedágio, manutenção e mais.</p>
        </div>
        <button className="btn-primary !px-3 !py-2" onClick={() => setOpen(true)}>
          <IconPlus width={18} height={18} /> Novo
        </button>
      </header>

      <section className="space-y-4">
        {grouped.length === 0 && (
          <p className="text-center text-muted text-sm py-10">Nenhum gasto registrado ainda.</p>
        )}
        {grouped.map(([day, items]) => {
          const total = items.reduce((s, x) => s + x.amount, 0)
          return (
            <div key={day}>
              <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="text-sm font-semibold">{formatFullDate(day)}</h3>
                <span className="text-sm font-mono font-semibold text-loss">{formatBRL(total)}</span>
              </div>
              <div className="space-y-2">
                {items.map((x) => (
                  <div key={x.id} className="card p-3.5 flex items-center gap-3">
                    <span className="text-xl shrink-0">{CATEGORY_EMOJI[x.category]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{CATEGORY_LABEL[x.category]}</div>
                      {x.notes && <div className="text-xs text-muted truncate">{x.notes}</div>}
                    </div>
                    <span className="font-mono font-semibold text-loss">{formatBRL(x.amount)}</span>
                    <button
                      onClick={() => { if (confirm('Excluir este gasto?')) deleteExpense(x.id) }}
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

      <ExpenseModal open={open} onClose={() => setOpen(false)} />
    </div>
  )
}
