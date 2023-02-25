const hre = require("hardhat");

async function main() {
  const TokenContract = await hre.ethers.getContractFactory("Token");
  const tokenContract = await TokenContract.deploy();
  await tokenContract.deployed();
  console.log(`Finished writing exchange contract address: ${tokenContract.address}`);
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
