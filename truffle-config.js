const path = require("path");

console.log("Using Solidity version: 0.8.18");

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
    },
  },

  compilers: {
    solc: {
      version: "0.8.18", // Fetch exact version from solc-bin
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },

  obtain: {
    solc: {
      version: "0.8.18",
    },
  },
};
