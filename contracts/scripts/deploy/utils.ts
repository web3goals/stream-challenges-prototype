import { Contract, ContractFactory } from "ethers";
import { upgrades } from "hardhat";

export async function deployWithLogs(args: {
  chainName: string;
  contractName: string;
  contractFactory: ContractFactory;
  contractConstructorArgs?: Array<any>;
  contractInitializeArgs?: Array<any>;
  isProxyRequired?: boolean;
  isInitializeRequired?: boolean;
}): Promise<Contract> {
  let contract;
  // Deploy with proxy
  if (args.isProxyRequired) {
    console.log(`\n👟 Start deploy '${args.contractName}' contract with proxy`);
    contract = await upgrades.deployProxy(
      args.contractFactory,
      args.contractInitializeArgs,
      {
        timeout: 180000,
      }
    );
    await contract.deployed();
    console.log("✅ Contract deployed to " + contract.address);
    console.log("⚠️ Do not forget update contracts that use this contract");
  }
  // Deploy without proxy
  else {
    console.log(`\n👟 Start deploy '${args.contractName}' contract`);
    if (args.contractConstructorArgs) {
      contract = await args.contractFactory.deploy(
        ...args.contractConstructorArgs
      );
    } else {
      contract = await args.contractFactory.deploy();
    }
    await contract.deployed();
    console.log("✅ Contract deployed to " + contract.address);
    console.log("⚠️ Do not forget update contracts that use this contract");
    // Use initialize function
    if (args.isInitializeRequired) {
      if (args.contractInitializeArgs) {
        await contract.initialize(...args.contractInitializeArgs);
      } else {
        await contract.initialize();
      }
      console.log("👌 Contract initialized");
    }
  }
  if (args.contractConstructorArgs) {
    console.log(
      "👉 Command for vefifying: " +
        `npx hardhat verify --network ${args.chainName} ${
          contract.address
        } ${args.contractConstructorArgs.join(" ")}`
    );
  } else {
    console.log(
      "👉 Command for vefifying: " +
        `npx hardhat verify --network ${args.chainName} ${contract.address}`
    );
  }

  return contract;
}

export async function upgradeProxyWithLogs(
  chainName: string,
  contractName: string,
  contractAddress: string,
  contractFactory: ContractFactory
): Promise<Contract> {
  console.log(`\n👟 Start upgrade ${contractName} contract`);
  const contract = await upgrades.upgradeProxy(
    contractAddress,
    contractFactory
  );
  await contract.deployed();
  console.log("✅ Contract upgraded");
  console.log(
    "👉 Command for vefifying: " +
      `npx hardhat verify --network ${chainName} ${contract.address}`
  );
  return contract;
}
