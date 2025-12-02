// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {MalevichCollectionNFT} from "./MalevichCollectionNFT.sol";

/**
 * @title NFTStaking
 * @notice Allows users to stake BlackSquareNFT and earn reward NFTs from MalevichCollection
 * @dev Staking period determines which artwork type is rewarded
 */
contract NFTStaking is Ownable, ReentrancyGuard {
    IERC721 public immutable blackSquareNFT;
    MalevichCollectionNFT public immutable rewardNFT;
    
    // Staking period thresholds (in seconds)
    uint256 public constant DAY_1 = 1 days;      // 1 day -> Day 1 NFT
    uint256 public constant DAY_2 = 2 days;      // 2 days -> Day 2 NFT
    uint256 public constant DAY_3 = 3 days;       // 3 days -> Day 3 NFT
    uint256 public constant DAY_4 = 4 days;      // 4 days -> Day 4 NFT
    
    // Staking info for each token
    struct StakingInfo {
        address staker;
        uint256 stakedAt;
        bool isStaked;
        uint8 rewardsClaimedCount; // Track how many rewards have been claimed (0-4)
    }
    
    // Mapping from BlackSquareNFT tokenId to staking info
    mapping(uint256 => StakingInfo) public stakingInfo;
    
    // Mapping from staker address to array of staked token IDs
    mapping(address => uint256[]) public stakerTokens;
    
    // Mapping from staker to count of rewards claimed
    mapping(address => uint256) public rewardsClaimed;
    
    event NFTStaked(address indexed staker, uint256 indexed tokenId, uint256 timestamp);
    event NFTUnstaked(address indexed staker, uint256 indexed tokenId, uint256 timestamp);
    event RewardClaimed(
        address indexed staker,
        uint256 indexed tokenId,
        uint256 rewardTokenId,
        MalevichCollectionNFT.ArtworkType artworkType
    );
    
    constructor(
        address _blackSquareNFT,
        address _rewardNFT,
        address initialOwner
    ) Ownable(initialOwner) {
        require(_blackSquareNFT != address(0), "Invalid BlackSquareNFT address");
        require(_rewardNFT != address(0), "Invalid RewardNFT address");
        
        blackSquareNFT = IERC721(_blackSquareNFT);
        rewardNFT = MalevichCollectionNFT(_rewardNFT);
    }
    
    /**
     * @notice Stake a BlackSquareNFT
     * @param tokenId The token ID to stake
     */
    function stake(uint256 tokenId) external nonReentrant {
        require(blackSquareNFT.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(!stakingInfo[tokenId].isStaked, "Already staked");
        
        // Transfer NFT to this contract
        blackSquareNFT.transferFrom(msg.sender, address(this), tokenId);
        
        // Record staking info
        stakingInfo[tokenId] = StakingInfo({
            staker: msg.sender,
            stakedAt: block.timestamp,
            isStaked: true,
            rewardsClaimedCount: 0
        });
        
        // Add to staker's list
        stakerTokens[msg.sender].push(tokenId);
        
        emit NFTStaked(msg.sender, tokenId, block.timestamp);
    }
    
    /**
     * @notice Unstake a BlackSquareNFT and claim all eligible rewards
     * @param tokenId The token ID to unstake
     */
    function unstake(uint256 tokenId) external nonReentrant {
        StakingInfo memory info = stakingInfo[tokenId];
        require(info.isStaked, "Not staked");
        require(info.staker == msg.sender, "Not the staker");
        
        // Calculate staking duration
        uint256 stakingDuration = block.timestamp - info.stakedAt;
        
        // Mint all unclaimed eligible rewards when unstaking
        // Check each reward tier and mint if not yet claimed
        if (stakingDuration >= DAY_1 && info.rewardsClaimedCount == 0) {
            rewardNFT.mintReward(msg.sender, MalevichCollectionNFT.ArtworkType.RedSquare);
            rewardsClaimed[msg.sender]++;
        }
        if (stakingDuration >= DAY_2 && info.rewardsClaimedCount <= 1) {
            rewardNFT.mintReward(msg.sender, MalevichCollectionNFT.ArtworkType.WhiteOnWhite);
            rewardsClaimed[msg.sender]++;
        }
        if (stakingDuration >= DAY_3 && info.rewardsClaimedCount <= 2) {
            rewardNFT.mintReward(msg.sender, MalevichCollectionNFT.ArtworkType.BlackCircle);
            rewardsClaimed[msg.sender]++;
        }
        if (stakingDuration >= DAY_4 && info.rewardsClaimedCount <= 3) {
            rewardNFT.mintReward(msg.sender, MalevichCollectionNFT.ArtworkType.Suprematist);
            rewardsClaimed[msg.sender]++;
        }
        
        // Remove from staking
        delete stakingInfo[tokenId];
        _removeFromStakerList(msg.sender, tokenId);
        
        // Transfer NFT back to staker
        blackSquareNFT.transferFrom(address(this), msg.sender, tokenId);
        
        emit NFTUnstaked(msg.sender, tokenId, block.timestamp);
    }
    
    /**
     * @notice Claim the next available reward (one at a time)
     * @param tokenId The staked token ID
     */
    function claimReward(uint256 tokenId) external nonReentrant {
        StakingInfo storage info = stakingInfo[tokenId];
        require(info.isStaked, "Not staked");
        require(info.staker == msg.sender, "Not the staker");
        
        uint256 totalStakingDuration = block.timestamp - info.stakedAt;
        
        // Determine which reward should be claimed next based on staking duration and already claimed rewards
        MalevichCollectionNFT.ArtworkType rewardType;
        uint256 requiredDuration;
        
        if (info.rewardsClaimedCount == 0) {
            // First reward: Red Square (1 day)
            require(totalStakingDuration >= DAY_1, "Staking period too short for first reward");
            rewardType = MalevichCollectionNFT.ArtworkType.RedSquare;
            requiredDuration = DAY_1;
        } else if (info.rewardsClaimedCount == 1) {
            // Second reward: White on White (2 days)
            require(totalStakingDuration >= DAY_2, "Staking period too short for second reward");
            rewardType = MalevichCollectionNFT.ArtworkType.WhiteOnWhite;
            requiredDuration = DAY_2;
        } else if (info.rewardsClaimedCount == 2) {
            // Third reward: Black Circle (3 days)
            require(totalStakingDuration >= DAY_3, "Staking period too short for third reward");
            rewardType = MalevichCollectionNFT.ArtworkType.BlackCircle;
            requiredDuration = DAY_3;
        } else if (info.rewardsClaimedCount == 3) {
            // Fourth reward: Suprematist (4 days)
            require(totalStakingDuration >= DAY_4, "Staking period too short for fourth reward");
            rewardType = MalevichCollectionNFT.ArtworkType.Suprematist;
            requiredDuration = DAY_4;
        } else {
            revert("All rewards already claimed");
        }
        
        // Mint the reward
        uint256 rewardTokenId = rewardNFT.mintReward(msg.sender, rewardType);
        
        // Update claimed count
        info.rewardsClaimedCount++;
        rewardsClaimed[msg.sender]++;
        
        emit RewardClaimed(msg.sender, tokenId, rewardTokenId, rewardType);
    }
    
    /**
     * @notice Get staking info for a token
     * @param tokenId The token ID
     * @return staker The staker address
     * @return stakedAt The timestamp when staked
     * @return isStaked Whether the token is currently staked
     * @return stakingDuration Current staking duration in seconds
     */
    function getStakingInfo(uint256 tokenId)
        external
        view
        returns (
            address staker,
            uint256 stakedAt,
            bool isStaked,
            uint256 stakingDuration,
            uint8 rewardsClaimedCount
        )
    {
        StakingInfo memory info = stakingInfo[tokenId];
        staker = info.staker;
        stakedAt = info.stakedAt;
        isStaked = info.isStaked;
        stakingDuration = isStaked ? block.timestamp - info.stakedAt : 0;
        rewardsClaimedCount = info.rewardsClaimedCount;
    }
    
    /**
     * @notice Get all staked token IDs for a staker
     * @param staker The staker address
     * @return Array of staked token IDs
     */
    function getStakerTokens(address staker) external view returns (uint256[] memory) {
        return stakerTokens[staker];
    }
    
    /**
     * @notice Get the number of days staked
     * @param duration Staking duration in seconds
     * @return The number of days (1-4)
     */
    function getStakingDays(uint256 duration) external pure returns (uint256) {
        if (duration >= DAY_4) return 4;
        if (duration >= DAY_3) return 3;
        if (duration >= DAY_2) return 2;
        if (duration >= DAY_1) return 1;
        return 0;
    }
    
    /**
     * @notice Remove a token ID from staker's list
     * @param staker The staker address
     * @param tokenId The token ID to remove
     */
    function _removeFromStakerList(address staker, uint256 tokenId) private {
        uint256[] storage tokens = stakerTokens[staker];
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] == tokenId) {
                tokens[i] = tokens[tokens.length - 1];
                tokens.pop();
                break;
            }
        }
    }
}

