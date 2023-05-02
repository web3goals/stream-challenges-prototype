import {
  challengeContract,
  makeSuiteCleanRoom,
  streamDescriptions,
  streamIdentifiers,
  streamUris,
  userOne,
  userTwo,
} from "../../setup";
import { expect } from "chai";
import { EVENTS } from "../../helpers/events";
import { ERRORS } from "../../helpers/errors";

makeSuiteCleanRoom("Challenge Stream Finishing", function () {
  beforeEach(async function () {
    await challengeContract.connect(userOne).startChallenge();
    await challengeContract
      .connect(userOne)
      .startStream(streamIdentifiers.one, streamDescriptions.one);
    await challengeContract
      .connect(userTwo)
      .startStream(streamIdentifiers.two, streamDescriptions.two);
  });

  it("Users should be able to finish a challenge stream", async function () {
    // Try one by user one
    await expect(
      challengeContract.connect(userOne).finishStream(streamUris.one)
    ).to.emit(challengeContract, EVENTS.streamFinished);
    // Try two by user one
    await expect(
      challengeContract.connect(userOne).finishStream(streamUris.one)
    ).to.be.revertedWith(ERRORS.streamAlreadyFinished);
    // Check streamers
    const streamers = await challengeContract.getStreamers();
    expect(streamers.length).to.equal(2);
    expect(streamers[0].successfulStreams).to.equal(1);
    expect(streamers[1].successfulStreams).to.equal(0);
  });
});
