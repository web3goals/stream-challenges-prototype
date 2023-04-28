import { expect } from "chai";
import { BigNumber } from "ethers";
import {
  makeSuiteCleanRoom,
  profileContract,
  profileUris,
  userOne,
  userOneAddress,
} from "../../setup";

makeSuiteCleanRoom("Profile Setting", function () {
  it("User should be able to set a token uri", async function () {
    await expect(
      profileContract.connect(userOne).setURI(profileUris.one)
    ).to.be.not.reverted;
    expect(await profileContract.balanceOf(userOneAddress)).to.equal(
      BigNumber.from(1)
    );
    expect(await profileContract.getURI(userOneAddress)).to.equal(
      profileUris.one
    );
  });

  it("User should to own only one token after several uri changes", async function () {
    // First change
    await expect(
      profileContract.connect(userOne).setURI(profileUris.one)
    ).to.be.not.reverted;
    expect(await profileContract.balanceOf(userOneAddress)).to.equal(
      BigNumber.from(1)
    );
    expect(await profileContract.getURI(userOneAddress)).to.equal(
      profileUris.one
    );
    // Second change
    await expect(
      profileContract.connect(userOne).setURI(profileUris.two)
    ).to.be.not.reverted;
    expect(await profileContract.balanceOf(userOneAddress)).to.equal(
      BigNumber.from(1)
    );
    expect(await profileContract.getURI(userOneAddress)).to.equal(
      profileUris.two
    );
  });
});
