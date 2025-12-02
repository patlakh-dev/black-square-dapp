import { ethers } from 'hardhat';

async function main() {
  const contract = await ethers.deployContract('BlackSquareNFT');
  await contract.waitForDeployment();

  console.log(`BlackSquareNFT deployed to ${await contract.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

