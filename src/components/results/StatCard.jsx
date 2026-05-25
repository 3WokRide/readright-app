import Card from '../ui/Card'

/**
 * StatCard — large stat value + label + sub-line. Used for WPM and Word
 * Recognition. `valueColor`/`subColor` accept CSS color tokens.
 */
export default function StatCard({
  value,
  label,
  sub,
  valueColor = 'var(--color-brand)',
  subColor = 'var(--color-muted)',
}) {
  return (
    <Card className="flex-1 p-5 flex flex-col items-center text-center">
      <span className="leading-none font-bold text-[48px]" style={{ color: valueColor }}>
        {value}
      </span>
      <span className="text-muted text-[11px] tracking-[0.96px] mt-2 font-extrabold uppercase leading-[1.3]">
        {label}
      </span>
      <div className="bg-divider h-px w-full my-3" />
      <span className="text-[12px]" style={{ color: subColor }}>
        {sub}
      </span>
    </Card>
  )
}
