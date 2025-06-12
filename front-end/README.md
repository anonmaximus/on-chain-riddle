# Frontend - On-Chain Riddle Web Application

Modern React web application for the On-Chain Riddle platform. Built with Next.js 14, TypeScript, and Web3 integration using Wagmi and ConnectKit.

## 🛠️ Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Wagmi** - React hooks for Ethereum
- **ConnectKit** - Beautiful wallet connection UI
- **HeroUI v2** - Modern React component library
- **Socket.io Client** - Real-time WebSocket communication
- **Tailwind CSS** - Utility-first CSS framework
- **TSyringe** - Dependency injection
- **JWT Decode** - JWT token parsing

## 🏗️ Architecture

### Project Structure

```
├── app/
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx            # Home page
│   └── error.tsx           # Error boundaries
├── components/
│   ├── molecules/          # Reusable UI components
│   │   ├── navbar.tsx
│   │   ├── RiddleDisplay.tsx
│   │   └── ConnectWalletButton.tsx
│   ├── organisms/          # Complex components
│   │   ├── AnswerForm.tsx
│   │   └── StatusNotifications.tsx
│   └── pages/              # Page-level components
│       └── Home.tsx
├── hooks/
│   ├── useRiddle.ts        # Riddle state management
│   ├── useContractWrite.ts # Contract interaction
│   └── useWebSocket.ts     # Real-time updates
├── providers/
│   ├── AuthProvider.tsx    # Authentication context
│   ├── UserProvider.tsx    # User data context
│   └── AppWalletProvider.tsx # Wallet connection
├── services/
│   ├── RiddleService.ts    # API calls
│   ├── AuthService.ts      # Authentication logic
│   └── WebSocketService.ts # Real-time communication
└── api/
    ├── BaseApi.ts          # HTTP client base
    ├── RiddleApi.ts        # Riddle endpoints
    └── AuthApi.ts          # Auth endpoints
```

### Key Features

- 🔗 **Wallet Integration** - Connect with MetaMask, WalletConnect, and other wallets
- 🧩 **Real-Time Riddles** - Live updates when riddles are published or solved
- 📱 **Responsive Design** - Mobile-first responsive UI
- 🔒 **Secure Authentication** - Wallet signature-based login
- 🚀 **Performance** - Optimized with Next.js App Router
- 🎨 **Modern UI** - Clean design with HeroUI components

## 🚀 Setup & Installation

### Prerequisites

- Node.js v18+
- npm or yarn
- Web3 wallet (MetaMask recommended)

### 1. Install Dependencies

```bash
cd front-end
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
NEXT_APP_ENV=development
NEXTJS_PORT=3002

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# Blockchain Configuration
NEXT_PUBLIC_INFURA_API_KEY=your_infura_api_key_here
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address_here
```

**How to get required values:**

- **NEXT_PUBLIC_INFURA_API_KEY**: 
  1. Create account at [Infura.io](https://infura.io)
  2. Create new project
  3. Copy the API key from project settings

- **NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID**:
  1. Create account at [WalletConnect Cloud](https://cloud.walletconnect.com)
  2. Create new project
  3. Copy the Project ID

### 3. Development

```bash
# Start development server
npm run dev

# Application will be available at http://localhost:3002
```

### 4. Build for Production

```bash
# Build optimized production bundle
npm run build

# Start production server
npm run start
```