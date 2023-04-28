// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

library Errors {
    error TokenNotTransferable();
    error LastChallengeFinished();
    error LastChallengeNotFinished();
    error StreamNotFound();
    error StreamAlreadyStarted();
    error StreamAlreadyFinished();
}