import Card from '../ui/Card'
import Skeleton from '../ui/Skeleton'

/** Loading placeholder mirroring the dashboard section layout. */
export default function DashboardSkeleton() {
  return (
    <>
      <Card variant="cream" className="p-[25px] flex flex-col items-center gap-4">
        <Skeleton bg="bg-soft" className="size-[96px] rounded-full" />
        <Skeleton bg="bg-card-border" className="h-7 w-40 rounded" />
        <Skeleton bg="bg-card-border" className="h-5 w-28 rounded" />
      </Card>
      <Card variant="stat" className="py-6 flex justify-around">
        <Skeleton bg="bg-card-border" className="h-12 w-20 rounded" />
        <Skeleton bg="bg-card-border" className="h-12 w-20 rounded" />
      </Card>
      <Card className="p-[25px] flex flex-col gap-4">
        <Skeleton bg="bg-card-border" className="h-5 w-32 rounded" />
        <Skeleton bg="bg-card" className="w-full rounded-[12px] h-[192px]" />
      </Card>
      <Card className="p-[25px] flex flex-col gap-4">
        <Skeleton bg="bg-card-border" className="h-5 w-40 rounded" />
        <Skeleton bg="bg-card" className="w-full rounded-[12px] h-[160px]" />
      </Card>
      <Card className="p-[25px] flex flex-col gap-4">
        <Skeleton bg="bg-card-border" className="h-5 w-36 rounded" />
        <Skeleton bg="bg-card" className="h-24 w-full rounded-[12px]" />
      </Card>
      <Card className="p-[25px] flex flex-col gap-4">
        <Skeleton bg="bg-card-border" className="h-5 w-44 rounded" />
        <Skeleton bg="bg-card" className="h-40 w-full rounded-[12px]" />
      </Card>
    </>
  )
}
