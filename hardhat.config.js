require("@nomiclabs/hardhat-waffle");

module.exports = {
  networks: {
    quorum: {
      url: "http://localhost:22001/", 
    }
  },
  solidity: "0.8.4",
  paths: {
    artifacts: "./src/backend/artifacts",
    sources: "./src/backend/contracts",
    cache: "./src/backend/cache",
    tests: "./src/backend/test"
  },
};
