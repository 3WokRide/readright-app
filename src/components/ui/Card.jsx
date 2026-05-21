const variants = {
  default: 'bg-white',
  cream: 'bg-card',
  stat: 'bg-stat',
}

/**
 * Card — the standard ReadRight surface: bordered, bottom drop-shadow, 12px radius.
 * variant: 'default' (white) | 'cream' (#fff0ee) | 'stat' (#f1dcc9)
 */
export default function Card({ variant = 'default', className = '', children, ...props }) {
  return (
    <div
      className={`${variants[variant]} border border-card-border shadow-card rounded-[12px] ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
