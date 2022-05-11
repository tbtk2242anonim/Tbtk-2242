const { ethers } = require("hardhat");

async function main() {

  const [deployer] = await ethers.getSigners();

  
  const pFactory = await ethers.getContractFactory("Product");
  const PContract = await pFactory.deploy();
  
  console.log("Deployer:", deployer.address);
  console.log("Deployer balance:", (await deployer.getBalance()).toString());
  console.log("Product Contract Address:", PContract.address);
  

  const bFactory = await ethers.getContractFactory("Bazaar");
  const BContract = await bFactory.deploy();

  console.log("Bazaar Contract Address:", BContract.address);
  
  // For each contract, pass the deployed contract and name to this function to save a copy of the contract ABI and address to the front end.
  saveFrontendFiles(PContract, "Product");
  saveFrontendFiles(BContract, "Bazaar");
}

function saveFrontendFiles(contract, name) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../../frontend/contractsData";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + `/${name}-address.json`,
    JSON.stringify({ address: contract.address }, undefined, 2)
  );

  const contractArtifact = artifacts.readArtifactSync(name);

  fs.writeFileSync(
    contractsDir + `/${name}.json`,
    JSON.stringify(contractArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
