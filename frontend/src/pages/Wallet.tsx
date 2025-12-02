import type { FormEvent } from 'react';
import { useState } from 'react';
import { BaseError, isAddress, parseEther } from 'viem';
import {
  useAccount,
  useBalance,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from 'wagmi';

import { Panel } from '../components/Panel.tsx';
import { StatusPill } from '../components/StatusPill.tsx';

export default function WalletPage() {
  const { address, chain } = useAccount();
  const { data: balance, isLoading: isBalanceLoading, refetch: refetchBalance } = useBalance({
    address,
    query: { enabled: Boolean(address), refetchInterval: 12_000 },
  });
  
  const [faucetStatus, setFaucetStatus] = useState<'idle' | 'requesting' | 'success' | 'error'>('idle');
  const [faucetError, setFaucetError] = useState<string | null>(null);
  
  const isSepolia = chain?.id === 11155111;

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [sendHash, setSendHash] = useState<`0x${string}` | undefined>();

  const {
    sendTransactionAsync,
    isPending: isSending,
    error: sendError,
  } = useSendTransaction();

  const {
    data: receipt,
    isLoading: isWaiting,
    isSuccess,
    isError,
  } = useWaitForTransactionReceipt({
    hash: sendHash,
    query: { enabled: Boolean(sendHash) },
  });

  const canSubmit =
    Boolean(address) && isAddress(recipient) && Number(amount) > 0 && !isSending && !isWaiting;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    try {
      const hash = await sendTransactionAsync({
        to: recipient as `0x${string}`,
        value: parseEther(amount),
      });
      setSendHash(hash);
    } catch (error) {
      console.error(error);
    }
  };

  const status: 'idle' | 'pending' | 'success' | 'error' =
    isSending || isWaiting ? 'pending' : isSuccess ? 'success' : isError ? 'error' : 'idle';

  const readableError =
    sendError instanceof BaseError ? sendError.shortMessage : sendError?.message;

  const handleFaucetRequest = () => {
    if (!address || !isSepolia) {
      setFaucetError('Please connect your wallet and switch to Sepolia network');
      setFaucetStatus('error');
      return;
    }

    setFaucetStatus('requesting');
    setFaucetError(null);

    // Open public faucet in new tab with address pre-filled
    window.open(`https://sepoliafaucet.com/?address=${address}`, '_blank');
    
    setFaucetStatus('success');
    setFaucetError('Faucet opened in new tab. Complete the request there, then refresh your balance.');
    
    // Refetch balance after a delay to check if ETH arrived
    setTimeout(() => {
      refetchBalance();
    }, 10000);
  };

  return (
    <div className="space-y-4 md:space-y-8">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.6em] text-ivory/50">Wallet</p>
        <h2 className="text-2xl md:text-3xl font-light uppercase tracking-[0.2em] md:tracking-[0.3em]">
          Control <span className="text-flare">Panel</span>
        </h2>
      </div>

      <Panel title="Status" subtitle="Live wallet telemetry">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-ivory/60">Address</p>
            <p className="mt-2 text-base md:text-lg font-light text-ivory break-all md:break-normal">
              {address ? (
                <>
                  <span className="text-flare">{address.slice(0, 4)}</span>
                  {address.slice(4, -4)}
                  <span className="text-flare">{address.slice(-4)}</span>
                </>
              ) : (
                'Connect wallet to populate'
              )}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm uppercase tracking-[0.4em] text-ivory/60">Balance</p>
            <p className="mt-2 text-lg font-light">
              {isBalanceLoading ? (
                'Loading…'
              ) : balance ? (
                <>
                  <span className="text-flare">{Number(balance.formatted).toFixed(4)}</span>{' '}
                  {balance.symbol}
                </>
              ) : (
                <>
                  <span className="text-flare">0</span> {chain?.nativeCurrency?.symbol ?? 'ETH'}
                </>
              )}
            </p>
          </div>
        </div>
      </Panel>

      <Panel title="Send Transaction" subtitle="Minimal transfer composer">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:gap-6 md:grid-cols-2">
            <label className="text-xs uppercase tracking-[0.4em] text-ivory/60">
              Recipient
              <input
                type="text"
                value={recipient}
                onChange={(event) => setRecipient(event.target.value.trim())}
                placeholder="0x..."
                className="mt-2 w-full border border-ivory/20 bg-black px-4 py-3 text-base text-ivory focus:border-flare focus:outline-none"
              />
            </label>

            <label className="text-xs uppercase tracking-[0.4em] text-ivory/60">
              Amount (ETH)
              <input
                type="number"
                min="0"
                step="0.0001"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.05"
                className="mt-2 w-full border border-ivory/20 bg-black px-4 py-3 text-base text-ivory focus:border-flare focus:outline-none"
              />
            </label>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <StatusPill status={status} label={status.toUpperCase()} />

            <button
              type="submit"
              disabled={!canSubmit}
              className="border border-flare/40 px-8 py-3 text-xs uppercase tracking-[0.4em] text-flare transition enabled:hover:border-flare enabled:hover:bg-flare/10 disabled:opacity-30"
            >
              Send Transaction
            </button>
          </div>

          {readableError && <p className="text-sm text-flare">Error: {readableError}</p>}
          {sendHash && (
            <div className="text-xs text-ivory/70">
              Hash:{' '}
              <a
                href={`${
                  chain?.blockExplorers?.default?.url ?? 'https://sepolia.etherscan.io'
                }/tx/${sendHash}`}
                target="_blank"
                rel="noreferrer"
                className="text-flare underline"
              >
                {sendHash}
              </a>
            </div>
          )}
          {receipt && (
            <p className="text-xs text-emerald-400">
              Confirmed in block {Number(receipt.blockNumber)}
            </p>
          )}
        </form>
      </Panel>

      <Panel title="Testnet Faucet" subtitle="Request Sepolia ETH">
        <div className="space-y-4">
          <p className="text-sm text-ivory/70">
            Get free testnet ETH to interact with the protocol. Faucet requests are limited to prevent abuse.
          </p>
          
          {!address && (
            <p className="text-sm text-ivory/50">
              Connect your wallet to request test ETH.
            </p>
          )}

          {address && !isSepolia && (
            <p className="text-sm text-ivory/50">
              Please switch to Sepolia testnet to request test ETH. Current network: {chain?.name || 'Unknown'} ({chain?.id})
            </p>
          )}
          
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-end">
            <button
              onClick={handleFaucetRequest}
              disabled={!address || faucetStatus === 'requesting' || !isSepolia}
              className="border border-flare/40 px-8 py-3 text-xs uppercase tracking-[0.4em] text-flare transition enabled:hover:border-flare enabled:hover:bg-flare/10 disabled:opacity-30"
            >
              {faucetStatus === 'requesting' ? 'Requesting...' : 'Request Test ETH'}
            </button>
          </div>

          {faucetError && (
            <p className={`text-sm ${faucetStatus === 'success' ? 'text-ivory/70' : 'text-flare'}`}>
              {faucetError}
            </p>
          )}

          {faucetStatus === 'success' && !faucetError && (
            <p className="text-sm text-emerald-400">
              Request submitted. ETH should arrive in your wallet shortly. If not, try the public faucet.
            </p>
          )}
        </div>
      </Panel>
    </div>
  );
}

