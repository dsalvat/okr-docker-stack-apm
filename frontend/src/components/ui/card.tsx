import { clsx } from 'clsx'
export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={clsx('rounded-2xl border border-gray-200 bg-white shadow-sm', className)}>{children}</div>
}
export function CardHeader({ children, className }: any) {
  return <div className={clsx('p-4 border-b border-gray-100', className)}>{children}</div>
}
export function CardContent({ children, className }: any) {
  return <div className={clsx('p-4', className)}>{children}</div>
}
