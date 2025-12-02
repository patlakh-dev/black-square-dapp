import { type Address, type PublicClient, formatUnits, isAddress, maxUint256 } from 'viem';

import { erc20Abi } from './erc20Abi.ts';
import { knownSpenders } from './knownSpenders.ts';

export interface AllowanceResult {
  spenderName: string;
  spenderAddress: Address;
  allowance: bigint;
  formattedAmount: string;
  status: 'unlimited' | 'limited' | 'none';
  decimals: number;
  symbol: string;
}

export interface GetAllowancesParams {
  walletAddress: Address;
  tokenAddress: Address;
  publicClient: PublicClient;
}

/**
 * Get token allowances for a wallet across known spender contracts
 * Uses public RPC only - read-only, 100% secure
 */
export async function getAllowances({
  walletAddress,
  tokenAddress,
  publicClient,
}: GetAllowancesParams): Promise<AllowanceResult[]> {
  // Validate addresses
  if (!isAddress(walletAddress)) {
    throw new Error('Invalid wallet address');
  }
  if (!isAddress(tokenAddress)) {
    throw new Error('Invalid token address');
  }

  // Get token info (decimals and symbol)
  let decimals = 18; // default
  let symbol = 'TOKEN'; // default

  try {
    const [decimalsResult, symbolResult] = await Promise.all([
      publicClient.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'decimals',
      }),
      publicClient.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'symbol',
      }),
    ]);

    decimals = Number(decimalsResult);
    symbol = symbolResult as string;
  } catch (error) {
    console.warn('Failed to fetch token info, using defaults:', error);
  }

  // Check allowances for all known spenders
  const allowancePromises = knownSpenders.map(async (spender) => {
    try {
      const allowance = await publicClient.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [walletAddress, spender.address],
      });

      const allowanceBigInt = allowance as bigint;
      const formattedAmount = formatUnits(allowanceBigInt, decimals);

      // Determine status
      // maxUint256 = 2^256 - 1, which is the standard value for unlimited allowance
      // Some contracts might use maxUint256 - 1, so we check for very large values
      const unlimitedThreshold = maxUint256 - 1000000n; // Allow tolerance for edge cases
      let status: 'unlimited' | 'limited' | 'none';
      if (allowanceBigInt === 0n) {
        status = 'none';
      } else if (allowanceBigInt >= unlimitedThreshold) {
        status = 'unlimited';
      } else {
        status = 'limited';
      }

      return {
        spenderName: spender.name,
        spenderAddress: spender.address,
        allowance: allowanceBigInt,
        formattedAmount,
        status,
        decimals,
        symbol,
      };
    } catch (error) {
      // If contract call fails, assume no allowance
      console.warn(`Failed to check allowance for ${spender.name}:`, error);
      return {
        spenderName: spender.name,
        spenderAddress: spender.address,
        allowance: 0n,
        formattedAmount: '0',
        status: 'none' as const,
        decimals,
        symbol,
      };
    }
  });

  const results = await Promise.all(allowancePromises);

  // Sort: unlimited first, then limited, then none
  return results.sort((a, b) => {
    const statusOrder = { unlimited: 0, limited: 1, none: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });
}

