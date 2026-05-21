/**
 * Skeleton — shimmer placeholder block.
 * `bg` is a Tailwind bg utility (default 'bg-skeleton'); size + radius come
 * from `className`.
 */
export default function Skeleton({ className = '', bg = 'bg-skeleton' }) {
  return <div className={`animate-pulse ${bg} ${className}`} />
}
