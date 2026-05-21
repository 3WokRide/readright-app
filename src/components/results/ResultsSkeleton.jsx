import Skeleton from '../ui/Skeleton'

/** Loading placeholder matching the results page section heights. */
export default function ResultsSkeleton() {
  return (
    <>
      <Skeleton className="h-[140px] w-full rounded-[8px]" />
      <div className="flex gap-4">
        <Skeleton className="flex-1 h-[110px] rounded-[8px]" />
        <Skeleton className="flex-1 h-[110px] rounded-[8px]" />
      </div>
      <Skeleton className="h-[220px] w-full rounded-[8px]" />
      <Skeleton className="h-[280px] w-full rounded-[8px]" />
      <Skeleton className="h-[100px] w-full rounded-[8px]" />
    </>
  )
}
