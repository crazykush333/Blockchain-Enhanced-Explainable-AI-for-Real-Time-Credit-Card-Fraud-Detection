const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env"), override: true });
require("@nomicfoundation/hardhat-ethers");

const { GANACHE_PRIVATE_KEY } = process.env;

if (!GANACHE_PRIVATE_KEY) {
  console.warn("⚠️ GANACHE_PRIVATE_KEY missing in .env — proceeding without preconfigured accounts.");
}

module.exports = {
  solidity: "0.8.19",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545", // Ganache RPC
      // Use env private key if provided; otherwise rely on node accounts
      accounts: GANACHE_PRIVATE_KEY ? [GANACHE_PRIVATE_KEY] : undefined,
    },
  },
};
