// Known spender contract addresses (safe defaults, no private keys)
// These are common DeFi protocols that users often grant token approvals to

export interface KnownSpender {
  name: string;
  address: `0x${string}`;
  chainId?: number; // Optional: specific chain, undefined = all chains
}

// Mainnet addresses (will work on testnets if contracts exist there)
export const knownSpenders: KnownSpender[] = [
  // DEX Aggregators
  {
    name: 'Uniswap V3 Router',
    address: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
  },
  {
    name: 'Uniswap V2 Router',
    address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  },
  {
    name: '1inch Router',
    address: '0x1111111254EEB25477B68fb85Ed929f73A960582',
  },
  {
    name: 'PancakeSwap Router',
    address: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
  },
  {
    name: 'SushiSwap Router',
    address: '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
  },
  // NFT Marketplaces
  {
    name: 'OpenSea Seaport',
    address: '0x00000000006c3852cbEf3e08E8dF289169EdE581',
  },
  {
    name: 'Blur Marketplace',
    address: '0x000000000000Ad05Cc4F1000Bd47CAdC3d63b3F6',
  },
  // Bridges
  {
    name: 'Hop Protocol',
    address: '0xB8901acB165ed027E32754E0FFe830802919727f',
  },
  {
    name: 'Stargate Router',
    address: '0x8731d54E9D02c286767d56ac03e8037C07e01e98',
  },
  // Additional common protocols
  {
    name: 'Aave Lending Pool',
    address: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',
  },
  {
    name: 'Compound Comptroller',
    address: '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B',
  },
  {
    name: 'Curve Router',
    address: '0x99C584Ec1d36A9E3d13290042b04b5bFBE3213E5',
  },
  {
    name: 'Balancer Vault',
    address: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
  },
  {
    name: 'Yearn Vault',
    address: '0x5f18C75AbDAe578b483E5F43f12a39cF75b973a9',
  },
  {
    name: '0x Exchange Proxy',
    address: '0xDef1C0ded9bec7F1a1670819833240f027b25EfF',
  },
  {
    name: 'Paraswap Router',
    address: '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57',
  },
  {
    name: 'KyberSwap Router',
    address: '0x5649B4DD00780e99Bab7Abb4A3d581Ea1aEB23D0',
  },
  {
    name: 'GMX Router',
    address: '0xaBBc5F99639c9B6bCb58544ddf04EFA6802F4064',
  },
  {
    name: 'dYdX Exchange',
    address: '0xD54f502e1742aE47A5a7209Ca6f5f7d0b8F0B5e5',
  },
];

