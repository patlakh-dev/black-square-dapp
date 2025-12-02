import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);
  console.log('Account balance:', (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy MalevichCollectionNFT first
  console.log('\nDeploying MalevichCollectionNFT...');
  const rewardNFT = await ethers.deployContract('MalevichCollectionNFT', [deployer.address]);
  await rewardNFT.waitForDeployment();
  const rewardNFTAddress = await rewardNFT.getAddress();
  console.log(`MalevichCollectionNFT deployed to: ${rewardNFTAddress}`);

  // Get BlackSquareNFT address from environment or use existing
  const blackSquareAddress = process.env.BLACK_SQUARE_ADDRESS;
  if (!blackSquareAddress) {
    console.error('Error: BLACK_SQUARE_ADDRESS environment variable not set');
    console.log('Please set BLACK_SQUARE_ADDRESS to the deployed BlackSquareNFT address');
    process.exitCode = 1;
    return;
  }

  console.log(`Using BlackSquareNFT at: ${blackSquareAddress}`);

  // Deploy NFTStaking
  console.log('\nDeploying NFTStaking...');
  const staking = await ethers.deployContract('NFTStaking', [
    blackSquareAddress,
    rewardNFTAddress,
    deployer.address,
  ]);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log(`NFTStaking deployed to: ${stakingAddress}`);

  // Transfer ownership of reward NFT to staking contract
  console.log('\nTransferring MalevichCollectionNFT ownership to NFTStaking...');
  await rewardNFT.transferOwnership(stakingAddress);
  console.log('Ownership transferred successfully');

  console.log('\n=== Deployment Summary ===');
  console.log('MalevichCollectionNFT:', rewardNFTAddress);
  console.log('NFTStaking:', stakingAddress);
  console.log('BlackSquareNFT:', blackSquareAddress);
  console.log('\nAdd these to your frontend .env:');
  console.log(`VITE_MALEVICH_COLLECTION_ADDRESS=${rewardNFTAddress}`);
  console.log(`VITE_NFT_STAKING_ADDRESS=${stakingAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

