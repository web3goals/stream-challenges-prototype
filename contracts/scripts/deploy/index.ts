import hre, { ethers } from "hardhat";
import { Challenge__factory, Profile__factory } from "../../typechain-types";
import { contracts } from "./contracts";
import { deployWithLogs, upgradeProxyWithLogs } from "./utils";

async function main() {
  // Define chain
  const chain = hre.hardhatArguments.network;
  if (!chain) {
    console.log("\n❌ Chain is not defined");
    return;
  }
  console.log(`\n🌎 Running on chain '${chain}'`);

  // Define deployer wallet
  const deployerWallet = new ethers.Wallet(
    process.env.PRIVATE_KEY_1 || "",
    ethers.provider
  );

  // Define chain data
  const chainContracts = contracts[chain];
  if (!chainContracts) {
    console.log("\n❌ Chain contracts are undefined");
    return;
  }

  // Deploy or upgrade profile contract
  if (!chainContracts.profile.proxy) {
    const contract = await deployWithLogs({
      chainName: chain,
      contractName: chainContracts.profile.name,
      contractFactory: new Profile__factory(deployerWallet),
      isProxyRequired: chainContracts.profile.isUpgreadable,
      isInitializeRequired: chainContracts.profile.isInitializable,
    });
    chainContracts.profile.proxy = contract.address;
  } else if (
    chainContracts.profile.isUpgreadable &&
    !chainContracts.profile.impl
  ) {
    await upgradeProxyWithLogs(
      chain,
      chainContracts.profile.name,
      chainContracts.profile.proxy,
      new Profile__factory(deployerWallet)
    );
  }

  // Deploy or upgrade challenge contract
  if (!chainContracts.challenge.proxy) {
    const contract = await deployWithLogs({
      chainName: chain,
      contractName: chainContracts.challenge.name,
      contractFactory: new Challenge__factory(deployerWallet),
      isProxyRequired: chainContracts.challenge.isUpgreadable,
      isInitializeRequired: chainContracts.challenge.isInitializable,
    });
    chainContracts.challenge.proxy = contract.address;
  } else if (
    chainContracts.challenge.isUpgreadable &&
    !chainContracts.challenge.impl
  ) {
    await upgradeProxyWithLogs(
      chain,
      chainContracts.challenge.name,
      chainContracts.challenge.proxy,
      new Challenge__factory(deployerWallet)
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
