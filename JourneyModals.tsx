import { type ReactNode, useEffect } from 'react'
import { IconClose } from './icons'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export default function Modal({ open, title, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Bottom-sheet no celular, card centralizado no desktop.
          max-h + scroll interno garante que o botão de salvar nunca
          fique escondido atrás do teclado. */}
      <div
        className="card w-full sm:max-w-md rounded-b-none sm:rounded-2xl flex flex-col max-h-[90dvh] sm:max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-text p-1 -mr-1 shrink-0"
            aria-label="Fechar"
          >
            <IconClose />
          </button>
        </div>
        <div className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  )
}
