import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-20 text-center space-y-4">
      <h1 className="text-3xl font-bold">404 - Không tìm thấy trang</h1>
      <p className="text-muted-foreground">Trang bạn tìm không tồn tại hoặc đã bị di chuyển.</p>
      <Link to="/" className="text-primary hover:underline">Về trang chủ</Link>
    </div>
  )
}
