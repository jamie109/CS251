const hre = require("hardhat");

async function main() {
  const ExchangeContract = await hre.ethers.getContractFactory("TokenExchange");
  const exchangeContract = await ExchangeContract.deploy();
  await exchangeContract.deployed();
  console.log(`Finished writing exchange contract address: ${exchangeContract.address}`);
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
