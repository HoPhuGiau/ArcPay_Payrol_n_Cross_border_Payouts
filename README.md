# ArcPay - Payroll & Cross-border Payouts on Arc

ArcPay is a decentralized application (dApp) for managing global payroll and cross-border payouts using USDC and EURC stablecoins on the Arc blockchain. Built to leverage Arc's sub-second finality, predictable USD-based fees, and stablecoin-native infrastructure.

## 🎯 Overview

ArcPay enables companies to:
- Register and manage company profiles onchain
- Add employees and freelancers with configurable payment schedules
- Create and execute payroll batches using USDC or EURC
- Track payment history and generate reports

Employees can:
- View their payment history onchain
- Track salary payments in real-time
- Access transparent, immutable payment records

## 🏗️ Architecture

### Smart Contracts

1. **CompanyRegistry.sol** - Manages company registration and ownership
   - Register new companies
   - Update company metadata
   - Transfer company ownership
   - Query companies by owner

2. **PayrollManager.sol** - Handles employee management and payroll execution
   - Add/update/deactivate employees
   - Create payroll batches
   - Execute onchain payments using USDC/EURC
   - Track payment history

### Frontend

- **Next.js 14** with TypeScript
- **Wagmi** + **Viem** for blockchain interactions
- **RainbowKit** for wallet connection
- **Tailwind CSS** for styling

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Foundry (for smart contract development)
- A wallet with Arc Testnet USDC (get from [faucet.circle.com](https://faucet.circle.com))
- Arc Testnet added to your wallet (Chain ID: 5042002)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd arc

# Install Foundry (if not already installed)
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### 2. Deploy Smart Contracts

```bash
cd contracts

# Create .env file
cp .env.example .env
# Edit .env and add your PRIVATE_KEY and ARC_TESTNET_RPC_URL

# Install dependencies (if using Foundry)
forge install

# Compile contracts
forge build

# Run tests
forge test

# Deploy to Arc Testnet
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $ARC_TESTNET_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast
```

After deployment, note the contract addresses and update your frontend `.env.local` file.

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.local.example .env.local
# Edit .env.local and add:
# - NEXT_PUBLIC_COMPANY_REGISTRY_ADDRESS=<deployed-address>
# - NEXT_PUBLIC_PAYROLL_MANAGER_ADDRESS=<deployed-address>
# - NEXT_PUBLIC_ARC_RPC_URL=https://rpc.testnet.arc.network

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage Guide

### For Company Admins

1. **Connect Wallet**
   - Click "Connect Wallet" and select your wallet
   - Ensure you're connected to Arc Testnet (Chain ID: 5042002)

2. **Register Company**
   - Go to `/company`
   - Enter company name and optional metadata
   - Click "Register Company"
   - Confirm transaction in your wallet

3. **Add Employees**
   - Click on your company from the list
   - Fill in employee details:
     - Wallet address
     - Base pay amount
     - Payment token (USDC or EURC)
     - Pay cycle (Monthly, Weekly, Bi-Weekly, Quarterly)
   - Click "Add Employee"

4. **Execute Payroll**
   - Select payment period (YYYY-MM format)
   - Choose payment token (USDC or EURC)
   - Click "Create Batch" to create payroll batch
   - Click "Approve Token" to approve contract spending
   - Click "Execute Payroll" to send payments to all active employees

### For Employees

1. **Connect Wallet**
   - Use the wallet address that your company added

2. **View Payments**
   - Go to `/me`
   - View all payment history
   - See payment status (Paid/Pending)
   - Check transaction details on ArcScan

## 🔧 Configuration

### Arc Testnet Details

- **RPC URL**: `https://rpc.testnet.arc.network`
- **Chain ID**: `5042002`
- **Currency**: USDC (18 decimals for native, 6 decimals for ERC-20)
- **Explorer**: [testnet.arcscan.app](https://testnet.arcscan.app)
- **Faucet**: [faucet.circle.com](https://faucet.circle.com)

### Token Addresses

- **USDC**: `0x3600000000000000000000000000000000000000`
- **EURC**: `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a`

## 🧪 Testing

```bash
cd contracts

# Run all tests
forge test

# Run with verbose output
forge test -vvv

# Run specific test file
forge test --match-path test/CompanyRegistry.t.sol
```

## 📁 Project Structure

```
arc/
├── contracts/              # Smart contracts
│   ├── src/
│   │   ├── CompanyRegistry.sol
│   │   └── PayrollManager.sol
│   ├── test/              # Foundry tests
│   ├── script/            # Deployment scripts
│   └── foundry.toml       # Foundry configuration
│
├── frontend/              # Next.js application
│   ├── app/               # Next.js app directory
│   │   ├── company/       # Company management pages
│   │   ├── me/            # Employee dashboard
│   │   └── page.tsx       # Home page
│   ├── components/        # React components
│   ├── lib/               # Utilities and configs
│   │   ├── wagmi.ts       # Wagmi configuration
│   │   └── contracts.ts   # Contract ABIs and addresses
│   └── package.json
│
├── arc.txt                # Arc documentation
├── arcusdc.txt            # Token addresses
└── README.md              # This file
```

## 🔐 Security Considerations

- **Private Keys**: Never commit private keys or `.env` files to version control
- **Contract Verification**: Verify contracts on ArcScan after deployment
- **Access Control**: Only company owners can manage employees and execute payroll
- **Token Approvals**: Always review token approval amounts before approving

## 🌟 Key Features

### Arc-Specific Benefits

- **Sub-second Finality**: Payments finalize in less than 1 second
- **Predictable Fees**: Fees are in USD (USDC), not volatile tokens
- **Stablecoin Native**: Built-in support for USDC and EURC
- **EVM Compatible**: Use familiar Ethereum tooling and patterns

### Use Cases

- **Global Payroll**: Pay remote teams worldwide in stablecoins
- **Freelancer Payouts**: Mass payouts to contractors and freelancers
- **Cross-border Payments**: Send payments across borders instantly
- **Multi-currency Support**: Pay in USDC or EURC based on employee preference

## 📝 Development Roadmap

- [ ] Batch payment optimization (gas-efficient multi-transfer)
- [ ] Payment scheduling (automated recurring payroll)
- [ ] Multi-signature support for large payments
- [ ] Integration with Circle CCTP for cross-chain payments
- [ ] CSV export for accounting integration
- [ ] Employee self-service portal enhancements
- [ ] Mobile-responsive design improvements

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Resources

- [Arc Network Documentation](https://docs.arc.network)
- [Circle Developer Portal](https://developers.circle.com)
- [Arc Testnet Explorer](https://testnet.arcscan.app)
- [Arc Testnet Faucet](https://faucet.circle.com)
- [Circle Developer Grants](https://www.circle.com/grant)

## 💡 Why ArcPay?

ArcPay is designed specifically for Arc's "Economic OS for the internet" vision:

1. **Real-world Use Case**: Solves actual business problems (payroll, cross-border payments)
2. **Arc-Optimized**: Leverages Arc's sub-second finality and stable fees
3. **Enterprise Ready**: Multi-tenant architecture suitable for real companies
4. **Developer Friendly**: Clean codebase, comprehensive documentation, easy to extend

Perfect for applying to Circle Developer Grants and showcasing Arc's capabilities for financial applications.

## 📧 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Built with ❤️ for the Arc ecosystem**

