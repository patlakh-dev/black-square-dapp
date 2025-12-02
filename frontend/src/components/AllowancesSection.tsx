import { useEffect, useMemo, useState } from 'react';
import { useAccount, useChainId, usePublicClient } from 'wagmi';

import { Panel } from './Panel.tsx';
import { getAllowances, type AllowanceResult } from '../lib/getAllowances.ts';
import { getPopularTokensForChain } from '../lib/popularTokens.ts';
import { knownSpenders } from '../lib/knownSpenders.ts';

interface TokenAllowanceResult extends AllowanceResult {
  tokenSymbol: string;
  tokenAddress: `0x${string}`;
  isSuspicious?: boolean;
  riskLevel?: 'high' | 'medium' | 'low';
}

// Check if a spender is in the known safe list
function isKnownSpender(spenderAddress: `0x${string}`): boolean {
  return knownSpenders.some((spender) => 
    spender.address.toLowerCase() === spenderAddress.toLowerCase()
  );
}

// Determine risk level for an allowance
function getRiskLevel(result: TokenAllowanceResult): 'high' | 'medium' | 'low' {
  // High risk: unlimited allowance to unknown contract
  if (result.status === 'unlimited' && !isKnownSpender(result.spenderAddress)) {
    return 'high';
  }
  // Medium risk: unlimited allowance to known contract (still risky but trusted)
  if (result.status === 'unlimited') {
    return 'medium';
  }
  // Medium risk: large limited allowance to unknown contract
  if (result.status === 'limited' && !isKnownSpender(result.spenderAddress)) {
    const amount = parseFloat(result.formattedAmount);
    if (amount > 10000) { // Threshold for "large" amount
      return 'medium';
    }
  }
  // Low risk: limited allowance to known contract
  return 'low';
}

export function AllowancesSection() {
  const { address } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<TokenAllowanceResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [checkedTokens, setCheckedTokens] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);

  // Auto-check on mount and when address/chain changes
  useEffect(() => {
    if (!address || !publicClient || !chainId) {
      setResults([]);
      return;
    }

    const checkAllTokens = async () => {
      setError(null);
      setResults([]);
      setIsLoading(true);
      setCheckedTokens(0);

      const tokens = getPopularTokensForChain(chainId);
      setTotalTokens(tokens.length);

      if (tokens.length === 0) {
        setError(`No popular tokens configured for chain ID ${chainId}`);
        setIsLoading(false);
        return;
      }

      const allResults: TokenAllowanceResult[] = [];

      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        setCheckedTokens(i + 1);

        try {
          const allowanceResults = await getAllowances({
            walletAddress: address,
            tokenAddress: token.address,
            publicClient,
          });

          // Add token info and risk assessment to each result
          const tokenResults: TokenAllowanceResult[] = allowanceResults.map((result) => {
            const fullResult: TokenAllowanceResult = {
              ...result,
              tokenSymbol: token.symbol,
              tokenAddress: token.address,
            };
            fullResult.riskLevel = getRiskLevel(fullResult);
            fullResult.isSuspicious = fullResult.riskLevel !== 'low';
            return fullResult;
          });

          allResults.push(...tokenResults);
        } catch (err) {
          console.warn(`Failed to check allowances for ${token.symbol}:`, err);
          // Continue with other tokens even if one fails
        }
      }

      setResults(allResults);
      setIsLoading(false);
    };

    checkAllTokens();
  }, [address, chainId, publicClient]);

  const hasUnlimitedAllowances = results.some((r) => r.status === 'unlimited');
  
  // Find suspicious/risky allowances (commented out - not currently used)
  // const suspiciousResults = useMemo(() => {
  //   return results.filter((r) => r.isSuspicious && r.status !== 'none');
  // }, [results]);

  const highRiskResults = useMemo(() => {
    return results.filter((r) => r.riskLevel === 'high' && r.status !== 'none');
  }, [results]);

  const mediumRiskResults = useMemo(() => {
    return results.filter((r) => r.riskLevel === 'medium' && r.status !== 'none');
  }, [results]);

  const unknownSpenders = useMemo(() => {
    return results.filter((r) => !isKnownSpender(r.spenderAddress) && r.status !== 'none');
  }, [results]);

  // Debug: log results to console
  useEffect(() => {
    if (results.length > 0 && !isLoading) {
      console.log('Allowance results:', {
        total: results.length,
        unlimited: results.filter((r) => r.status === 'unlimited').length,
        limited: results.filter((r) => r.status === 'limited').length,
        highRisk: highRiskResults.length,
        mediumRisk: mediumRiskResults.length,
        unknown: unknownSpenders.length,
        sample: results.slice(0, 3).map((r) => ({
          token: r.tokenSymbol,
          spender: r.spenderName,
          address: r.spenderAddress,
          status: r.status,
          risk: r.riskLevel,
          isKnown: isKnownSpender(r.spenderAddress),
        })),
      });
    }
  }, [results, isLoading, highRiskResults, mediumRiskResults, unknownSpenders]);
  
  // Group results by token
  const resultsByToken = results.reduce((acc, result) => {
    const key = result.tokenSymbol;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(result);
    return acc;
  }, {} as Record<string, TokenAllowanceResult[]>);

  return (
    <>
      {highRiskResults.length > 0 && (
        <Panel title="🚨 High Risk Detected" subtitle="Unlimited approvals to unknown contracts">
          <div className="space-y-3">
            <p className="text-sm text-flare font-light">
              <span className="font-semibold">{highRiskResults.length}</span> unlimited approval(s) 
              granted to <span className="font-semibold">unknown contracts</span>. These contracts 
              can withdraw unlimited tokens without further approval.
            </p>
            <div className="space-y-2">
              {highRiskResults.slice(0, 5).map((result, idx) => (
                <div key={idx} className="border border-flare/40 p-3 bg-flare/5">
                  <p className="text-xs font-mono text-flare">
                    {result.tokenSymbol} → {result.spenderAddress.slice(0, 8)}...{result.spenderAddress.slice(-6)}
                  </p>
                  <p className="text-xs text-ivory/60 mt-1">Status: UNLIMITED</p>
                </div>
              ))}
              {highRiskResults.length > 5 && (
                <p className="text-xs text-ivory/60">+ {highRiskResults.length - 5} more high-risk approvals</p>
              )}
            </div>
            <p className="text-xs text-ivory/60 mt-4">
              ⚠️ <strong>Action required:</strong> Review and revoke these approvals immediately if you don't recognize these contracts.
            </p>
          </div>
        </Panel>
      )}

      {mediumRiskResults.length > 0 && highRiskResults.length === 0 && (
        <Panel title="⚠️ Medium Risk" subtitle="Unlimited approvals to known protocols">
          <div className="space-y-3">
            <p className="text-sm text-ivory/80">
              Found <span className="text-flare font-semibold">{mediumRiskResults.length}</span> unlimited approval(s) 
              to known DeFi protocols. While these are trusted contracts, they can withdraw unlimited tokens.
            </p>
            <p className="text-xs text-ivory/60">
              Consider revoking these approvals if you're not actively using these protocols.
            </p>
          </div>
        </Panel>
      )}

      {unknownSpenders.length > 0 && highRiskResults.length === 0 && mediumRiskResults.length === 0 && (
        <Panel title="⚠️ Unknown Contracts" subtitle="Allowances granted to unrecognized contracts">
          <p className="text-sm text-ivory/80">
            Found <span className="text-flare font-semibold">{unknownSpenders.length}</span> approval(s) 
            to contracts not in our trusted list. Review these carefully to ensure they are legitimate.
          </p>
        </Panel>
      )}

      {hasUnlimitedAllowances && highRiskResults.length === 0 && mediumRiskResults.length === 0 && (
        <Panel title="ℹ️ Unlimited Allowances" subtitle="Unlimited approvals detected">
          <p className="text-sm text-ivory/80">
            This wallet has granted unlimited token approvals. While these are to known DeFi protocols, 
            consider revoking approvals if you're not actively using them.
          </p>
        </Panel>
      )}

      <Panel
        title="Token Allowance Checker"
        subtitle={`Auto-checking popular tokens for ${address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'connected wallet'}`}
      >
        {!address ? (
          <p className="text-sm text-ivory/60">Connect your wallet to check allowances</p>
        ) : isLoading ? (
          <div className="space-y-3">
            <p className="text-sm text-ivory/80">
              Checking allowances... ({checkedTokens}/{totalTokens} tokens)
            </p>
            <div className="h-1 w-full border border-ivory/20 bg-black">
              <div
                className="h-full bg-flare transition-all duration-300"
                style={{ width: `${totalTokens > 0 ? (checkedTokens / totalTokens) * 100 : 0}%` }}
              />
            </div>
          </div>
        ) : error ? (
          <p className="text-sm text-flare">Error: {error}</p>
        ) : (
          <p className="text-sm text-ivory/60">
            Checked {totalTokens} popular tokens. Found {results.length} allowance entries.
          </p>
        )}
      </Panel>

      {Object.entries(resultsByToken).map(([tokenSymbol, tokenResults]) => {
        const hasUnlimited = tokenResults.some((r) => r.status === 'unlimited');
        const hasAnyAllowance = tokenResults.some((r) => r.status !== 'none');

        // Only show tokens that have allowances
        if (!hasAnyAllowance) return null;

        return (
          <Panel
            key={tokenSymbol}
            title={`${tokenSymbol} Allowances`}
            subtitle={
              hasUnlimited ? (
                <span className="text-flare">⚠️ Unlimited approvals detected</span>
              ) : (
                `${tokenResults.length} active approvals`
              )
            }
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
                  {tokenResults.map((result, index) => {
                    const isSuspicious = result.isSuspicious || !isKnownSpender(result.spenderAddress);
                    const displayName = isKnownSpender(result.spenderAddress) 
                      ? result.spenderName 
                      : `⚠️ Unknown Contract`;

                    return (
                      <tr
                        key={`${result.tokenAddress}-${result.spenderAddress}-${index}`}
                        className={`border-b transition ${
                          result.riskLevel === 'high'
                            ? 'border-flare/40 bg-flare/5 hover:bg-flare/10'
                            : result.riskLevel === 'medium'
                              ? 'border-ivory/20 bg-ivory/5 hover:bg-ivory/10'
                              : 'border-ivory/5 hover:bg-ivory/5'
                        }`}
                      >
                        <td className="py-4 pr-4 font-light">
                          <span className={result.riskLevel === 'high' ? 'text-flare' : result.riskLevel === 'medium' ? 'text-ivory/90' : 'text-ivory/90'}>
                            {displayName}
                          </span>
                        </td>
                        <td className="py-4 pr-4 font-mono text-xs">
                          <span className={isSuspicious ? 'text-flare' : 'text-ivory/60'}>
                            {`${result.spenderAddress.slice(0, 6)}...${result.spenderAddress.slice(-4)}`}
                          </span>
                        </td>
                        <td className="py-4 pr-4 text-right font-mono">
                          <span className={result.status === 'unlimited' ? 'text-flare font-semibold' : 'text-ivory/80'}>
                            {result.status === 'unlimited'
                              ? '∞'
                              : result.status === 'none'
                                ? '0'
                                : result.formattedAmount}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <span
                            className={`inline-block px-2 py-1 ${
                              result.riskLevel === 'high'
                                ? 'border border-flare bg-flare/10 text-flare font-semibold'
                                : result.status === 'unlimited'
                                  ? 'border border-flare text-flare'
                                  : result.status === 'limited' && isSuspicious
                                    ? 'border border-ivory/60 text-ivory/90'
                                    : result.status === 'limited'
                                      ? 'border border-ivory/40 text-ivory/80'
                                      : 'border border-ivory/20 text-ivory/40'
                            }`}
                          >
                            {result.riskLevel === 'high' ? '⚠️ HIGH RISK' : result.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>
        );
      })}
    </>
  );
}

