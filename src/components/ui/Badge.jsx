/**
 * Badge — rounded pill with white text on a solid color.
 * `bg` accepts any CSS color (e.g. a 'var(--color-goal)' token).
 * Sizing/tracking/weight come from `className`.
 */
export default function Badge({ bg = 'var(--color-goal)', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full text-white ${className}`}
      style={{ backgroundColor: bg }}
    >
      {children}
    </span>
  )
}
