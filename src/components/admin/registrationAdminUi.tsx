'use client'

export const editInput =
  'w-full px-3 py-2.5 rounded-lg border border-slate-600 bg-slate-800 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/30'

export const editCheckbox =
  'rounded border-slate-500 bg-slate-800 text-amber-500 focus:ring-amber-500/40'

export const editCheckLabel = 'inline-flex items-center gap-2 text-sm text-slate-300'

export function delegateInitials(first?: string, last?: string): string {
  const a = (first?.trim()?.[0] || '').toUpperCase()
  const b = (last?.trim()?.[0] || '').toUpperCase()
  return a + b || '?'
}

export function EditSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-semibold tracking-[0.2em] text-amber-400/85 mb-4 uppercase">
      {children}
    </h2>
  )
}

export function EditSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-5 sm:p-6 space-y-4">
      <EditSectionLabel>{title}</EditSectionLabel>
      {children}
    </section>
  )
}

export function EditField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

export const REGISTRATION_STATUS_OPTIONS = [
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'pending', label: 'Pending' },
  { value: 'cancelled', label: 'Cancelled' },
] as const

export function StatusPills({
  value,
  onChange,
  options = REGISTRATION_STATUS_OPTIONS,
}: {
  value: string
  onChange: (value: string) => void
  options?: ReadonlyArray<{ value: string; label: string }>
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
            value === opt.value
              ? 'border-amber-400 text-amber-300 bg-amber-400/10 shadow-sm shadow-amber-900/20'
              : 'border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-200'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
