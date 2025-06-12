# On-Chain Riddle Platform

A decentralized riddle-solving platform built on Ethereum that combines blockchain technology with modern web development practices. Users connect their wallets, solve riddles on-chain, and compete for eternal glory on the blockchain.

## 🏗️ Architecture Overview

This is a **monorepo** containing four main components:

```
├── blockchain/          # Smart contracts (Solidity + Hardhat)
├── back-end/           # API server (Node.js + Express + Prisma)
├── front-end/          # Web application (Next.js 14 + Wagmi + ConnectKit)
├── common/             # Shared resources and types
└── package.json        # Root package manager
```

### Core Architecture: Event Listening + Database Cache

Our architecture follows an **event-driven approach** with database caching for optimal performance:

1. **Smart Contract** emits events on Sepolia testnet
2. **Backend Indexer** listens to blockchain events in real-time
3. **Database** caches all riddle data for fast queries
4. **WebSockets** provide real-time updates to frontend
5. **Frontend** reads from API and displays real-time notifications


## 🛠️ Tech Stack

### Blockchain Layer
- **Solidity** - Smart contract development
- **Hardhat** - Development environment and testing
- **Sepolia Testnet** - Ethereum test network

### Backend Layer
- **Node.js + Express** - API server
- **TypeScript** - Type safety
- **Prisma** - Database ORM and migrations
- **PostgreSQL** - Primary database
- **TSyringe** - Dependency injection
- **Ethers.js** - Blockchain interaction
- **Socket.io** - Real-time WebSocket communication

### Frontend Layer
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Wagmi** - Ethereum React hooks
- **ConnectKit** - Wallet connection UI
- **HeroUI** - Modern UI component library
- **Socket.io Client** - Real-time updates

### Shared Layer
- **TypeScript** - Shared types and resources
- **Class Validator** - Request/response validation
- **Class Transformer** - Data transformation

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ and npm
- **Docker** and Docker Compose
- **Git**

### 1. Clone and Install

```bash
# Clone repository
git clone <repository-url>
cd on-chain-riddle

# Install all dependencies (this will build common, install back-end and front-end)
npm run postinstall
```

### 2. Environment Setup

Copy environment files and configure them:

```bash
# Backend environment
cp back-end/.env.example back-end/.env

# Frontend environment  
cp front-end/.env.example front-end/.env

# Blockchain environment
cp blockchain/.env.example blockchain/.env
```

**Required Environment Variables:**

**Backend (`back-end/.env`):**
- `DATABASE_URL` - PostgreSQL connection string
- `BLOCKCHAIN_RPC_URL` - Infura Sepolia RPC URL
- `CONTRACT_ADDRESS` - Deployed contract address
- `BOT_PRIVATE_KEY` - Private key for bot wallet
- `ACCESS_TOKEN_SECRET` & `REFRESH_TOKEN_SECRET` - JWT secrets

**Frontend (`front-end/.env`):**
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_INFURA_API_KEY` - Infura project API key
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - WalletConnect project ID
- `NEXT_PUBLIC_CONTRACT_ADDRESS` - Deployed contract address

**Blockchain (`blockchain/.env`):**
- `INFURA_API_KEY` - Infura project API key
- `BOT_PRIVATE_KEY` - Private key for contract deployment
- `ETHERSCAN_API_KEY` - Etherscan API key (optional)

### How to get required environment values:

1. Deploy the smart contract on Sepolia testnet using Hardhat. Follow the instructions in the [blockchain README](./blockchain/README.md) to deploy and get the contract address.
2. Create an Infura account to get your API key for Ethereum RPC access.
3. Create a WalletConnect project to get your project ID.
4. Create an Etherscan account for optional contract verification.
5. Create a bot wallet for contract interactions and obtain its private key.


### 3. Database Setup

```bash
# Start PostgreSQL with Docker
cd back-end
docker-compose up -d

# Run database migrations and seeders
npm run migrate:dev
```

### 4. Start Development

```bash
# From root directory - starts both backend and frontend
npm run watch:dev
```

The application will be available at:
- **Frontend**: http://localhost:3002
- **Backend API**: http://localhost:3000/api

## 📚 Project Structure Details

For detailed information about each component:
- [Blockchain README](./blockchain/README.md) - Smart contract development
- [Backend README](./back-end/README.md) - API server setup and architecture  
- [Frontend README](./front-end/README.md) - React application development
- [Common README](./common/README.md) - Shared resources and types

## 🎯 Key Features

- 🔗 **Wallet Integration**: Connect with MetaMask, WalletConnect, and other Web3 wallets
- 🧩 **On-Chain Riddles**: Solve riddles directly on the Ethereum blockchain
- 🚀 **Real-Time Updates**: Live notifications when riddles are published or solved
- 📊 **Statistics**: Track solving history and leaderboards
- 🎨 **Modern UI**: Clean, responsive interface built with HeroUI
- 🔒 **Secure Authentication**: Signature-based wallet authentication
- ⚡ **High Performance**: Database caching with real-time blockchain synchronization
