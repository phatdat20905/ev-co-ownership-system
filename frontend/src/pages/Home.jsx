import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Zap, 
  Menu,
  Calendar, 
  DollarSign, 
  Users, 
  Clock, 
  BarChart3, 
  Shield,
  UserPlus,
  Car,
  PieChart,
  TrendingDown,
  Smartphone,
  LineChart,
  Mail,
  Facebook,
  Twitter,
  Linkedin
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-ev.svg";

const Home = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  const navLinks = [
    { label: "Tính năng", href: "#features" },
    { label: "Cách hoạt động", href: "#how-it-works" },
    { label: "Lợi ích", href: "#benefits" },
    { label: "Liên hệ", href: "#contact" },
  ];

  const features = [
    {
      icon: Calendar,
      title: "Đặt lịch thông minh",
      description: "Quản lý lịch sử dụng xe hiệu quả với hệ thống ưu tiên công bằng dựa trên tỉ lệ sở hữu",
      color: "text-primary",
    },
    {
      icon: DollarSign,
      title: "Chia sẻ chi phí tự động",
      description: "Tính toán và phân chia chi phí minh bạch theo tỉ lệ sở hữu hoặc mức độ sử dụng",
      color: "text-secondary",
    },
    {
      icon: Users,
      title: "Quản lý nhóm",
      description: "Quản lý nhóm đồng sở hữu, bỏ phiếu quyết định và quỹ chung minh bạch",
      color: "text-accent",
    },
    {
      icon: Clock,
      title: "Lịch sử chi tiết",
      description: "Theo dõi lịch sử sử dụng, quãng đường và chi phí phát sinh của từng chuyến đi",
      color: "text-primary",
    },
    {
      icon: BarChart3,
      title: "Phân tích AI",
      description: "Gợi ý lịch sử dụng công bằng và tối ưu hóa hiệu quả sử dụng xe với AI",
      color: "text-secondary",
    },
    {
      icon: Shield,
      title: "Hợp đồng điện tử",
      description: "Quản lý hợp đồng đồng sở hữu an toàn với chữ ký điện tử và lưu trữ bảo mật",
      color: "text-accent",
    },
  ];

  const steps = [
    {
      icon: UserPlus,
      title: "Tạo nhóm đồng sở hữu",
      description: "Mời các đồng sở hữu tham gia và xác định tỉ lệ sở hữu của từng thành viên",
      step: "01",
    },
    {
      icon: Car,
      title: "Thêm thông tin xe",
      description: "Cập nhật thông tin xe điện, hợp đồng và thiết lập quy tắc sử dụng chung",
      step: "02",
    },
    {
      icon: Calendar,
      title: "Đặt lịch sử dụng",
      description: "Đặt lịch sử dụng xe thông qua lịch chung, hệ thống tự động phân bổ công bằng",
      step: "03",
    },
    {
      icon: PieChart,
      title: "Theo dõi & thanh toán",
      description: "Hệ thống tự động tính chi phí và phân chia theo tỉ lệ, thanh toán trực tuyến dễ dàng",
      step: "04",
    },
  ];

  const benefits = [
    {
      icon: TrendingDown,
      title: "Tiết kiệm chi phí",
      description: "Giảm chi phí sở hữu xe lên đến 70% thông qua việc chia sẻ với đồng sở hữu",
      stats: "70%",
    },
    {
      icon: Shield,
      title: "Minh bạch & an toàn",
      description: "Mọi giao dịch và chi phí được ghi nhận tự động, hợp đồng điện tử đảm bảo quyền lợi",
      stats: "100%",
    },
    {
      icon: Smartphone,
      title: "Quản lý dễ dàng",
      description: "Giao diện trực quan, thao tác đơn giản trên mọi thiết bị, mọi lúc mọi nơi",
      stats: "24/7",
    },
    {
      icon: LineChart,
      title: "Tối ưu hóa sử dụng",
      description: "AI phân tích và gợi ý lịch sử dụng công bằng, tối đa hóa hiệu quả sử dụng xe",
      stats: "AI",
    },
  ];

  const footerLinks = {
    product: [
      { label: "Tính năng", href: "#features" },
      { label: "Cách hoạt động", href: "#how-it-works" },
      { label: "Bảng giá", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
    company: [
      { label: "Về chúng tôi", href: "#about" },
      { label: "Blog", href: "#blog" },
      { label: "Tuyển dụng", href: "#careers" },
      { label: "Liên hệ", href: "#contact" },
    ],
    legal: [
      { label: "Điều khoản dịch vụ", href: "#terms" },
      { label: "Chính sách bảo mật", href: "#privacy" },
      { label: "Cookies", href: "#cookies" },
      { label: "Giấy phép", href: "#license" },
    ],
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-[image:var(--gradient-primary)] flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <div className="font-bold text-lg">EV Co-own</div>
                <div className="text-xs text-muted-foreground">Đồng sở hữu xe điện</div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-foreground/80 hover:text-foreground transition-[var(--transition-smooth)]"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/login')}>Đăng nhập</Button>
              <Button variant="hero" onClick={() => navigate('/register')}>Đăng ký</Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-accent"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="md:hidden py-4 space-y-4 border-t border-border">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block py-2 text-sm font-medium text-foreground/80 hover:text-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-4">
                <Button variant="ghost" className="w-full" onClick={() => { setIsOpen(false); navigate('/login') }}>Đăng nhập</Button>
                <Button variant="hero" className="w-full" onClick={() => { setIsOpen(false); navigate('/register') }}>Đăng ký</Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-[image:var(--gradient-hero)] opacity-10" />
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Giải pháp đồng sở hữu xe điện thông minh
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Quản lý & Chia sẻ
                <span className="block bg-clip-text text-transparent bg-[image:var(--gradient-primary)]">
                  Chi phí Xe Điện
                </span>
                Hiệu quả
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-xl">
                Hệ thống toàn diện giúp các chủ xe đồng sở hữu quản lý lịch sử dụng, 
                chia sẻ chi phí minh bạch và tối ưu hóa hiệu quả sử dụng xe điện.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="hero" size="lg" className="group" onClick={() => navigate('/register')}>
                  Bắt đầu ngay
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate('/login')}>
                  Tìm hiểu thêm
                </Button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
                <div>
                  <div className="text-3xl font-bold text-primary">500+</div>
                  <div className="text-sm text-muted-foreground">Người dùng</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-secondary">200+</div>
                  <div className="text-sm text-muted-foreground">Xe điện</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-accent">99%</div>
                  <div className="text-sm text-muted-foreground">Hài lòng</div>
                </div>
              </div>
            </div>
            
            {/* Right image */}
            <div className="relative">
              <div className="absolute inset-0 bg-[image:var(--gradient-primary)] opacity-20 blur-3xl" />
              <img
                src={heroImage}
                alt="Modern electric vehicle with charging station"
                className="relative rounded-3xl shadow-2xl w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              Tính năng nổi bật
            </h2>
            <p className="text-lg text-muted-foreground">
              Giải pháp toàn diện cho việc quản lý và chia sẻ xe điện hiệu quả
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-[var(--shadow-elegant)] transition-[var(--transition-smooth)]"
              >
                <div className={`w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              Cách hoạt động
            </h2>
            <p className="text-lg text-muted-foreground">
              Bắt đầu quản lý xe điện đồng sở hữu chỉ với 4 bước đơn giản
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-16 left-0 right-0 h-0.5 bg-[image:var(--gradient-primary)] opacity-20" />
            
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center space-y-4">
                  {/* Step number */}
                  <div className="relative inline-flex items-center justify-center">
                    <div className="absolute inset-0 bg-[image:var(--gradient-primary)] opacity-20 blur-xl" />
                    <div className="relative w-16 h-16 rounded-2xl bg-card border-2 border-primary flex items-center justify-center">
                      <step.icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              Lợi ích vượt trội
            </h2>
            <p className="text-lg text-muted-foreground">
              Những giá trị thiết thực mà hệ thống mang lại cho người dùng
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="relative p-8 rounded-3xl bg-card border border-border overflow-hidden group hover:border-primary/50 transition-[var(--transition-smooth)]"
              >
                {/* Background gradient */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[image:var(--gradient-primary)] opacity-0 group-hover:opacity-10 blur-3xl transition-opacity" />
                
                <div className="relative flex items-start gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <benefit.icon className="w-7 h-7 text-primary" />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <h3 className="text-2xl font-semibold">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </div>
                  
                  <div className="text-5xl font-bold bg-clip-text text-transparent bg-[image:var(--gradient-primary)] opacity-30">
                    {benefit.stats}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Background with gradient */}
            <div className="absolute inset-0 bg-[image:var(--gradient-hero)]" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
            
            <div className="relative px-8 py-16 md:py-20 text-center space-y-8">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground max-w-3xl mx-auto">
                Sẵn sàng bắt đầu hành trình xe điện thông minh?
              </h2>
              
              <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto">
                Tham gia cùng hàng trăm người dùng đang quản lý xe điện hiệu quả và tiết kiệm chi phí
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="group shadow-lg hover:shadow-xl"
                >
                  Đăng ký miễn phí
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20"
                >
                  <Mail className="w-5 h-5" />
                  Liên hệ tư vấn
                </Button>
              </div>
              
              <p className="text-sm text-primary-foreground/70">
                Không cần thẻ tín dụng • Dùng thử miễn phí 30 ngày
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
            {/* Brand */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-[image:var(--gradient-primary)] flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <div className="font-bold text-lg">EV Co-own</div>
                  <div className="text-xs text-muted-foreground">Đồng sở hữu xe điện</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                Giải pháp quản lý và chia sẻ chi phí xe điện thông minh, 
                minh bạch và hiệu quả cho người Việt.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-9 h-9 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors">
                  <Facebook className="w-4 h-4 text-primary" />
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors">
                  <Twitter className="w-4 h-4 text-primary" />
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors">
                  <Linkedin className="w-4 h-4 text-primary" />
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors">
                  <Mail className="w-4 h-4 text-primary" />
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="font-semibold mb-4">Sản phẩm</h3>
              <ul className="space-y-2">
                {footerLinks.product.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Công ty</h3>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Pháp lý</h3>
              <ul className="space-y-2">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 EV Co-own. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Made with ❤️ in Vietnam
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
