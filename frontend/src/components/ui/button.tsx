import { clsx } from 'clsx'
export function Button({ children, className, ...props }: any) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
