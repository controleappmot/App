import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>

const base = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export const IconGauge = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
    <path d="m13.4 12.6 4.6-4.6" />
    <path d="M4.2 19a9 9 0 1 1 15.6 0" />
  </svg>
)

export const IconRoute = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="6" cy="19" r="2.5" />
    <circle cx="18" cy="5" r="2.5" />
    <path d="M8.5 19H14a3.5 3.5 0 0 0 0-7H10a3.5 3.5 0 0 1 0-7h5.5" />
  </svg>
)

export const IconWallet = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v0H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1v-3" />
    <path d="M16 12h5v4h-5a2 2 0 0 1 0-4Z" />
  </svg>
)

export const IconReceipt = (p: P) => (
  <svg {...base} {...p}>
    <path d="M5 3v18l2-1 2 1 2-1 2 1 2-1 2 1V3l-2 1-2-1-2 1-2-1-2 1Z" />
    <path d="M9 8h6M9 12h6" />
  </svg>
)

export const IconChart = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3 3v18h18" />
    <path d="M7 14l3-4 3 2 4-6" />
  </svg>
)

export const IconBrain = (p: P) => (
  <svg {...base} {...p}>
    <path d="M9 3a3 3 0 0 0-3 3 3 3 0 0 0-1 5.8A3 3 0 0 0 7 17a3 3 0 0 0 5 1 3 3 0 0 0 5-1 3 3 0 0 0 2-5.2A3 3 0 0 0 18 6a3 3 0 0 0-3-3 3 3 0 0 0-3 1.5A3 3 0 0 0 9 3Z" />
    <path d="M12 5v13" />
  </svg>
)

export const IconPlay = (p: P) => (
  <svg {...base} {...p}>
    <path d="m7 4 13 8-13 8V4Z" />
  </svg>
)

export const IconStop = (p: P) => (
  <svg {...base} {...p}>
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
)

export const IconPlus = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const IconTrash = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13" />
  </svg>
)

export const IconLogout = (p: P) => (
  <svg {...base} {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5M21 12H9" />
  </svg>
)

export const IconClose = (p: P) => (
  <svg {...base} {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)
