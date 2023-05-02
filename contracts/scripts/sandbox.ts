import { ethers } from "hardhat";
import { Challenge__factory, Profile__factory } from "../typechain-types";

async function main() {
  // Init account
  const accountWallet = new ethers.Wallet(
    process.env.PRIVATE_KEY_1 || "",
    ethers.provider
  );

  // Execute transaction
  const transaction = await Challenge__factory.connect(
    "0x75313820d3fF45469D735A7ea7355b251D84A333",
    accountWallet
  ).setDurationMinutes(15);
  console.log("Transaction result:", transaction);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
