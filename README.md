# Black Square

Minimalist, suprematism-inspired Web3 dApp featuring NFT staking, wallet management, and Malevich-inspired artwork. Built with modern Web3 stack: React, Vite, TypeScript, wagmi, RainbowKit, and Solidity smart contracts.

## Features

- 🎨 **NFT Minting**: One-per-address Black Square NFT minting on Sepolia testnet
- 💎 **NFT Staking**: Stake your Black Square NFT to earn Malevich Collection rewards (Red Square, White on White, Black Circle, Suprematist Composition)
- 💰 **Wallet Integration**: Full wallet connection via RainbowKit with balance display and transaction sending
- 🎯 **Time-based Rewards**: Earn NFT rewards based on staking duration (1 day, 2 days, 3 days, 4 days)
- 📱 **Responsive Design**: Fully responsive mobile-first design
- 🔒 **Security**: Smart contracts audited with ReentrancyGuard and access controls

## Tech Stack

- **Frontend:** React 19, Vite, TypeScript, TailwindCSS, wagmi + viem, RainbowKit, Framer Motion
- **Contracts:** Solidity 0.8.24, Hardhat, OpenZeppelin ERC-721, IPFS (Pinata) for metadata

## Project Structure

```
/frontend   → Vite React app (wallet dashboard, mint flow)
/contracts  → Hardhat project (BlackSquareNFT ERC-721 + tests + deploy script)
/backend    → Minimal Fastify API (health + telemetry echo)
```

## Prerequisites

- Node.js ≥ 20 (recommended) and npm ≥ 10
- WalletConnect project ID (free at https://cloud.walletconnect.com)
- RPC endpoints + funded wallet for Sepolia/Base Sepolia

## Environment Variables

| Location    | Variable                             | Description                                      |
| ----------- | ------------------------------------ | ------------------------------------------------ |
| `frontend`  | `VITE_WALLETCONNECT_PROJECT_ID`      | WalletConnect (RainbowKit) project id            |
|             | `VITE_BLACK_SQUARE_CONTRACT_ADDRESS` | Deployed `BlackSquareNFT` address                |
|             | `VITE_NFT_STAKING_ADDRESS`           | Deployed `NFTStaking` contract address           |
|             | `VITE_MALEVICH_COLLECTION_ADDRESS`   | Deployed `MalevichCollectionNFT` address         |
| `contracts` | `SEPOLIA_RPC_URL`                    | Provider endpoint for Sepolia deployments        |
|             | `PRIVATE_KEY`                        | Deployer private key (0x-prefixed)               |
|             | `ETHERSCAN_API_KEY`                   | (Optional) for contract verification             |

**Create `.env` file in `frontend/` directory:**
```bash
cd frontend
cp .env.example .env
# Then edit .env with your actual values
```

## Contracts Workflow

```bash
cd contracts
npm install
cp .env.example .env       # update with RPC URLs + key
npm run compile
npm test

# Deploy to Sepolia
npm run deploy:sepolia
```

After deployment, note the contract address and feed it into `frontend/.env`.

## Frontend Workflow

```bash
cd frontend
npm install
cp .env.example .env            # set WalletConnect + contract address
npm run dev                     # local dev server
npm run build && npm run preview
```

### Pages

- **Dashboard (`/`)**: Landing page with project overview
- **Wallet (`/wallet`)**: Wallet connection, balance display, transaction sending, testnet faucet
- **NFT (`/nft`)**: NFT minting, staking interface, reward claiming, staking statistics
- **About Me (`/about`)**: Portfolio information and skills

### UI/UX

- Full black canvas with white/red accents, Inter font, geometric panels
- Suprematist design inspired by Kazimir Malevich
- Fully responsive mobile-first design
- Smooth animations with Framer Motion

## Testing

- **Contracts:** `npm test` inside `/contracts` runs the Hardhat test suite (mint success, double-mint guard, multi-wallet coverage).
- **Frontend:** `npm run build` ensures TypeScript + Vite compilation succeeds. Add your preferred unit/E2E tooling as the app grows.
- **Backend:** `npm run build` validates TypeScript output; add integration tests if the API gains more responsibilities.

## Smart Contracts

- **BlackSquareNFT**: ERC-721 NFT contract, one mint per address
- **MalevichCollectionNFT**: ERC-721 reward NFT contract with 4 artwork types
- **NFTStaking**: Staking contract with time-based reward distribution

All contracts are deployed on Sepolia testnet and use IPFS (Pinata) for metadata storage.

## License

MIT

## Author

Daniil Patlakh - [GitHub](https://github.com/patlakh-dev) | [LinkedIn](https://www.linkedin.com/in/daniil-patlakh-baaa8190)

