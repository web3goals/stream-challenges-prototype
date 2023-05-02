import { expect } from "chai";
import { ERRORS } from "../../helpers/errors";
import { EVENTS } from "../../helpers/events";
import {
  challengeContract,
  makeSuiteCleanRoom,
  streamDescriptions,
  streamIdentifiers,
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
      challengeContract
        .connect(userOne)
        .startStream(streamIdentifiers.one, streamDescriptions.one)
    ).to.emit(challengeContract, EVENTS.streamStarted);
    // Try one by user two
    await expect(
      challengeContract
        .connect(userTwo)
        .startStream(streamIdentifiers.two, streamDescriptions.two)
    ).to.emit(challengeContract, EVENTS.streamStarted);
    // Try two by user two
    await expect(
      challengeContract
        .connect(userTwo)
        .startStream(streamIdentifiers.three, streamDescriptions.two)
    ).to.be.revertedWith(ERRORS.streamAlreadyStarted);
    // Check streams
    const streams = await challengeContract.getLastChallengeStreams();
    expect(streams.length).to.equal(2);
    // Check streamers
    const streamers = await challengeContract.getStreamers();
    expect(streamers.length).to.equal(2);
  });
});
