import { clsx } from 'clsx'
export function Badge({ children, variant='default' }: { children: React.ReactNode; variant?: 'default'|'success'|'warn'|'muted' }) {
  const map = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warn: 'bg-yellow-100 text-yellow-700',
    muted: 'bg-gray-50 text-gray-500 border border-gray-200'
  } as const
  return <span className={clsx('inline-flex items-center rounded-full px-2 py-0.5 text-xs', map[variant])}>{children}</span>
}
