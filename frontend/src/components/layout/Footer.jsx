import { Zap, Facebook, Twitter, Linkedin, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-[image:var(--gradient-primary)] flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="font-semibold">EV Co-own</div>
            </div>
            <p className="text-sm text-muted-foreground">Quản lý đồng sở hữu xe điện minh bạch và hiệu quả.</p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary/20 grid place-items-center"><Facebook className="w-4 h-4 text-primary"/></a>
              <a href="#" className="w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary/20 grid place-items-center"><Twitter className="w-4 h-4 text-primary"/></a>
              <a href="#" className="w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary/20 grid place-items-center"><Linkedin className="w-4 h-4 text-primary"/></a>
              <a href="#" className="w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary/20 grid place-items-center"><Mail className="w-4 h-4 text-primary"/></a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Sản phẩm</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground">Tính năng</a></li>
              <li><a href="#how-it-works" className="hover:text-foreground">Cách hoạt động</a></li>
              <li><a href="#benefits" className="hover:text-foreground">Lợi ích</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Công ty</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#about" className="hover:text-foreground">Về chúng tôi</a></li>
              <li><a href="#blog" className="hover:text-foreground">Blog</a></li>
              <li><a href="#careers" className="hover:text-foreground">Tuyển dụng</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Pháp lý</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#terms" className="hover:text-foreground">Điều khoản</a></li>
              <li><a href="#privacy" className="hover:text-foreground">Bảo mật</a></li>
              <li><a href="#license" className="hover:text-foreground">Giấy phép</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-border text-sm text-muted-foreground flex justify-between flex-wrap gap-2">
          <div>© 2025 EV Co-own. All rights reserved.</div>
          <div>Made with ❤️ in Vietnam</div>
        </div>
      </div>
    </footer>
  )
}
