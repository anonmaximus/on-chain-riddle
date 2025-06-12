# Backend - On-Chain Riddle API

RESTful API server with real-time capabilities for the On-Chain Riddle platform. Built with Node.js, Express, TypeScript, and Prisma ORM.

## 🛠️ Tech Stack

- **Node.js + Express** - Web server framework
- **TypeScript** - Type-safe JavaScript
- **Prisma** - Database ORM and migrations
- **PostgreSQL** - Primary database
- **TSyringe** - Dependency injection container
- **Ethers.js** - Ethereum blockchain interaction
- **Socket.io** - Real-time WebSocket communication
- **JWT** - Authentication tokens
- **Docker Compose** - Local PostgreSQL setup

## 🏗️ Architecture

### Core Services

```
src/
├── app/
│   ├── http/
│   │   ├── api/v1/          # REST API endpoints
│   │   └── middlewares/     # Express middlewares
│   └── crons/               # Background jobs
├── services/
│   ├── RiddleIndexerService.ts    # Blockchain event listener
│   ├── RiddleService.ts           # Business logic
│   ├── ContractService.ts         # Smart contract interactions
│   ├── WebSocketService.ts        # Real-time notifications
│   ├── AuthService.ts             # JWT authentication
│   └── UserService.ts             # User management
├── databases/
│   ├── DbClient.ts          # Prisma client
│   └── seeders/             # Database seeding
└── entries/
    ├── App.ts               # Main application
    ├── Cron.ts              # Background services
    └── Seed.ts              # Database seeding
```

### Key Components

1. **RiddleIndexerService** - Listens to blockchain events and syncs with database
2. **WebSocketService** - Manages real-time notifications to connected clients
3. **ContractService** - Handles smart contract interactions (read/write)
4. **AuthService** - Manages wallet authentication and JWT tokens

## 🚀 Setup & Installation

### Prerequisites

- Node.js v18+
- Docker & Docker Compose
- PostgreSQL (via Docker)

### 1. Install Dependencies

```bash
cd back-end
npm install
```

### 2. Environment Configuration

Copy and configure the environment file:

```bash
cp .env.example .env
```

**How to get required values:**

- **BLOCKCHAIN_RPC_URL**: Create an Infura account and get a Sepolia endpoint
- **BOT_PRIVATE_KEY**: Generate a new wallet private key or export from MetaMask
- **JWT Secrets**: Generate secure random strings (64+ characters recommended)

### 3. Database Setup

Start PostgreSQL using Docker Compose:

```bash
# Start PostgreSQL container
docker-compose up -d

# Check container is running
docker-compose ps
```

Run database migrations and seeders:

```bash
# Generate Prisma client
npm run migrate:generate

# Run migrations
npm run migrate:dev

# Seed initial data (roles, rules)
npm run db:seed
```

### 4. Development

```bash
# Start development server with auto-reload
npm run watch

# Or build and start manually
npm run build
npm run start:dev
```


### Database Commands

```bash
# Database management
npm run migrate:dev          # Run migrations in development
npm run migrate:deploy       # Deploy migrations to production
npm run migrate:status       # Check migration status
npm run db:client            # Open Prisma Studio
npm run db:seed             # Seed database with initial data

# Reset database
npm run migrate:reset        # Reset database (development only)
```

## 🔌 API Endpoints

### Authentication

```
POST /api/v1/auth/pre-sign    # Get challenge for wallet
POST /api/v1/auth/sign-in     # Authenticate with signature
POST /api/v1/auth/logout      # Logout user
```

### Riddles

```
GET  /api/v1/riddles/current        # Get active riddle
GET  /api/v1/riddles                # Get all riddles (paginated)
POST /api/v1/riddles/submit-answer  # Submit answer transaction hash
GET  /api/v1/riddles/my-solved      # Get user's solved riddles
GET  /api/v1/riddles/stats          # Get platform statistics
GET  /api/v1/riddles/can-submit     # Check if user can submit
```

### Users

```
GET /api/v1/users/:id         # Get user by ID (authenticated)
```
