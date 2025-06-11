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
NEXT_PUBLIC_CONTRACT_ADDRESS=0x2E81B40466EA5f60FF6d16EE08bdB1bD406DbA42
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

- **NEXT_PUBLIC_CONTRACT_ADDRESS**: Use the deployed contract address (already provided)

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

## 🔌 Web3 Integration

### Wallet Connection

The app uses ConnectKit for a seamless wallet connection experience:

```typescript
// Supported wallets
- MetaMask
- WalletConnect
- Coinbase Wallet
- Injected wallets
```

### Smart Contract Interaction

Using Wagmi hooks for type-safe contract interaction:

```typescript
// Submit answer to riddle
const { writeContract } = useWriteContract();

await writeContract({
  address: CONTRACT_ADDRESS,
  abi: ONCHAIN_RIDDLE_ABI,
  functionName: 'submitAnswer',
  args: [answer]
});
```

### Network Configuration

Configured for Sepolia testnet:

```typescript
export const wagmiConfig = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(`https://sepolia.infura.io/v3/${INFURA_API_KEY}`)
  }
});
```

## 🔐 Authentication Flow

### Wallet-Based Authentication

1. **Connect Wallet**: User connects Web3 wallet
2. **Request Challenge**: Frontend requests nonce from backend
3. **Sign Message**: User signs authentication message
4. **Verify & Login**: Backend verifies signature and issues JWT
5. **Session Management**: Frontend manages JWT tokens

### Authentication Implementation

```typescript
// Authentication context
const { address, isConnected } = useAccount();
const { signMessageAsync } = useSignMessage();

// Automatic authentication when wallet connects
useEffect(() => {
  if (address && isConnected) {
    authenticateWallet(address);
  }
}, [address, isConnected]);
```

## 🎨 UI Components

### Design System

Built with HeroUI for consistent, modern design:

- **Cards** - Content containers
- **Buttons** - Primary and secondary actions
- **Inputs** - Form fields with validation
- **Alerts** - Status messages and notifications
- **Tabs** - Navigation between content sections
- **Chips** - Status indicators

### Responsive Design

Mobile-first approach with Tailwind CSS:

```css
/* Example responsive classes */
.container {
  @apply max-w-4xl mx-auto px-4 py-8;
}

.riddle-card {
  @apply w-full max-w-2xl mx-auto;
}
```

### Theme Support

Light and dark theme switching:

```typescript
import { useTheme } from 'next-themes';

const { theme, setTheme } = useTheme();
const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
```

## 🔄 Real-Time Features

### WebSocket Integration

Real-time updates for enhanced user experience:

```typescript
// WebSocket event types
enum EWebsocketMessageType {
  RIDDLE_PUBLISHED = "RIDDLE_PUBLISHED",
  RIDDLE_SOLVED = "RIDDLE_SOLVED", 
  RIDDLE_PUBLISHING = "RIDDLE_PUBLISHING",
  USER_SUBMISSION_UPDATE = "USER_SUBMISSION_UPDATE"
}
```

### Status Notifications

Live notification system with auto-dismiss:

```typescript
// Notification examples
- 🎯 "New Riddle Published!"
- 🎉 "Riddle Solved by 0x1234...5678"
- ⏳ "Your answer is being processed..."
- ✅ "Congratulations! You solved the riddle!"
```

### Real-Time Hooks

Custom hooks for managing real-time state:

```typescript
// useRiddle hook
const { currentRiddle, isLoading, canSubmit } = useRiddle();

// useWebSocket hook
const { isConnected, lastMessage } = useWebSocket();
```

## 📱 User Interface

### Main Pages

1. **Home Page** (`/`)
   - Current riddle display
   - Answer submission form
   - Riddle history
   - Platform statistics

### Key Components

**RiddleDisplay**: Shows current riddle with status
```typescript
<RiddleDisplay 
  riddle={currentRiddle}
  isLoading={isLoading}
  error={error}
/>
```

**AnswerForm**: Handles answer submission
```typescript
<AnswerForm 
  canSubmit={canSubmit}
  onSubmit={handleSubmitAnswer}
/>
```

**StatusNotifications**: Real-time notifications
```typescript
<StatusNotifications />
```

### Navigation

**Tabs System**:
- **Current Riddle** - Active riddle and submission
- **All Riddles** - Historical riddles with solutions
- **Statistics** - Platform stats and leaderboards

## 🎯 State Management

### Context Providers

**AuthProvider**: Manages authentication state
```typescript
const { jwtContent, jwtPair, isLoading } = useContext(AuthContext);
```

**UserProvider**: Manages user data
```typescript
const { user, isLoading } = useContext(UserContext);
```

### Custom Hooks

**useRiddle**: Riddle state and operations
```typescript
const {
  currentRiddle,
  isLoading,
  error,
  canSubmit,
  refetch
} = useRiddle();
```

**useContractWrite**: Contract interaction
```typescript
const {
  submitAnswer,
  isSubmitting,
  isConfirming,
  isSuccess,
  error,
  transactionHash
} = useContractWrite();
```

## 🔧 Development

### Development Server

```bash
# Start with hot reload
npm run dev

# Runs on http://localhost:3002
```

### Code Quality

```bash
# Lint code
npm run lint

# Type checking (automatic with TypeScript)
```

### Project Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint checking
```

## 🧪 Testing

### Testing Strategy

- **Component Testing**: React Testing Library
- **Integration Testing**: API integration tests
- **E2E Testing**: Wallet connection flows

```bash
# Run tests (when implemented)
npm test
```

### Manual Testing

1. **Wallet Connection**: Test with different wallet providers
2. **Riddle Interaction**: Submit answers and verify blockchain transactions
3. **Real-Time Updates**: Test WebSocket notifications
4. **Responsive Design**: Test on different screen sizes

## 🚀 Deployment

### Environment Setup

**Production Environment Variables:**

```env
NEXT_APP_ENV=production
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_INFURA_API_KEY=your_production_infura_key
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_CONTRACT_ADDRESS=0x2E81B40466EA5f60FF6d16EE08bdB1bD406DbA42
```

### Build & Deploy

```bash
# Build for production
npm run build

# The .next folder contains the built application
# Deploy to Vercel, Netlify, or your hosting provider
```

### Deployment Platforms

**Recommended platforms:**
- **Vercel** - Optimal for Next.js applications
- **Netlify** - Easy static deployment
- **AWS Amplify** - Full-stack deployment
- **DigitalOcean App Platform** - Simple container deployment

## 🔍 Debugging

### Development Tools

**Browser DevTools:**
- React DevTools extension
- Redux DevTools (if using Redux)
- Network tab for API calls
- WebSocket frames for real-time events

**Console Logging:**
```typescript
import logger from '@/utils/logger';

logger.info('Component mounted');
logger.error('API call failed', error);
logger.debug('State updated', newState);
```

### Common Issues

1. **Wallet Connection**: Ensure MetaMask is installed and connected to Sepolia
2. **API Calls**: Check CORS settings and API URL configuration
3. **WebSocket**: Verify JWT token is valid and WebSocket service is running
4. **Contract Interaction**: Confirm contract address and network match

### Performance Monitoring

- Next.js built-in analytics
- Core Web Vitals monitoring
- Real-time performance metrics

## 📋 Best Practices

### Code Organization

- Use TypeScript for type safety
- Implement proper error boundaries
- Follow React hooks best practices
- Use proper state management patterns

### Performance

- Optimize images with Next.js Image component
- Implement proper loading states
- Use React.memo for expensive components
- Minimize bundle size with tree shaking

### Security

- Never expose private keys in frontend code
- Validate all user inputs
- Use HTTPS in production
- Implement proper error handling

### User Experience

- Provide clear loading states
- Show transaction status updates
- Handle wallet connection errors gracefully
- Implement responsive design for all devices