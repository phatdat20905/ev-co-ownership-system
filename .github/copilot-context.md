# 🧠 Copilot Context: EV Co-ownership & Cost-sharing System

## 🎯 Overview

**Project Name:** EV Co-ownership & Cost-sharing System  
**Purpose:**  
A complete **microservices-based platform** for managing co-ownership of electric vehicles (EVs).  
The system enables multiple owners to share usage, automate cost splitting, handle scheduling conflicts, and ensure fairness using data-driven AI recommendations.

**Actors:**
- **Co-owner:** Manages vehicle usage, ownership ratio, and payments.  
- **Staff:** Operates vehicle services (check-in/out, maintenance).  
- **Admin:** Oversees all co-owner groups, resolves disputes, and manages staff.  
- **AI Service:** Provides usage analytics and fairness optimization suggestions.

---

## 🧩 Core Features

### 👤 Co-owner Features
1. **Account & Ownership Management**
   - Register and verify KYC (National ID, Driver License).
   - Manage ownership ratio (e.g., A: 40%, B: 30%, C: 30%).
   - Handle e-contracts with digital signatures.

2. **Vehicle Booking & Scheduling**
   - View real-time shared calendar.
   - Reserve vehicles with conflict resolution.
   - **Fair scheduling algorithm**: priority based on ownership ratio + usage history.
   - Check-in/out with QR code and digital signature.

3. **Cost & Payment**
   - Automatic cost sharing: ownership-based, usage-based, or custom.
   - Expense categories: charging, maintenance, insurance, inspection, cleaning.
   - Online payment integration (e-wallet, bank transfer, credit card).
   - Generate monthly and quarterly reports.

4. **Usage History & Analytics**
   - Track time, distance, and cost per usage.
   - Compare actual usage vs ownership ratio.
   - Visual analytics dashboards.

5. **Group Co-ownership**
   - Manage co-owner groups (add/remove members, assign roles).
   - Group admin privileges (approve votes, manage fund).
   - Voting & decision-making for upgrades, insurance, or selling vehicles.
   - Transparent shared fund (deposits, withdrawals, logs).

6. **AI Recommendations**
   - Analyze usage and fairness data.
   - Suggest optimized booking times to balance usage among co-owners.
   - Predict maintenance or overuse patterns.
   - Learn from historical booking and cost trends.

---

### 🧰 Staff & Admin Features
- Manage co-owned vehicle groups and contracts.  
- Verify vehicle check-in/out (QR + signature).  
- Track service and maintenance records.  
- Manage disputes, staff profiles, and system settings.  
- Generate transparent cost and usage reports.  
- View audit logs and analytics dashboards.  

---

## 🏗️ System Architecture

**Type:** Microservices Architecture  
Each service has its own database (PostgreSQL or MongoDB).

### Core Services

| Service | Description | Port |
|----------|--------------|------|
| **Auth Service** | User authentication, JWT, KYC verification | 3001 |
| **User Service** | Profile, group, ownership, voting | 3002 |
| **Booking Service** | Booking, calendar, conflict resolution, check-in/out | 3003 |
| **Cost Service** | Cost tracking, payment, invoices | 3004 |
| **Vehicle Service** | Vehicle data, maintenance, insurance | 3005 |
| **Contract Service** | Legal e-contract management | 3006 |
| **Admin Service** | Disputes, staff, reports, audit logs | 3007 |
| **AI Service** | Fairness analysis, predictive scheduling, analytics API | 3009 |
| **Notification Service** | Email, SMS, push notifications | 3008 |

### Shared Components
- **Redis:** Caching and session management  
- **RabbitMQ / Kafka:** Event-driven communication  
- **PostgreSQL:** Primary relational DB per service  
- **MongoDB:** Logs and analytical storage  
- **Nginx:** API reverse proxy  
- **Docker & Docker Compose:** Container orchestration  

---

