# EV Co-ownership & Cost-sharing System

Hệ thống quản lý đồng sở hữu và chia sẻ chi phí xe điện

## 🏗️ Architecture
- **Frontend**: React.js + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js (Microservices)
- **Database**: PostgreSQL + MongoDB
- **Infrastructure**: Docker + Redis + RabbitMQ

## 🚀 Quick Start

### Development
```bash
# Clone và cài đặt
git clone <repository-url>
cd ev-coownership-system

# Copy environment variables
cp .env.example .env

# Khởi chạy với Docker
docker-compose up -d

# Hoặc chạy development mode
docker-compose -f docker-compose.dev.yml up -d

docker compose -f docker-compose.dev.yml --profile auth up -d
