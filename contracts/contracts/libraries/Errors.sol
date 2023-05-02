// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

library Errors {
    string internal constant TOKEN_NOT_TRANSFERABLE = "TokenNotTransferable";
    string internal constant LAST_CHALLENGE_FINISHED = "LastChallengeFinished";
    string internal constant LAST_CHALLENGE_NOT_FINISHED =
        "LastChallengeNotFinished";
    string internal constant STREAM_ALREADY_STARTED = "StreamAlreadyStarted";
    string internal constant STREAM_NOT_STARTED = "StreamNotStarted";
    string internal constant STREAM_ALREADY_FINISHED = "StreamAlreadyFinished";
}
