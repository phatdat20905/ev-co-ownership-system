import { Button } from '@/components/ui/button'

export default function Booking() {
  return (
    <div className="container mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Đặt lịch sử dụng</h1>
        <Button variant="hero">Tạo lịch</Button>
      </div>
      <div className="rounded-xl border border-border bg-card p-6 text-muted-foreground">
        Lịch trống. Hãy tạo lịch sử dụng đầu tiên của bạn.
      </div>
    </div>
  )
}
