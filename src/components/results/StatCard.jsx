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
    <Card className="flex-1 p-5 flex flex-col">
      <span className="leading-none font-bold text-[48px]" style={{ color: valueColor }}>
        {value}
      </span>
      <span className="text-muted text-[11px] tracking-[0.96px] mt-1 font-extrabold">
        {label}
      </span>
      <span className="text-[12px] mt-2" style={{ color: subColor }}>
        {sub}
      </span>
    </Card>
  )
}
