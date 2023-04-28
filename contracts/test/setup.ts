import { Signer } from "ethers";
import { ethers } from "hardhat";
import {
  Challenge,
  Challenge__factory,
  Profile,
  Profile__factory,
} from "../typechain-types";
import { revertToSnapshot, takeSnapshot } from "./helpers/utils";

export const profileUris = {
  one: "ipfs://abc",
  two: "ipfs://def",
  three: "ipfs://123",
  four: "ipfs://456",
};

export const streamDescriptions = {
  one: "abc",
  two: "def",
  three: "123",
  four: "456",
};

export const streamUris = {
  one: "ipfs://abc",
  two: "ipfs://def",
  three: "ipfs://123",
  four: "ipfs://456",
};

export let accounts: Array<Signer>;
export let deployer: Signer;
export let userOne: Signer;
export let userTwo: Signer;
export let userThree: Signer;
export let userFour: Signer;

export let deployerAddress: string;
export let userOneAddress: string;
export let userTwoAddress: string;
export let userThreeAddress: string;
export let userFourAddress: string;

export let profileContract: Profile;
export let challengeContract: Challenge;

export function makeSuiteCleanRoom(name: string, tests: () => void) {
  return describe(name, () => {
    beforeEach(async function () {
      await takeSnapshot();
    });
    tests();
    afterEach(async function () {
      await revertToSnapshot();
    });
  });
}

export async function createProfiles() {
  await profileContract.connect(userOne).setURI(profileUris.one);
  await profileContract.connect(userTwo).setURI(profileUris.two);
  await profileContract.connect(userThree).setURI(profileUris.three);
  await profileContract.connect(userFour).setURI(profileUris.four);
}

before(async function () {
  // Init accounts
  accounts = await ethers.getSigners();
  deployer = accounts[0];
  userOne = accounts[1];
  userTwo = accounts[2];
  userThree = accounts[3];
  userFour = accounts[4];

  // Init addresses
  deployerAddress = await deployer.getAddress();
  userOneAddress = await userOne.getAddress();
  userTwoAddress = await userTwo.getAddress();
  userThreeAddress = await userThree.getAddress();
  userFourAddress = await userFour.getAddress();

  // Deploy profile contract
  profileContract = await new Profile__factory(deployer).deploy();
  await profileContract.initialize();

  // Deploy challenge contract
  challengeContract = await new Challenge__factory(deployer).deploy();
  await challengeContract.initialize();
});
