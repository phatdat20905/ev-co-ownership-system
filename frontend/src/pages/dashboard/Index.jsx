export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">Bảng điều khiển</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="text-sm text-muted-foreground">Xe đang hoạt động</div>
          <div className="text-3xl font-semibold mt-2">2</div>
        </div>
        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="text-sm text-muted-foreground">Lịch đặt hôm nay</div>
          <div className="text-3xl font-semibold mt-2">3</div>
        </div>
        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="text-sm text-muted-foreground">Chi phí chờ duyệt</div>
          <div className="text-3xl font-semibold mt-2">₫1.2M</div>
        </div>
      </div>
    </div>
  )
}
