import { expect } from 'chai';
import { ethers } from 'hardhat';
import { time } from '@nomicfoundation/hardhat-network-helpers';

describe('NFTStaking', () => {
  async function deployFixture() {
    const [deployer, staker, other] = await ethers.getSigners();

    // Deploy BlackSquareNFT
    const blackSquareNFT = await ethers.deployContract('BlackSquareNFT');
    await blackSquareNFT.waitForDeployment();

    // Deploy MalevichCollectionNFT
    const rewardNFT = await ethers.deployContract('MalevichCollectionNFT', [deployer.address]);
    await rewardNFT.waitForDeployment();

    // Deploy NFTStaking
    const staking = await ethers.deployContract('NFTStaking', [
      await blackSquareNFT.getAddress(),
      await rewardNFT.getAddress(),
      deployer.address,
    ]);
    await staking.waitForDeployment();

    // Transfer ownership of reward NFT to staking contract
    await rewardNFT.transferOwnership(await staking.getAddress());

    // Mint BlackSquareNFT for staker
    await blackSquareNFT.connect(staker).mint();
    const tokenId = 1n;

    return {
      blackSquareNFT,
      rewardNFT,
      staking,
      deployer,
      staker,
      other,
      tokenId,
    };
  }

  describe('Deployment', () => {
    it('should deploy all contracts correctly', async () => {
      const { blackSquareNFT, rewardNFT, staking } = await deployFixture();
      expect(await blackSquareNFT.getAddress()).to.be.properAddress;
      expect(await rewardNFT.getAddress()).to.be.properAddress;
      expect(await staking.getAddress()).to.be.properAddress;
    });

    it('should set correct staking periods', async () => {
      const { staking } = await deployFixture();
      expect(await staking.SHORT_STAKE_PERIOD()).to.equal(7 * 24 * 60 * 60);
      expect(await staking.MEDIUM_STAKE_PERIOD()).to.equal(30 * 24 * 60 * 60);
      expect(await staking.LONG_STAKE_PERIOD()).to.equal(90 * 24 * 60 * 60);
      expect(await staking.ULTRA_STAKE_PERIOD()).to.equal(180 * 24 * 60 * 60);
    });
  });

  describe('Staking', () => {
    it('should allow staking a BlackSquareNFT', async () => {
      const { blackSquareNFT, staking, staker, tokenId } = await deployFixture();

      await blackSquareNFT.connect(staker).approve(await staking.getAddress(), tokenId);
      await expect(staking.connect(staker).stake(tokenId))
        .to.emit(staking, 'NFTStaked')
        .withArgs(staker.address, tokenId, await time.latest());

      expect(await blackSquareNFT.ownerOf(tokenId)).to.equal(await staking.getAddress());
      const info = await staking.getStakingInfo(tokenId);
      expect(info.staker).to.equal(staker.address);
      expect(info.isStaked).to.be.true;
    });

    it('should prevent staking if not owner', async () => {
      const { staking, other, tokenId } = await deployFixture();
      await expect(staking.connect(other).stake(tokenId)).to.be.revertedWith('Not the owner');
    });

    it('should prevent double staking', async () => {
      const { blackSquareNFT, staking, staker, tokenId } = await deployFixture();

      await blackSquareNFT.connect(staker).approve(await staking.getAddress(), tokenId);
      await staking.connect(staker).stake(tokenId);

      // Try to stake again (but token is now owned by staking contract)
      await expect(staking.connect(staker).stake(tokenId)).to.be.reverted;
    });
  });

  describe('Unstaking', () => {
    it('should allow unstaking after minimum period and mint reward', async () => {
      const { blackSquareNFT, rewardNFT, staking, staker, tokenId } = await deployFixture();

      // Stake
      await blackSquareNFT.connect(staker).approve(await staking.getAddress(), tokenId);
      await staking.connect(staker).stake(tokenId);

      // Fast forward 7 days
      await time.increase(7 * 24 * 60 * 60 + 1);

      // Unstake
      await expect(staking.connect(staker).unstake(tokenId))
        .to.emit(staking, 'NFTUnstaked')
        .to.emit(staking, 'RewardClaimed');

      // NFT should be back with staker
      expect(await blackSquareNFT.ownerOf(tokenId)).to.equal(staker.address);

      // Should have received reward NFT
      expect(await rewardNFT.balanceOf(staker.address)).to.equal(1n);
    });

    it('should not mint reward if staking period too short', async () => {
      const { blackSquareNFT, rewardNFT, staking, staker, tokenId } = await deployFixture();

      await blackSquareNFT.connect(staker).approve(await staking.getAddress(), tokenId);
      await staking.connect(staker).stake(tokenId);

      // Fast forward only 6 days
      await time.increase(6 * 24 * 60 * 60);

      await staking.connect(staker).unstake(tokenId);

      // Should not have received reward
      expect(await rewardNFT.balanceOf(staker.address)).to.equal(0n);
    });

    it('should mint correct artwork type based on staking period', async () => {
      const { blackSquareNFT, rewardNFT, staking, staker, tokenId } = await deployFixture();

      await blackSquareNFT.connect(staker).approve(await staking.getAddress(), tokenId);
      await staking.connect(staker).stake(tokenId);

      // Fast forward 30 days (should get White on White)
      await time.increase(30 * 24 * 60 * 60 + 1);

      await staking.connect(staker).unstake(tokenId);

      const rewardBalance = await rewardNFT.balanceOf(staker.address);
      expect(rewardBalance).to.equal(1n);

      // Check artwork type (tokenId starts at 1)
      const artworkType = await rewardNFT.getArtworkType(1n);
      // WhiteOnWhite = 1
      expect(artworkType).to.equal(1n);
    });
  });

  describe('Reward Claiming', () => {
    it('should allow claiming reward without unstaking', async () => {
      const { blackSquareNFT, rewardNFT, staking, staker, tokenId } = await deployFixture();

      await blackSquareNFT.connect(staker).approve(await staking.getAddress(), tokenId);
      await staking.connect(staker).stake(tokenId);

      // Fast forward 7 days
      await time.increase(7 * 24 * 60 * 60 + 1);

      await expect(staking.connect(staker).claimReward(tokenId))
        .to.emit(staking, 'RewardClaimed');

      // Should have reward but NFT still staked
      expect(await rewardNFT.balanceOf(staker.address)).to.equal(1n);
      expect(await blackSquareNFT.ownerOf(tokenId)).to.equal(await staking.getAddress());
    });

    it('should reset staking time after claiming', async () => {
      const { blackSquareNFT, staking, staker, tokenId } = await deployFixture();

      await blackSquareNFT.connect(staker).approve(await staking.getAddress(), tokenId);
      await staking.connect(staker).stake(tokenId);

      const initialStakeTime = await time.latest();
      await time.increase(7 * 24 * 60 * 60 + 1);

      await staking.connect(staker).claimReward(tokenId);

      const info = await staking.getStakingInfo(tokenId);
      // Staking time should be reset (approximately current time)
      expect(info.stakedAt).to.be.greaterThan(initialStakeTime);
    });
  });

  describe('View Functions', () => {
    it('should return correct staking info', async () => {
      const { blackSquareNFT, staking, staker, tokenId } = await deployFixture();

      await blackSquareNFT.connect(staker).approve(await staking.getAddress(), tokenId);
      await staking.connect(staker).stake(tokenId);

      const info = await staking.getStakingInfo(tokenId);
      expect(info.staker).to.equal(staker.address);
      expect(info.isStaked).to.be.true;
      expect(info.stakingDuration).to.be.greaterThan(0n);
    });

    it('should return staker tokens', async () => {
      const { blackSquareNFT, staking, staker, tokenId } = await deployFixture();

      await blackSquareNFT.connect(staker).approve(await staking.getAddress(), tokenId);
      await staking.connect(staker).stake(tokenId);

      const tokens = await staking.getStakerTokens(staker.address);
      expect(tokens.length).to.equal(1);
      expect(tokens[0]).to.equal(tokenId);
    });
  });
});

