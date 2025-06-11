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
- **Winston** - Structured logging
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

**Required Environment Variables:**

```env
# Application
NODE_ENV=development
APP_ENV=development
APP_PORT=3000
NEXTJS_HOST=localhost
NEXTJS_PORT=3002

# Database
DATABASE_URL=postgresql://admin:hsha19jkIh73hsk@localhost:5177/on-chain-riddle-db

# JWT Secrets (generate secure random strings)
ACCESS_TOKEN_SECRET=your_access_token_secret_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
PSWD_SALT=your_password_salt_here

# Blockchain Configuration
BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY
CONTRACT_ADDRESS=0x2E81B40466EA5f60FF6d16EE08bdB1bD406DbA42
BOT_PRIVATE_KEY=0xYOUR_BOT_PRIVATE_KEY

# WebSocket
WEBSOCKET_PORT=3003
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

## 📊 Database Schema

### Core Models

```prisma
model User {
  id          String    @id @unique @default(uuid())
  address     String    @unique
  role        Role      @relation(fields: [roleId], references: [id])
  challenge   Challenge?
  loginAt     DateTime?
  createdAt   DateTime? @default(now())
  updatedAt   DateTime? @updatedAt
}

model Riddle {
  id          String    @id @unique @default(uuid())
  index       Int       @default(autoincrement())
  question    String
  answer      String?
  isActive    Boolean   @default(true)
  solvedBy    String?
  solvedAt    DateTime?
  blockNumber Int
  txHash      String
  createdAt   DateTime? @default(now())
  updatedAt   DateTime? @updatedAt
}

model Role {
  id    String    @id @unique @default(uuid())
  name  ERoleName @unique
  rules Rule[]
  users User[]
}
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

## 🔄 Real-Time Features

### WebSocket Events

The WebSocket service broadcasts these event types:

```typescript
enum EWebsocketMessageType {
  RIDDLE_PUBLISHED = "RIDDLE_PUBLISHED",        # New riddle published
  RIDDLE_SOLVED = "RIDDLE_SOLVED",              # Riddle solved by user
  RIDDLE_PUBLISHING = "RIDDLE_PUBLISHING",      # Riddle being published
  USER_SUBMISSION_UPDATE = "USER_SUBMISSION_UPDATE" # Answer submission status
}
```

### WebSocket Connection

Frontend connects with JWT authentication:

```javascript
// Connect to WebSocket
const socket = io(API_URL, {
  path: '/ws',
  auth: { token: jwtToken }
});

// Listen for updates
socket.on('update', (message) => {
  console.log('Real-time update:', message);
});
```

## 🤖 Blockchain Integration

### Event Listening

The `RiddleIndexerService` continuously monitors these smart contract events:

- **RiddleSet**: New riddle published
- **Winner**: Riddle solved by user
- **AnswerAttempt**: User submitted an answer

### Auto-Publishing

When a riddle is solved, the bot automatically publishes the next riddle from a predefined list. This ensures continuous gameplay.

### Contract Interaction

```typescript
// Read from contract
const currentRiddle = await contractService.getCurrentRiddle();

// Write to contract (bot only)
await contractService.setRiddle(question, answerHash);
```

## 🔐 Authentication System

### Wallet-Based Authentication Flow

1. **Pre-Sign**: Client requests challenge with wallet address
2. **Challenge**: Server generates time-limited nonce (5 minutes)
3. **Sign**: Client signs message with wallet
4. **Verify**: Server verifies signature and wallet ownership
5. **Token**: Server issues JWT access and refresh tokens

### Security Features

- **Dynamic Nonces**: Prevents replay attacks
- **Time Expiration**: Nonces expire after 5 minutes
- **Role-Based Access**: Different permissions for different actions
- **JWT Rotation**: Automatic refresh token rotation

## 🏃‍♂️ Running Services

### Development Mode

```bash
# Start all services
npm run watch

# Start individual services
npm run start:dev    # API server only
npm run cron:dev     # Background jobs only
```

### Production Mode

```bash
# Build application
npm run build

# Start production server
npm run start:prod   # Includes migrations and seeding
```

### Background Services

```bash
# Start cron jobs
npm run cron:prod    # Production
npm run cron:dev     # Development
```

## 🧪 Testing

```bash
# Run tests
npm test

# Database testing
npm run migrate:dev  # Test migrations
npm run db:seed     # Test seeding
```

## 📝 Logging

The application uses Winston for structured logging:

```typescript
import logger from '#Services/Logger';

logger.info('Application started');
logger.error('Database connection failed', error);
logger.debug('Processing blockchain event', { eventData });
```

Logs are formatted with timestamps and log levels for easy debugging.

## 🔧 Development Tips

### Hot Reload

The `npm run watch` command uses nodemon to automatically restart the server when files change.

### Database Changes

1. Modify `prisma/schema.prisma`
2. Run `npm run migrate:dev`
3. Update TypeScript types automatically

### Adding New Endpoints

1. Create controller in `src/app/http/api/v1/`
2. Add route to `src/app/http/api/v1/index.ts`
3. Add middleware for authentication/validation

### Debugging

- Use `console.log` or `logger.debug()` for debugging
- Prisma Studio: `npm run db:client` for database inspection
- WebSocket testing: Use browser dev tools Network tab

## 🚀 Deployment

### Environment Setup

```bash
# Production environment variables
NODE_ENV=production
APP_ENV=production
DATABASE_URL=your_production_database_url
```

### Build & Deploy

```bash
# Build application
npm run build

# Deploy migrations
npm run migrate:deploy

# Start production server
npm run start:prod
```

### Health Checks

The server exposes health check endpoints:
- `GET /` - Basic health check
- Database connectivity verified on startup