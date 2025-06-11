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
CONTRACT_ADDRESS=0x2E81B40466EA5f60FF6d16EE08bdB1bD406DbA42
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

### Run Tests

```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test test/OnchainRiddle.ts

# Run tests with gas reporting
REPORT_GAS=true npx hardhat test
```

### Local Development

```bash
# Start local Hardhat node
npx hardhat node

# Deploy to local network (in separate terminal)
npx hardhat run scripts/deploy.ts --network localhost
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

# Output example:
# 🚀 Starting OnchainRiddle deployment...
# 🔐 Deploying with account: 0x9a4D7C89D841af709b3e7ec1479cBb275DD5524f
# 💰 Account balance: 0.5 ETH
# 📦 Deploying OnchainRiddle contract...
# ✅ OnchainRiddle deployed to: 0x2E81B40466EA5f60FF6d16EE08bdB1bD406DbA42
# 🤖 Bot address (owner): 0x9a4D7C89D841af709b3e7ec1479cBb275DD5524f
```

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

## 🧪 Testing

### Test Coverage

The test suite covers:

- Contract deployment and initialization
- Riddle setting by bot
- Answer submission by users
- Winner determination
- Access control
- Event emission
- Edge cases and error conditions

### Running Tests

```bash
# Run all tests
npx hardhat test

# Expected output:
# OnchainRiddle
#   Deployment
#     ✓ Should set the right bot
#     ✓ Should start with no active riddle
#   Setting Riddles
#     ✓ Should allow bot to set a riddle
#     ✓ Should not allow non-bot to set a riddle
#     ✓ Should not allow setting new riddle when one is active
#   Submitting Answers
#     ✓ Should accept correct answer and declare winner
#     ✓ Should reject wrong answer
#     ✓ Should not allow submissions when no riddle is active
#   Complete Flow
#     ✓ Should handle multiple riddles correctly
```

### Test Data

Test riddles used in tests:
```javascript
const testRiddle = "What has keys but no locks?";
const correctAnswer = "keyboard";
const wrongAnswer = "piano";
```

## 📊 Contract Interaction

### Reading Contract State

```typescript
// Using ethers.js
const contract = new ethers.Contract(address, abi, provider);

// Get current riddle
const currentRiddle = await contract.riddle();
const isActive = await contract.isActive();
const winner = await contract.winner();
const bot = await contract.bot();
```

### Writing to Contract

```typescript
// Connect with signer (wallet)
const contractWithSigner = contract.connect(signer);

// Submit answer (public function)
const tx = await contractWithSigner.submitAnswer("keyboard");
await tx.wait(); // Wait for confirmation

// Set riddle (bot only)
const answerHash = ethers.keccak256(ethers.toUtf8Bytes("keyboard"));
const tx = await contractWithSigner.setRiddle("What has keys but no locks?", answerHash);
```

### Listening to Events

```typescript
// Listen for all events
contract.on("RiddleSet", (riddle, event) => {
  console.log("New riddle:", riddle);
});

contract.on("Winner", (winner, event) => {
  console.log("Riddle solved by:", winner);
});

contract.on("AnswerAttempt", (user, correct, event) => {
  console.log(`${user} submitted ${correct ? 'correct' : 'wrong'} answer`);
});
```

## 🔍 Contract Security

### Security Features

1. **Access Control**: Only bot can publish riddles
2. **Hash-based Verification**: Answers verified using keccak256
3. **State Validation**: Proper state checks for all functions
4. **Event Logging**: Complete audit trail of all actions

### Security Considerations

- **Private Key Management**: Bot private key must be securely stored
- **Answer Hashing**: Answer hashes prevent front-running attacks
- **Gas Optimization**: Functions optimized for gas efficiency
- **Reentrancy Protection**: No external calls in state-changing functions

### Audit Recommendations

For production deployment:
- Professional smart contract audit
- Formal verification of critical functions
- Multi-signature wallet for bot operations
- Time-locked contract upgrades

## 📋 Available Scripts

### Development Scripts

```bash
# Contract development
npx hardhat compile              # Compile contracts
npx hardhat clean               # Clean artifacts
npx hardhat test                # Run tests
npx hardhat coverage            # Test coverage report

# Deployment
npx hardhat run scripts/deploy.ts --network sepolia    # Deploy to Sepolia
npx hardhat run scripts/verify.ts --network sepolia   # Verify contract

# Local development
npx hardhat node               # Start local node
npx hardhat console --network localhost  # Interactive console
```

### Hardhat Tasks

```bash
# Built-in tasks
npx hardhat accounts           # Show available accounts
npx hardhat balance            # Check account balance
npx hardhat compile           # Compile contracts
npx hardhat help              # Show available tasks
```

## 🌐 Network Configuration

### Supported Networks

**Sepolia Testnet** (recommended for testing):
```javascript
sepolia: {
  url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
  accounts: [BOT_PRIVATE_KEY],
  chainId: 11155111
}
```

**Localhost** (for development):
```javascript
localhost: {
  url: "http://127.0.0.1:8545",
  chainId: 31337
}
```

### Adding New Networks

To add mainnet or other networks, update `hardhat.config.ts`:

```javascript
mainnet: {
  url: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
  accounts: [BOT_PRIVATE_KEY],
  chainId: 1,
  gasPrice: "auto"
}
```

## 🔧 Troubleshooting

### Common Issues

1. **Compilation Errors**
   - Ensure Solidity version matches pragma
   - Check for syntax errors in contracts

2. **Deployment Failures**
   - Verify sufficient ETH balance in deployer account
   - Check network configuration and RPC endpoints
   - Ensure private key has correct format (0x prefix)

3. **Test Failures**
   - Restart Hardhat node between test runs
   - Check for proper async/await usage
   - Verify test data matches contract expectations

4. **Gas Estimation Issues**
   - Use explicit gas limits for complex transactions
   - Monitor gas prices on target network

### Debug Commands

```bash
# Verbose logging
npx hardhat test --verbose

# Gas reporting
REPORT_GAS=true npx hardhat test

# Network info
npx hardhat run scripts/network-info.ts --network sepolia
```

## 📚 Additional Resources

### Hardhat Documentation
- [Hardhat Official Docs](https://hardhat.org/docs)
- [Hardhat Tutorial](https://hardhat.org/tutorial)

### Solidity Resources
- [Solidity Documentation](https://docs.soliditylang.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

### Testing Resources
- [Waffle Testing](https://ethereum-waffle.readthedocs.io/)
- [Chai Assertion Library](https://www.chaijs.com/)

### Network Resources
- [Sepolia Testnet Info](https://sepolia.dev/)
- [Ethereum Gas Tracker](https://etherscan.io/gastracker)