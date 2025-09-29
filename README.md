# DPW Micro-Tasking Platform 2025

A modern, mobile-first web application for the Digital Public Works project, enabling youth participants to complete micro-tasking work by tagging 360° community images.

![Platform Status](https://img.shields.io/badge/Status-Phase%201%20Complete-green)
![Next.js](https://img.shields.io/badge/Next.js-15.5.4-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.x-blue)

## 🎯 Project Overview

The DPW Micro-Tasking Platform provides short-term digital work opportunities for youth participants by allowing them to tag images from their communities. The application focuses on infrastructure assessment through 360° panoramic images, with a consensus-based quality assurance system and tiered payment structure.

### Key Features

- **Mobile-First Design**: Optimized for low-end smartphones with lightweight, performant architecture
- **Consensus-Based Quality**: Majority vote system determines ground truth for payments
- **Tiered Payment System**: Base pay (KES 760) + accuracy-based bonuses up to 30%
- **Real-Time Progress**: Daily task tracking with visual progress indicators
- **Admin Management**: Complete user and campaign management system

## 🏗️ Architecture

### Technology Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS v4
- **Backend**: Next.js API Routes (Full-Stack Architecture)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based with phone number verification
- **State Management**: Zustand for client-side state
- **UI Components**: Headless UI + Custom components
- **Development**: Docker Compose for local PostgreSQL

### Design Philosophy

Inspired by Apple's design principles and showcased interfaces on [Refero.design](https://refero.design) and [Mobbin.com](https://mobbin.com):

- **Minimalist Aesthetic**: Clean, white-dominated interface with strategic red accents
- **Card-Based Layout**: Organized information presentation with soft shadows
- **Typography-First**: Inter font with strong hierarchy and high contrast
- **Touch-Optimized**: 44px minimum touch targets for mobile accessibility

### Color Palette

- **Primary**: White (#FFFFFF) - Dominant background
- **Secondary**: Black (#1D1D1F) - Text and standard elements  
- **Accent**: Red (#EF4444) - CTAs, active states, notifications
- **Muted**: Gray tones for subtle elements

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Docker and Docker Compose (for database)
- Git for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SpatialCollectiveLtd/DPW-MicroTasking-App-2025.git
   cd DPW-MicroTasking-App-2025
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start the database**
   ```bash
   npm run docker:up
   ```

5. **Set up the database**
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📱 Application Flow

### Worker Experience

1. **Authentication**: Phone number + Settlement selection
2. **Dashboard**: Daily progress tracking and news feed
3. **Task Interface**: Single 360° image + Yes/No question
4. **Progress Tracking**: Visual completion indicators
5. **Completion**: Daily target achievement confirmation

### Admin Experience

1. **User Management**: Register workers, assign settlements
2. **Campaign Creation**: Upload CSV images, set questions
3. **Settlement Assignment**: Target specific communities
4. **Reporting**: Generate payment and activity reports

### System Processing

1. **Work Window**: 6 AM - 6 PM daily task availability
2. **Consensus Engine**: Nightly majority vote processing
3. **Payment Calculation**: Base pay + tiered accuracy bonuses
4. **Quality Assurance**: Automated ground truth determination

## 💰 Payment Structure

### Base Pay
- **KES 760** guaranteed for completing ~300 daily tasks

### Quality Bonuses
- **90%+ accuracy**: 30% bonus (KES 228)
- **80-89% accuracy**: 20% bonus (KES 152)  
- **70-79% accuracy**: 10% bonus (KES 76)
- **Below 70%**: No bonus (base pay only)

### Example Calculation
Worker completes 300 tasks with 92% accuracy:
- Base Pay: KES 760
- Quality Bonus: KES 228 (30% tier)
- **Total: KES 988**

## 🗄️ Database Schema

### Core Entities

- **Users**: Workers and Admins with settlement assignments
- **Settlements**: Geographic locations (Mji wa Huruma, Kayole Soweto, Kariobangi)
- **Campaigns**: Task collections with questions and images
- **Images**: 360° panoramic URLs from CSV uploads
- **Responses**: Worker answers (Yes/No) to images
- **DailyReports**: Payment calculations and analytics
- **News**: Admin announcements and updates

### Sample Data

The application includes seed data with:
- 3 settlements from Nairobi and Machakos
- Sample 360° panoramic images from Wikimedia Commons
- Infrastructure assessment questions
- Test user accounts for development

## 🛠️ Development Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema to database
npm run db:migrate      # Create and run migrations
npm run db:seed         # Seed with sample data
npm run db:studio       # Open Prisma Studio

# Docker
npm run docker:up       # Start PostgreSQL container
npm run docker:down     # Stop containers
npm run docker:reset    # Reset database and containers
```

## 📊 Project Status

### ✅ Phase 1: Foundation (Completed)
- [x] Next.js 14 setup with TypeScript
- [x] Tailwind CSS v4 configuration
- [x] Prisma ORM with PostgreSQL schema
- [x] Project structure and utilities
- [x] Docker development environment
- [x] Sample data and seeding

### 🚧 Phase 2: Database & Docker (Next)
- [ ] PostgreSQL container setup
- [ ] Database migrations
- [ ] Seed data implementation
- [ ] Development environment testing

### 📋 Upcoming Phases
- [ ] Authentication system
- [ ] Core UI components
- [ ] Worker mobile interface
- [ ] Admin panel
- [ ] Consensus & payment engine
- [ ] End-to-end testing

## 🤝 Contributing

This project is developed by [Spatial Collective Ltd](https://github.com/SpatialCollectiveLtd) for the Digital Public Works initiative.

### Development Workflow

1. Create feature branches from `main`
2. Make changes and test locally
3. Submit pull requests for review
4. Deploy through CI/CD pipeline

## 📄 License

This project is proprietary software developed for the Digital Public Works program. All rights reserved.

## 📞 Support

For technical support or questions about the platform:

- **Development Team**: Spatial Collective Ltd
- **Project**: Digital Public Works 2025
- **Repository**: [GitHub](https://github.com/SpatialCollectiveLtd/DPW-MicroTasking-App-2025)

---

**Built with ❤️ for youth empowerment and community development in Kenya**
