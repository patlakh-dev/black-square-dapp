// Popular ERC-20 tokens on Sepolia testnet
export interface PopularToken {
  symbol: string;
  address: `0x${string}`;
  chainId: number; // 11155111 = Sepolia
}

export const popularTokens: PopularToken[] = [
  // Sepolia (11155111)
  {
    symbol: 'USDC',
    address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Sepolia USDC
    chainId: 11155111,
  },
  {
    symbol: 'USDT',
    address: '0xaA8E23Fb1079EA71e0a56A48a2F5E773C2e3C8C7', // Sepolia USDT
    chainId: 11155111,
  },
  {
    symbol: 'DAI',
    address: '0x3e622317f8F93EFB8b981f8B8b5C44Df8F2b0971', // Sepolia DAI
    chainId: 11155111,
  },
  {
    symbol: 'WETH',
    address: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14', // Sepolia WETH
    chainId: 11155111,
  },
  {
    symbol: 'LINK',
    address: '0x779877A7B0D9E8603169DdbD7836e478b4624789', // Sepolia LINK
    chainId: 11155111,
  },
  {
    symbol: 'WBTC',
    address: '0x29f2D40B0605204364af54EC677bD022dA425d03', // Sepolia WBTC
    chainId: 11155111,
  },
  {
    symbol: 'UNI',
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // Sepolia UNI
    chainId: 11155111,
  },
  {
    symbol: 'AAVE',
    address: '0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a', // Sepolia AAVE
    chainId: 11155111,
  },
  {
    symbol: 'CRV',
    address: '0xD533a949740bb3306d119CC777fa900bA034cd52', // Sepolia CRV
    chainId: 11155111,
  },
  {
    symbol: 'MKR',
    address: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2', // Sepolia MKR
    chainId: 11155111,
  },
];

/**
 * Get popular tokens for a specific chain
 */
export function getPopularTokensForChain(chainId: number): PopularToken[] {
  return popularTokens.filter((token) => token.chainId === chainId);
}

