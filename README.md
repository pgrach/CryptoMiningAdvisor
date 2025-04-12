# MinerVision: Crypto Mining Management Dashboard

A comprehensive full-stack application for monitoring, analyzing, and optimizing cryptocurrency mining operations.

## Technology Stack

### Frontend
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI (based on Radix UI)
- **State Management**: React Query for data fetching and state
- **Routing**: Wouter (lightweight router)

### Backend
- **Server**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js

## Key Features

### Mining Operations Management
- **Worker Monitoring**: Track performance of all mining rigs/machines
- **Hashrate Analytics**: Real-time and historical hashrate monitoring
- **Activity Logging**: Comprehensive logs of all mining operations

### Financial Performance
- **Profitability Tracking**: Monitor income and expenses
- **Financial History**: Historical data visualization of earnings
- **Market Integration**: Real-time cryptocurrency price tracking

### Mining Pool Integration
- **F2Pool Support**: Secure API integration with F2Pool
- **API Token Management**: Secure storage and automated use of API tokens
- **Fallback System**: Simulated data when API access is unavailable

### AI-Powered Insights
- **Mining Advisor**: AI-powered recommendations for optimizing mining operations
- **Performance Analysis**: Intelligent analysis of mining data
- **Strategy Suggestions**: Get recommendations for maximizing profitability

## Application Structure

### Core Pages
- **Dashboard**: Central hub with overview of mining operations
- **Workers**: Detailed management of mining hardware
- **Analytics**: In-depth performance insights and visualization
- **Settings**: Configuration options for the application

### Implementation Details
- The application securely stores F2Pool API tokens
- Makes authenticated API calls with proper headers (`F2P-API-SECRET`)
- Provides access to balance, income, hashrate, and worker status data
- Visualizes performance metrics using recharts

## Getting Started

To set up a new F2Pool connection:
1. Create a mining account with your F2Pool username
2. Add your API token (obtained from F2Pool)
3. The app will automatically use the token for all future API calls

## Project Structure
```
├── client/          # React frontend
├── server/          # Express backend
└── shared/          # Shared code between client and server
```

## Dependencies
All necessary packages are included in package.json, featuring:
- React ecosystem components
- Data visualization libraries
- Form handling with react-hook-form
- OpenAI integration for AI advisor features
