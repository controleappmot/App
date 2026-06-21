@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: dark;
}

* {
  -webkit-tap-highlight-color: transparent;
}

html,
body,
#root {
  height: 100%;
}

body {
  margin: 0;
  background: #0c0e14;
  color: #e7e9f0;
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  overscroll-behavior-y: none;
}

/* Tabular numbers para alinhar valores monetários */
.tnum {
  font-variant-numeric: tabular-nums;
}

/* Inputs nativos com aparência consistente no tema escuro */
input,
select,
textarea {
  font-family: inherit;
}

input[type='date'],
input[type='time'] {
  color-scheme: dark;
}

/* Esconde a setinha padrão do number no mobile/desktop */
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-thumb {
  background: #272c3d;
  border-radius: 8px;
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
}

/* Componentes utilitários reaproveitados */
@layer components {
  .card {
    @apply bg-surface border border-line rounded-2xl;
  }
  .input {
    @apply w-full bg-surface-2 border border-line rounded-xl px-3.5 py-3 text-text
           outline-none focus:border-brand/70 focus:ring-2 focus:ring-brand/20
           placeholder:text-muted transition;
  }
  .label {
    @apply block text-xs font-medium text-muted mb-1.5 uppercase tracking-wide;
  }
  .btn {
    @apply inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3
           font-semibold transition active:scale-[0.98] disabled:opacity-50
           disabled:pointer-events-none;
  }
  .btn-primary {
    @apply btn bg-brand text-base hover:brightness-110;
  }
  .btn-ghost {
    @apply btn bg-surface-2 text-text border border-line hover:border-muted/60;
  }
  .btn-danger {
    @apply btn bg-loss/15 text-loss border border-loss/30 hover:bg-loss/25;
  }
  .chip {
    @apply inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium;
  }
}
