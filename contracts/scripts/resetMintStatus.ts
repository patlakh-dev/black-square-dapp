import { ethers } from 'hardhat';

async function main() {
  const blackSquareAddress = process.env.BLACK_SQUARE_ADDRESS;
  if (!blackSquareAddress) {
    console.error('Error: BLACK_SQUARE_ADDRESS environment variable not set');
    process.exitCode = 1;
    return;
  }

  const testAddress = '0x6B4119eaeC4D4c77D55137ad5D90EC0c3E855e39';
  
  const [deployer] = await ethers.getSigners();
  console.log('Using account:', deployer.address);
  console.log('Account balance:', (await ethers.provider.getBalance(deployer.address)).toString());

  const blackSquare = await ethers.getContractAt('BlackSquareNFT', blackSquareAddress);
  
  // Check if deployer is owner
  const owner = await blackSquare.owner();
  if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
    console.error('Error: Deployer is not the owner of the contract');
    console.log('Contract owner:', owner);
    process.exitCode = 1;
    return;
  }

  console.log(`\nResetting mint status for: ${testAddress}`);
  
  const tx = await blackSquare.resetMintStatus(testAddress);
  console.log('Transaction hash:', tx.hash);
  
  await tx.wait();
  console.log('✅ Mint status reset successfully!');
  
  // Verify
  const hasMinted = await blackSquare.hasMinted(testAddress);
  console.log(`Has minted status: ${hasMinted} (should be false)`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

