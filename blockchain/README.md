# Blockchain - Smart Contracts

Solidity smart contracts for the On-Chain Riddle platform. Built with Hardhat for development, testing, and deployment on Ethereum Sepolia testnet.

## 🛠️ Tech Stack

- **Solidity** - Smart contract programming language
- **Hardhat** - Ethereum development environment
- **TypeScript** - Type-safe development
- **Ethers.js** - Ethereum library for contract interaction
- **Chai** - Testing framework
- **Sepolia Testnet** - Ethereum test network

## 🏗️ Architecture

### Project Structure

```
├── contracts/
│   └── OnchainRiddle.sol    # Main riddle contract
├── scripts/
│   ├── deploy.ts            # Deployment script
│   └── verify.ts            # Contract verification
├── test/
│   └── OnchainRiddle.ts     # Contract tests
├── deployments/
│   └── sepolia.json         # Deployment information
├── abi/
│   └── OnchainRiddle.json   # Contract ABI
└── hardhat.config.ts        # Hardhat configuration
```

### Smart Contract Overview

**OnchainRiddle.sol** is the core contract that manages:
- Riddle publication by bot
- Answer submission by users
- Winner determination and events
- Access control and security

## 📜 Smart Contract Details

### Contract Functions

**Bot Functions (onlyBot modifier):**
```solidity
function setRiddle(string memory _riddle, bytes32 _answerHash) external onlyBot
```
- Publishes a new riddle with hashed answer
- Only callable by the bot address
- Resets winner and activates riddle

**Public Functions:**
```solidity
function submitAnswer(string memory _answer) external
```
- Allows users to submit answers
- Compares hash of answer with stored hash
- Emits events for attempts and winners

**View Functions:**
```solidity
function riddle() external view returns (string memory)
function isActive() external view returns (bool)
function winner() external view returns (address)
function bot() external view returns (address)
```

### Events

```solidity
event RiddleSet(string riddle);                          # New riddle published
event AnswerAttempt(address indexed user, bool correct); # Answer submission
event Winner(address indexed user);                      # Correct answer found
```

### Security Features

- **Access Control**: Only bot can publish riddles
- **Hash Verification**: Answers are verified using keccak256 hashing
- **State Management**: Proper riddle lifecycle management
- **Event Logging**: Comprehensive event emission for tracking

## 🚀 Setup & Installation

### Prerequisites

- Node.js v18+
- npm or yarn
- Git

### 1. Install Dependencies

```bash
cd blockchain
npm install
```

### 2. Environment Configuration

Copy and configure the environment file:

```bash
cp .env.example .env
```

**Required Environment Variables:**

```env
# Infura API Key (create account at infura.io)
INFURA_API_KEY=your_infura_api_key_here

# Bot Private Key (wallet that will deploy and manage contract)
BOT_PRIVATE_KEY=0xYOUR_BOT_PRIVATE_KEY_HERE

# Etherscan API Key (optional, for contract verification)
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Contract Address (filled after deployment)
CONTRACT_ADDRESS=your_deployed_contract_address_here
```

**How to get required values:**

- **INFURA_API_KEY**: 
  1. Create account at [Infura.io](https://infura.io)
  2. Create new project
  3. Select Ethereum network
  4. Copy API key from project dashboard

- **BOT_PRIVATE_KEY**: 
  1. Generate new wallet private key, or
  2. Export from MetaMask: Account Details → Export Private Key
  3. **Security**: Never share or commit private keys

- **ETHERSCAN_API_KEY**: 
  1. Create account at [Etherscan.io](https://etherscan.io)
  2. Go to API Keys section
  3. Create new API key

## 🔧 Development

### Compile Contracts

```bash
# Compile smart contracts
npx hardhat compile

# Clean and recompile
npx hardhat clean
npx hardhat compile
```

## 🚀 Deployment

### Current Deployment

A contract is already deployed on Sepolia testnet:
- **Contract Address**: `0x2E81B40466EA5f60FF6d16EE08bdB1bD406DbA42`
- **Bot Address**: `0x9a4D7C89D841af709b3e7ec1479cBb275DD5524f`
- **Network**: Sepolia Testnet
- **Explorer**: [View on Etherscan](https://sepolia.etherscan.io/address/0x2E81B40466EA5f60FF6d16EE08bdB1bD406DbA42)

### Deploy New Contract

If you need to deploy your own contract:

#### 1. Get Sepolia ETH

Get test ETH from Sepolia faucets:
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [Infura Sepolia Faucet](https://www.infura.io/faucet)

#### 2. Deploy Contract

```bash
# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.ts --network sepolia


#### 3. Verify Contract (Optional)

```bash
# Verify contract on Etherscan
npx hardhat run scripts/verify.ts --network sepolia

# Or manually verify
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

#### 4. Update Environment

After deployment, update your environment files:

```bash
# Update blockchain/.env
CONTRACT_ADDRESS=0xYOUR_NEW_CONTRACT_ADDRESS

# Update back-end/.env
CONTRACT_ADDRESS=0xYOUR_NEW_CONTRACT_ADDRESS

# Update front-end/.env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_NEW_CONTRACT_ADDRESS
```