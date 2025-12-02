import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { BaseError, zeroAddress } from 'viem';
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';

import { MalevichSquare } from '../components/MalevichSquare.tsx';
import { Panel } from '../components/Panel.tsx';
import { StatusPill } from '../components/StatusPill.tsx';
import {
  blackSquareAbi,
  blackSquareAddress,
  malevichCollectionAbi,
  malevichCollectionAddress,
  nftStakingAbi,
  nftStakingAddress,
} from '../lib/contracts.ts';

export default function NftPage() {
  const { address, chain } = useAccount();
  const [mintHash, setMintHash] = useState<`0x${string}` | undefined>();

  const targetAddress = blackSquareAddress ?? zeroAddress;

  const { data: hasMinted, refetch } = useReadContract({
    address: targetAddress,
    abi: blackSquareAbi,
    functionName: 'hasMinted',
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && blackSquareAddress) },
  });

  const {
    writeContractAsync,
    isPending: isMinting,
    error: mintError,
  } = useWriteContract();

  const {
    data: mintReceipt,
    isLoading: isConfirming,
    isSuccess,
    isError,
  } = useWaitForTransactionReceipt({
    hash: mintHash,
    query: { enabled: Boolean(mintHash) },
  });

  useEffect(() => {
    if (isSuccess) {
      refetch();
    }
  }, [isSuccess, refetch]);

  const handleMint = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!address || !blackSquareAddress || hasMinted) return;

    try {
      const hash = await writeContractAsync({
        address: blackSquareAddress,
        abi: blackSquareAbi,
        functionName: 'mint',
      });
      setMintHash(hash);
    } catch (error) {
      console.error(error);
    }
  };

  if (!blackSquareAddress) {
    return (
      <Panel
        title="Configuration"
        subtitle="Set VITE_BLACK_SQUARE_CONTRACT_ADDRESS to enable minting"
      >
        <p className="text-sm text-flare">Contract address is missing from environment</p>
      </Panel>
    );
  }

  const mintStatus: 'idle' | 'pending' | 'success' | 'error' = hasMinted
    ? 'success'
    : isMinting || isConfirming
      ? 'pending'
      : isError
        ? 'error'
        : 'idle';

  const readableError =
    mintError instanceof BaseError ? mintError.shortMessage : mintError?.message;

  return (
    <div className="space-y-4 md:space-y-8 overflow-x-hidden">
      <div className="grid gap-4 md:gap-10 md:grid-cols-2 overflow-x-hidden">
        <div className="space-y-4 md:space-y-6 overflow-visible">
          <div>
            <p className="text-xs uppercase tracking-[0.6em] text-ivory/50">Mint</p>
            <h2 className="mt-1 md:mt-2 text-2xl md:text-3xl font-light uppercase tracking-[0.2em] md:tracking-[0.3em]">Black Square NFT</h2>
          </div>

          <Panel title="Edition" subtitle="One mint per address">
          <form className="space-y-4 md:space-y-6" onSubmit={handleMint}>
            <div className="space-y-2 text-sm text-ivory/70">
              <p>Connected address</p>
              <p className="text-xs md:text-base text-ivory whitespace-nowrap md:whitespace-normal overflow-hidden text-ellipsis md:break-all md:overflow-wrap-anywhere">{address ?? 'Not connected'}</p>
            </div>

            <StatusPill status={mintStatus} label={hasMinted ? 'MINTED' : mintStatus.toUpperCase()} />

            <button
              type="submit"
              disabled={!address || Boolean(hasMinted) || isMinting || isConfirming}
              className="w-full border border-flare px-8 py-3 text-xs uppercase tracking-[0.4em] text-flare transition enabled:hover:bg-flare enabled:hover:text-ink disabled:opacity-30"
            >
              Mint Black Square NFT
            </button>

            {readableError && <p className="text-sm text-flare">Error: {readableError}</p>}
            {mintHash && (
              <p className="text-xs text-ivory/70 break-all overflow-wrap-anywhere">
                Hash:{' '}
                <a
                  href={`${chain?.blockExplorers?.default?.url ?? 'https://sepolia.etherscan.io'}/tx/${mintHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-flare underline break-all"
                >
                  {mintHash}
                </a>
              </p>
            )}
            {mintReceipt && (
              <p className="text-xs text-emerald-400">
                Mint confirmed in block {Number(mintReceipt.blockNumber)}
              </p>
            )}
          </form>
          </Panel>
        </div>

        <div className="hidden md:flex flex-col items-center justify-center gap-6">
          <MalevichSquare size={320} />
          <p className="text-center text-sm text-ivory/60">
            Token metadata is an on-chain JSON stub with an SVG homage to Malevich&apos;s square.
            Supply is uncapped, yet the contract enforces one mint per wallet.
          </p>
        </div>
      </div>
      
      <div className="md:hidden">
        <p className="text-center text-sm text-ivory/60">
          Token metadata is an on-chain JSON stub with an SVG homage to Malevich&apos;s square.
          Supply is uncapped, yet the contract enforces one mint per wallet.
        </p>
      </div>

      {nftStakingAddress && blackSquareAddress && <NFTStakingPanel />}
    </div>
  );
}

function NFTStakingPanel() {
  const { address, chain } = useAccount();
  const publicClient = usePublicClient();
  const [selectedTokenId, setSelectedTokenId] = useState<string>('');
  const [stakeHash, setStakeHash] = useState<`0x${string}` | undefined>();
  const [unstakeHash, setUnstakeHash] = useState<`0x${string}` | undefined>();
  const [claimHash, setClaimHash] = useState<`0x${string}` | undefined>();
  const [isSearchingToken, setIsSearchingToken] = useState(false);

  // Get hasMinted status
  const { data: hasMinted } = useReadContract({
    address: blackSquareAddress,
    abi: blackSquareAbi,
    functionName: 'hasMinted',
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && blackSquareAddress) },
  });

  // Get user's BlackSquareNFT balance
  const { data: nftBalance, isLoading: isNftBalanceLoading, refetch: refetchBalance } = useReadContract({
    address: blackSquareAddress,
    abi: blackSquareAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && blackSquareAddress), refetchInterval: 12_000 },
  });

  // Get staked tokens (moved up to use in useEffect)
  const { data: stakedTokens, refetch: refetchStaked } = useReadContract({
    address: nftStakingAddress,
    abi: nftStakingAbi,
    functionName: 'getStakerTokens',
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && nftStakingAddress), refetchInterval: 12_000 },
  });

  // Try to get tokens by owner (if function exists)
  const { data: userTokens, error: userTokensError } = useReadContract({
    address: blackSquareAddress,
    abi: blackSquareAbi,
    functionName: 'getTokensByOwner',
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && blackSquareAddress), refetchInterval: 12_000 },
  });

  // Try to get single token by owner (fallback for old contracts)
  const { data: ownerTokenId } = useReadContract({
    address: blackSquareAddress,
    abi: blackSquareAbi,
    functionName: 'getTokenIdByOwner',
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && blackSquareAddress && userTokensError), refetchInterval: 12_000 },
  });

  // Search for token ID by checking ownerOf (fallback for old contracts)
  // Also search if balance is 0 but hasMinted is true (NFT might be staked)
  useEffect(() => {
    const findTokenId = async () => {
      if (
        !address ||
        !blackSquareAddress ||
        !publicClient ||
        selectedTokenId ||
        isSearchingToken ||
        (userTokens && Array.isArray(userTokens) && userTokens.length > 0) ||
        (ownerTokenId && Number(ownerTokenId) > 0) ||
        (stakedTokens && Array.isArray(stakedTokens) && stakedTokens.length > 0)
      ) {
        return;
      }

      // Search if balance > 0 OR if we need to find token (even if staked)
      const shouldSearch = 
        (nftBalance !== undefined && nftBalance !== null && Number(nftBalance) > 0) ||
        (nftBalance === 0n && hasMinted); // If minted but balance is 0, NFT might be staked

      if (shouldSearch) {
        setIsSearchingToken(true);
        try {
          // Search through first 100 tokens
          for (let i = 1; i <= 100; i++) {
            try {
              const owner = await publicClient.readContract({
                address: blackSquareAddress,
                abi: blackSquareAbi,
                functionName: 'ownerOf',
                args: [BigInt(i)],
              });
              if (owner.toLowerCase() === address.toLowerCase()) {
                setSelectedTokenId(i.toString());
                break;
              }
            } catch {
              // Token doesn't exist or error, continue
            }
          }
        } catch (error) {
          console.error('Error searching for token:', error);
        } finally {
          setIsSearchingToken(false);
        }
      }
    };

    findTokenId();
  }, [address, blackSquareAddress, publicClient, nftBalance, userTokens, ownerTokenId, selectedTokenId, isSearchingToken, stakedTokens, hasMinted]);

  // Auto-fill tokenId if found
  useEffect(() => {
    if (userTokens && Array.isArray(userTokens) && userTokens.length > 0 && !selectedTokenId) {
      // Use first available token
      const firstToken = userTokens[0];
      if (firstToken && Number(firstToken) > 0) {
        setSelectedTokenId(firstToken.toString());
      }
    } else if (ownerTokenId && Number(ownerTokenId) > 0 && !selectedTokenId) {
      // Fallback: use getTokenIdByOwner result
      setSelectedTokenId(ownerTokenId.toString());
    }
  }, [userTokens, ownerTokenId, selectedTokenId]);

  // If user has staked tokens, use the first one as selectedTokenId and set it for staking info
  useEffect(() => {
    if (stakedTokens && Array.isArray(stakedTokens) && stakedTokens.length > 0) {
      const firstStaked = stakedTokens[0];
      if (firstStaked && Number(firstStaked) > 0) {
        // Don't override if user manually selected a different token
        if (!selectedTokenId || selectedTokenId === firstStaked.toString()) {
          setSelectedTokenId(firstStaked.toString());
        }
      }
    }
  }, [stakedTokens, selectedTokenId]);

  // Get reward NFT balance
  const { data: rewardBalance } = useReadContract({
    address: malevichCollectionAddress,
    abi: malevichCollectionAbi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && malevichCollectionAddress), refetchInterval: 12_000 },
  });

  // Get staking periods
  const { data: day1Period } = useReadContract({
    address: nftStakingAddress,
    abi: nftStakingAbi,
    functionName: 'DAY_1',
  });

  const { data: day2Period } = useReadContract({
    address: nftStakingAddress,
    abi: nftStakingAbi,
    functionName: 'DAY_2',
  });

  const { data: day3Period } = useReadContract({
    address: nftStakingAddress,
    abi: nftStakingAbi,
    functionName: 'DAY_3',
  });

  const { data: day4Period } = useReadContract({
    address: nftStakingAddress,
    abi: nftStakingAbi,
    functionName: 'DAY_4',
  });

  // Get staking info for first staked token (if any)
  const firstStakedToken = stakedTokens && Array.isArray(stakedTokens) && stakedTokens.length > 0 ? stakedTokens[0] : undefined;
  const { data: stakingInfo, isLoading: isStakingInfoLoading } = useReadContract({
    address: nftStakingAddress,
    abi: nftStakingAbi,
    functionName: 'getStakingInfo',
    args: firstStakedToken !== undefined ? [firstStakedToken] : undefined,
    query: { enabled: firstStakedToken !== undefined && nftStakingAddress !== undefined, refetchInterval: 5_000 },
  });

  const {
    writeContractAsync: writeStake,
    isPending: isStaking,
    error: stakeError,
  } = useWriteContract();

  const {
    writeContractAsync: writeUnstake,
    isPending: isUnstaking,
  } = useWriteContract();

  const {
    writeContractAsync: writeClaim,
    isPending: isClaiming,
  } = useWriteContract();

  const {
    isLoading: isStakeConfirming,
    isSuccess: isStakeSuccess,
  } = useWaitForTransactionReceipt({
    hash: stakeHash,
    query: { enabled: Boolean(stakeHash) },
  });

  const {
    isLoading: isUnstakeConfirming,
    isSuccess: isUnstakeSuccess,
  } = useWaitForTransactionReceipt({
    hash: unstakeHash,
    query: { enabled: Boolean(unstakeHash) },
  });

  const {
    isLoading: isClaimConfirming,
    isSuccess: isClaimSuccess,
  } = useWaitForTransactionReceipt({
    hash: claimHash,
    query: { enabled: Boolean(claimHash) },
  });

  useEffect(() => {
    if (isStakeSuccess || isUnstakeSuccess || isClaimSuccess) {
      refetchBalance();
      refetchStaked();
    }
  }, [isStakeSuccess, isUnstakeSuccess, isClaimSuccess, refetchBalance, refetchStaked]);

  const [approveHash, setApproveHash] = useState<`0x${string}` | undefined>();
  const {
    isLoading: isApproveConfirming,
    isSuccess: isApproveSuccess,
  } = useWaitForTransactionReceipt({
    hash: approveHash,
    query: { enabled: Boolean(approveHash) },
  });

  const handleStake = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!address || !nftStakingAddress || !selectedTokenId || !blackSquareAddress) return;

    try {
      const tokenId = BigInt(selectedTokenId);

      // First approve staking contract to transfer the NFT
      const approveTxHash = await writeStake({
        address: blackSquareAddress,
        abi: blackSquareAbi,
        functionName: 'approve',
        args: [nftStakingAddress, tokenId],
      });
      setApproveHash(approveTxHash);
    } catch (error) {
      console.error(error);
    }
  };

  // Auto-stake after approval is confirmed
  useEffect(() => {
    if (isApproveSuccess && selectedTokenId && nftStakingAddress) {
      const stakeAfterApprove = async () => {
        try {
          const tokenId = BigInt(selectedTokenId);
          const hash = await writeStake({
            address: nftStakingAddress!,
            abi: nftStakingAbi,
            functionName: 'stake',
            args: [tokenId],
          });
          setStakeHash(hash);
          setSelectedTokenId('');
          setApproveHash(undefined);
        } catch (error) {
          console.error(error);
        }
      };
      stakeAfterApprove();
    }
  }, [isApproveSuccess, selectedTokenId, nftStakingAddress, writeStake]);

  const handleUnstake = async (tokenId: bigint) => {
    if (!nftStakingAddress) return;

    try {
      const hash = await writeUnstake({
        address: nftStakingAddress,
        abi: nftStakingAbi,
        functionName: 'unstake',
        args: [tokenId],
      });
      setUnstakeHash(hash);
    } catch (error) {
      console.error(error);
    }
  };

  const handleClaimReward = async (tokenId: bigint) => {
    if (!nftStakingAddress) return;

    try {
      const hash = await writeClaim({
        address: nftStakingAddress,
        abi: nftStakingAbi,
        functionName: 'claimReward',
        args: [tokenId],
      });
      setClaimHash(hash);
    } catch (error) {
      console.error(error);
    }
  };

  const formatDuration = (seconds: bigint | undefined) => {
    if (!seconds || seconds === 0n) return '< 1 day';
    const days = Number(seconds) / (24 * 60 * 60);
    if (days < 1) return '< 1 day';
    if (days < 30) return `${Math.floor(days)} days`;
    if (days < 365) return `${Math.floor(days / 30)} months`;
    return `${Math.floor(days / 365)} years`;
  };

  const stakingDuration = stakingInfo && stakingInfo[3] !== undefined ? stakingInfo[3] : undefined;
  const rewardsClaimedCount = stakingInfo && stakingInfo[4] !== undefined ? Number(stakingInfo[4]) : 0;
  
  // Determine next reward and time until it's available
  const getNextRewardInfo = () => {
    if (!stakingDuration || !day1Period || !day2Period || !day3Period || !day4Period) {
      return { reward: 'Loading...', timeRemaining: null };
    }
    
    const seconds = Number(stakingDuration);
    
    // Determine which reward is next based on claimed count
    if (rewardsClaimedCount === 0) {
      // Next: Red Square (1 day)
      if (seconds >= Number(day1Period)) {
        return { reward: 'Red Square (available now)', timeRemaining: null };
      }
      const timeLeft = Number(day1Period) - seconds;
      if (timeLeft < 3600) {
        const minutesLeft = Math.ceil(timeLeft / 60);
        return { reward: 'Red Square', timeRemaining: `${minutesLeft} minutes` };
      }
      const hoursLeft = Math.ceil(timeLeft / 3600);
      const daysLeft = Math.floor(hoursLeft / 24);
      if (daysLeft > 0) {
        return { reward: 'Red Square', timeRemaining: `${daysLeft} day${daysLeft > 1 ? 's' : ''}` };
      }
      return { reward: 'Red Square', timeRemaining: `${hoursLeft} hours` };
    } else if (rewardsClaimedCount === 1) {
      // Next: White on White (2 days)
      if (seconds >= Number(day2Period)) {
        return { reward: 'White on White (available now)', timeRemaining: null };
      }
      const timeLeft = Number(day2Period) - seconds;
      if (timeLeft < 3600) {
        const minutesLeft = Math.ceil(timeLeft / 60);
        return { reward: 'White on White', timeRemaining: `${minutesLeft} minutes` };
      }
      const hoursLeft = Math.ceil(timeLeft / 3600);
      const daysLeft = Math.floor(hoursLeft / 24);
      if (daysLeft > 0) {
        return { reward: 'White on White', timeRemaining: `${daysLeft} day${daysLeft > 1 ? 's' : ''}` };
      }
      return { reward: 'White on White', timeRemaining: `${hoursLeft} hours` };
    } else if (rewardsClaimedCount === 2) {
      // Next: Black Circle (3 days)
      if (seconds >= Number(day3Period)) {
        return { reward: 'Black Circle (available now)', timeRemaining: null };
      }
      const timeLeft = Number(day3Period) - seconds;
      if (timeLeft < 3600) {
        const minutesLeft = Math.ceil(timeLeft / 60);
        return { reward: 'Black Circle', timeRemaining: `${minutesLeft} minutes` };
      }
      const hoursLeft = Math.ceil(timeLeft / 3600);
      const daysLeft = Math.floor(hoursLeft / 24);
      if (daysLeft > 0) {
        return { reward: 'Black Circle', timeRemaining: `${daysLeft} day${daysLeft > 1 ? 's' : ''}` };
      }
      return { reward: 'Black Circle', timeRemaining: `${hoursLeft} hours` };
    } else if (rewardsClaimedCount === 3) {
      // Next: Suprematist (4 days)
      if (seconds >= Number(day4Period)) {
        return { reward: 'Suprematist (available now)', timeRemaining: null };
      }
      const timeLeft = Number(day4Period) - seconds;
      if (timeLeft < 3600) {
        const minutesLeft = Math.ceil(timeLeft / 60);
        return { reward: 'Suprematist', timeRemaining: `${minutesLeft} minutes` };
      }
      const hoursLeft = Math.ceil(timeLeft / 3600);
      const daysLeft = Math.floor(hoursLeft / 24);
      if (daysLeft > 0) {
        return { reward: 'Suprematist', timeRemaining: `${daysLeft} day${daysLeft > 1 ? 's' : ''}` };
      }
      return { reward: 'Suprematist', timeRemaining: `${hoursLeft} hours` };
    } else {
      return { reward: 'All rewards claimed', timeRemaining: null };
    }
  };
  
  const nextRewardInfo = getNextRewardInfo();
  
  // Can claim if next reward is available
  const canClaimReward = nextRewardInfo.timeRemaining === null && nextRewardInfo.reward.includes('available now');

  const stakeStatus: 'idle' | 'pending' | 'success' | 'error' =
    isStaking || isStakeConfirming
      ? 'pending'
      : isStakeSuccess
        ? 'success'
        : stakeError
          ? 'error'
          : 'idle';

  const readableStakeError =
    stakeError instanceof BaseError ? stakeError.shortMessage : stakeError?.message;

  return (
    <Panel title="NFT Staking" subtitle="Stake BlackSquareNFT to earn Malevich artworks">
      <div className="space-y-4 md:space-y-6 overflow-x-hidden">
        {/* Stats and Reward Tiers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          <div className="border border-ivory/20 p-2 md:p-4">
            <p className="text-xs uppercase tracking-[0.3em] md:tracking-[0.4em] text-ivory/60 break-words">Your NFTs</p>
            <p className="mt-2 text-2xl font-light">
              {isNftBalanceLoading ? (
                <span className="text-ivory/30">—</span>
              ) : nftBalance !== undefined && nftBalance !== null ? (
                <span className="text-flare">{Number(nftBalance).toString()}</span>
              ) : (
                <span className="text-ivory/30">—</span>
              )}
            </p>
          </div>
          <div className="border border-ivory/20 p-2 md:p-4">
            <p className="text-xs uppercase tracking-[0.3em] md:tracking-[0.4em] text-ivory/60 break-words">Staked</p>
            <p className="mt-2 text-2xl font-light">
              {stakedTokens !== undefined && stakedTokens !== null ? (
                <span className="text-flare">{String(stakedTokens.length)}</span>
              ) : (
                <span className="text-ivory/30">—</span>
              )}
            </p>
          </div>
          <div className="border border-ivory/20 p-2 md:p-4">
            <p className="text-xs uppercase tracking-[0.3em] md:tracking-[0.4em] text-ivory/60 break-words">Rewards</p>
            <p className="mt-2 text-2xl font-light">
              {rewardBalance !== undefined && rewardBalance !== null ? (
                <span className="text-flare">{String(Number(rewardBalance))}</span>
              ) : (
                <span className="text-ivory/30">—</span>
              )}
            </p>
          </div>
          <div className="border border-ivory/20 p-2 md:p-4">
            <p className="text-xs uppercase tracking-[0.3em] md:tracking-[0.4em] text-ivory/60 mb-2 md:mb-3 break-words">Reward Tiers</p>
            <div className="space-y-1 md:space-y-1.5 text-[0.65rem] md:text-xs text-ivory/70">
              <p className="break-words">
                <span className="text-flare">1 day</span> → Red Square
              </p>
              <p className="break-words">
                <span className="text-flare">2 days</span> → White on White
              </p>
              <p className="break-words">
                <span className="text-flare">3 days</span> → Black Circle
              </p>
              <p className="break-words">
                <span className="text-flare">4 days</span> → Suprematist
              </p>
            </div>
          </div>
        </div>

        {/* Staking Form - Show if user has NFTs but NOT staked */}
        {address &&
          !firstStakedToken &&
          (!stakedTokens || (Array.isArray(stakedTokens) && stakedTokens.length === 0)) &&
          ((nftBalance !== undefined && nftBalance !== null && Number(nftBalance) > 0) ||
            (hasMinted && selectedTokenId)) && (
          <form className="space-y-3 md:space-y-4" onSubmit={handleStake}>
            {/* Token ID is automatically determined, no input field needed */}
            {selectedTokenId && (
              <p className="text-xs uppercase tracking-[0.3em] md:tracking-[0.4em] text-ivory/60 break-words">
                Staking Token ID: <span className="text-flare">{selectedTokenId}</span>
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <StatusPill status={stakeStatus} label={stakeStatus.toUpperCase()} />
              <button
                type="submit"
                disabled={!selectedTokenId || isStaking || isStakeConfirming || isApproveConfirming || isSearchingToken}
                className="border border-flare/40 px-4 md:px-6 py-2 text-xs uppercase tracking-[0.3em] md:tracking-[0.4em] text-flare transition enabled:hover:border-flare enabled:hover:bg-flare/10 disabled:opacity-30 flex-shrink-0"
              >
                {isApproveConfirming ? 'Approving...' : isStaking ? 'Staking...' : 'Stake NFT'}
              </button>
            </div>

            {readableStakeError && <p className="text-sm text-flare">Error: {readableStakeError}</p>}
            {stakeHash && (
              <p className="text-xs text-ivory/70 break-all overflow-wrap-anywhere">
                Hash:{' '}
                <a
                  href={`${chain?.blockExplorers?.default?.url ?? 'https://sepolia.etherscan.io'}/tx/${stakeHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-flare underline break-all"
                >
                  {stakeHash.slice(0, 10)}...
                </a>
              </p>
            )}
          </form>
        )}

        {/* Staked NFT Info - Show if token is staked OR if we have staked tokens */}
        {(firstStakedToken !== undefined || (stakedTokens && Array.isArray(stakedTokens) && stakedTokens.length > 0)) && (
          <div className="border border-ivory/20 p-3 md:p-6 space-y-3 md:space-y-4">
            <div className="overflow-x-hidden">
              <p className="text-xs uppercase tracking-[0.3em] md:tracking-[0.4em] text-ivory/60 break-words">Staking Status</p>
              <p className="mt-1 text-sm text-ivory/70 break-words">
                Token ID: <span className="text-flare">{(firstStakedToken || (stakedTokens && stakedTokens[0]))?.toString() || 'Loading...'}</span>
              </p>
              <p className="mt-1 text-sm text-ivory/70 break-words">
                Staked for:{' '}
                <span className="text-flare">
                  {isStakingInfoLoading ? (
                    'Loading...'
                  ) : stakingDuration !== undefined ? (
                    formatDuration(stakingDuration)
                  ) : (
                    'Checking...'
                  )}
                </span>
              </p>
              <p className="mt-1 text-sm text-ivory/70 break-words">
                Next reward:{' '}
                <span className="text-flare">
                  {isStakingInfoLoading ? (
                    'Loading...'
                  ) : (
                    <>
                      {nextRewardInfo.reward}
                      {nextRewardInfo.timeRemaining && (
                        <span className="text-ivory/50"> ({nextRewardInfo.timeRemaining})</span>
                      )}
                    </>
                  )}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap gap-2 md:gap-3">
              {canClaimReward && (firstStakedToken || (stakedTokens && stakedTokens[0])) && (
                <button
                  onClick={() => handleClaimReward((firstStakedToken || stakedTokens![0])!)}
                  disabled={isClaiming || isClaimConfirming}
                  className="border border-flare/40 px-4 md:px-6 py-2 text-xs uppercase tracking-[0.3em] md:tracking-[0.4em] text-flare transition enabled:hover:border-flare enabled:hover:bg-flare/10 disabled:opacity-30 flex-shrink-0"
                >
                  Claim Reward
                </button>
              )}
              {(firstStakedToken || (stakedTokens && stakedTokens[0])) && (
                <button
                  onClick={() => handleUnstake((firstStakedToken || stakedTokens![0])!)}
                  disabled={isUnstaking || isUnstakeConfirming}
                  className="border border-ivory/40 px-4 md:px-6 py-2 text-xs uppercase tracking-[0.3em] md:tracking-[0.4em] text-ivory transition enabled:hover:border-ivory enabled:hover:bg-ivory/10 disabled:opacity-30 flex-shrink-0"
                >
                  Unstake
                </button>
              )}
            </div>

            {claimHash && (
              <p className="text-xs text-emerald-400">
                Reward claimed! Check your wallet for the new NFT.
              </p>
            )}
          </div>
        )}
      </div>
    </Panel>
  );
}

