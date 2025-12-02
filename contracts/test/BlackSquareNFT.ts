import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('BlackSquareNFT', () => {
  async function deployFixture() {
    const [deployer, other] = await ethers.getSigners();
    const contract = await ethers.deployContract('BlackSquareNFT');
    await contract.waitForDeployment();

    return { contract, deployer, other };
  }

  it('mints a token and records state', async () => {
    const { contract, deployer } = await deployFixture();

    await expect(contract.connect(deployer).mint())
      .to.emit(contract, 'BlackSquareMinted')
      .withArgs(deployer.address, 1n);

    expect(await contract.balanceOf(deployer.address)).to.equal(1n);
    expect(await contract.hasMinted(deployer.address)).to.equal(true);
    expect(await contract.tokenURI(1n)).to.contain('data:application/json;base64');
  });

  it('blocks multiple mints from the same wallet', async () => {
    const { contract, deployer } = await deployFixture();
    await contract.mint();

    await expect(contract.mint()).to.be.revertedWith('Already minted');
    expect(await contract.balanceOf(deployer.address)).to.equal(1n);
  });

  it('allows independent wallets to mint', async () => {
    const { contract, other } = await deployFixture();
    await contract.mint();
    await expect(contract.connect(other).mint()).to.not.be.reverted;
    expect(await contract.balanceOf(other.address)).to.equal(1n);
  });
});

