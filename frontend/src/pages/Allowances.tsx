import type { FormEvent } from 'react';
import { useState } from 'react';
import { isAddress } from 'viem';
import { usePublicClient } from 'wagmi';

import { Panel } from '../components/Panel.tsx';
import { getAllowances, type AllowanceResult } from '../lib/getAllowances.ts';

export default function AllowancesPage() {
  const publicClient = usePublicClient();
  const [walletAddress, setWalletAddress] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AllowanceResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tokenSymbol, setTokenSymbol] = useState<string>('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResults([]);
    setTokenSymbol('');

    if (!publicClient) {
      setError('Please connect to a network');
      return;
    }

    if (!isAddress(walletAddress)) {
      setError('Invalid wallet address');
      return;
    }

    if (!isAddress(tokenAddress)) {
      setError('Invalid token address');
      return;
    }

    setIsLoading(true);

    try {
      const allowanceResults = await getAllowances({
        walletAddress: walletAddress as `0x${string}`,
        tokenAddress: tokenAddress as `0x${string}`,
        publicClient,
      });

      setResults(allowanceResults);
      if (allowanceResults.length > 0) {
        setTokenSymbol(allowanceResults[0].symbol);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch allowances');
    } finally {
      setIsLoading(false);
    }
  };

  const hasUnlimitedAllowances = results.some((r) => r.status === 'unlimited');

  return (
    <div className="space-y-6">
      <Panel title="Token Allowance Checker" subtitle="Check ERC-20 token approvals for any wallet">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <label className="text-xs uppercase tracking-[0.4em] text-ivory/60">
              Wallet Address
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value.trim())}
                placeholder="0x..."
                className="mt-2 w-full border border-ivory/20 bg-black px-4 py-3 text-base text-ivory focus:border-flare focus:outline-none"
                disabled={isLoading}
              />
            </label>

            <label className="text-xs uppercase tracking-[0.4em] text-ivory/60">
              Token Address
              <input
                type="text"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value.trim())}
                placeholder="0x..."
                className="mt-2 w-full border border-ivory/20 bg-black px-4 py-3 text-base text-ivory focus:border-flare focus:outline-none"
                disabled={isLoading}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading || !walletAddress || !tokenAddress}
            className="border border-ivory/40 px-8 py-3 text-xs uppercase tracking-[0.4em] transition enabled:hover:border-flare enabled:hover:text-flare disabled:opacity-30"
          >
            {isLoading ? 'Checking...' : 'Check Allowances'}
          </button>

          {error && <p className="text-sm text-flare">Error: {error}</p>}
        </form>
      </Panel>

      {hasUnlimitedAllowances && (
        <Panel title="⚠️ Security Warning" subtitle="Unlimited allowances detected">
          <p className="text-sm text-ivory/80">
            This wallet has granted unlimited token approvals to one or more contracts. These
            contracts can withdraw any amount of tokens without further approval. Consider revoking
            these approvals if they are no longer needed.
          </p>
        </Panel>
      )}

      {results.length > 0 && (
        <Panel
          title="Allowance Results"
          subtitle={`Showing allowances for ${tokenSymbol || 'token'}`}
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-ivory/10 text-left uppercase tracking-[0.2em] text-ivory/60">
                  <th className="pb-3 pr-4">Spender</th>
                  <th className="pb-3 pr-4">Address</th>
                  <th className="pb-3 pr-4 text-right">Allowance</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr
                    key={`${result.spenderAddress}-${index}`}
                    className="border-b border-ivory/5 transition hover:bg-ivory/5"
                  >
                    <td className="py-4 pr-4 font-light text-ivory/90">{result.spenderName}</td>
                    <td className="py-4 pr-4 font-mono text-xs text-ivory/60">
                      {`${result.spenderAddress.slice(0, 6)}...${result.spenderAddress.slice(-4)}`}
                    </td>
                    <td className="py-4 pr-4 text-right font-mono text-ivory/80">
                      {result.status === 'unlimited'
                        ? '∞'
                        : result.status === 'none'
                          ? '0'
                          : result.formattedAmount}
                    </td>
                    <td className="py-4 text-right">
                      <span
                        className={`inline-block px-2 py-1 ${
                          result.status === 'unlimited'
                            ? 'border border-flare text-flare'
                            : result.status === 'limited'
                              ? 'border border-ivory/40 text-ivory/80'
                              : 'border border-ivory/20 text-ivory/40'
                        }`}
                      >
                        {result.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
}

