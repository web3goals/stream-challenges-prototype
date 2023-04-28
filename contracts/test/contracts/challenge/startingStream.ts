import { expect } from "chai";
import { ERRORS } from "../../helpers/errors";
import { EVENTS } from "../../helpers/events";
import {
  challengeContract,
  makeSuiteCleanRoom,
  streamDescriptions,
  userOne,
  userTwo,
} from "../../setup";

makeSuiteCleanRoom("Challenge Stream Starting", function () {
  beforeEach(async function () {
    await challengeContract.connect(userOne).startChallenge();
  });

  it("Users should be able to start a challenge stream", async function () {
    // Try one by user one
    await expect(
      challengeContract.connect(userOne).startStream(streamDescriptions.one)
    ).to.emit(challengeContract, EVENTS.streamStarted);
    // Try one by user two
    await expect(
      challengeContract.connect(userTwo).startStream(streamDescriptions.two)
    ).to.emit(challengeContract, EVENTS.streamStarted);
    // Try two by user two
    await expect(
      challengeContract.connect(userTwo).startStream(streamDescriptions.two)
    ).to.be.revertedWithCustomError(
      challengeContract,
      ERRORS.streamAlreadyStarted
    );
    // Check streams
    const streams = await challengeContract.getLastChallengeStreams();
    expect(streams.length).to.equal(2);
    // Check streamers
    const streamers = await challengeContract.getStreamers();
    expect(streamers.length).to.equal(2);
  });
});
