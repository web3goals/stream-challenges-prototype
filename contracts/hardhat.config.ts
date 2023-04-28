import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";

dotenv.config();

const accounts = [];
if (process.env.PRIVATE_KEY_1) {
  accounts.push(process.env.PRIVATE_KEY_1);
}
if (process.env.PRIVATE_KEY_2) {
  accounts.push(process.env.PRIVATE_KEY_2);
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hyperspace: {
      chainId: 3141,
      url: process.env.RPC_URL_HYPERSPACE || "",
      accounts: accounts,
    },
    filecoin: {
      chainId: 314,
      url: process.env.RPC_URL_FILECOIN || "",
      accounts: accounts,
    },
  },
};

export default config;
